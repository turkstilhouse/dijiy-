import { AgentContract, Capability, ExecutionCheckpoint, ExecutionState, ResourceUsage, TaskContract } from "./contracts";
import { AIControlPlane } from "./control-plane";

export interface ExecutionResult {
 taskId:string; state:ExecutionState; output?:unknown; correlationId?:string;
 usage?:Partial<ResourceUsage>; error?:string; checkpoint?:ExecutionCheckpoint;
}

export interface ExecutionHandler {
 execute(
  task:TaskContract, agent:AgentContract, capability:Capability,
  context:{
   executionId:string; attempt:number; signal:AbortSignal;
   onWaiting:(state:"WAITING_TOOL"|"WAITING_EXTERNAL",checkpoint?:Partial<ExecutionCheckpoint>)=>Promise<void>;
  }
 ):Promise<{output:unknown;usage?:Partial<ResourceUsage>;waiting?:"WAITING_TOOL"|"WAITING_EXTERNAL";checkpoint?:Partial<ExecutionCheckpoint>}>;
}

export class ExecutionEngine {
 constructor(private readonly handler:ExecutionHandler){}

 async run(control:AIControlPlane,task:TaskContract,agent:AgentContract,capability:Capability):Promise<ExecutionResult>{
  const executionId="exec_"+task.id;
  const startedAt=Date.now();
  const current=control.state.current();
  const idempotencyKey=task.idempotencyKey??executionId;

  try{
   const existing=await control.persistence.getIdempotency(idempotencyKey);
   if(existing?.status==="COMPLETED"){
    const checkpoint=await control.persistence.loadCheckpoint(executionId);
    return{taskId:task.id,state:"COMPLETED",output:checkpoint?.output,correlationId:executionId,checkpoint};
   }
   if(existing?.status==="IN_PROGRESS"){
    return{taskId:task.id,state:"FAILED",correlationId:executionId,error:"Idempotency key is already in progress"};
   }
   await control.persistence.saveTask(task,executionId);
   await control.audit.append({
    id:"audit_"+executionId+"_started",taskId:task.id,actorId:task.requestedBy,
    action:"EXECUTION_STARTED",state:current,timestamp:new Date().toISOString(),metadata:{executionId}
   });

   control.killSwitch.assertRunning();
   const decision=control.authorize(agent,capability);
   await control.audit.append({
    id:"audit_"+executionId+"_policy",taskId:task.id,actorId:task.requestedBy,
    action:"POLICY_DECISION",state:control.state.current(),timestamp:new Date().toISOString(),
    metadata:{allowed:decision.allowed,approvalRequired:decision.approvalRequired,reasons:decision.reasons}
   });

   if(!decision.allowed){
    if(!["FAILED","CANCELLED"].includes(control.state.current()))control.state.transition("FAILED");
    await control.persistence.saveCheckpoint({
     executionId,taskId:task.id,state:"FAILED",attempt:1,updatedAt:new Date().toISOString(),
     output:{error:decision.reasons}
    });
    await control.persistence.saveIdempotency({
     key:idempotencyKey,taskId:task.id,operation:"execution",status:"FAILED"
    });
    await control.audit.append({
     id:"audit_"+executionId+"_denied",taskId:task.id,actorId:task.requestedBy,
     action:"EXECUTION_DENIED",state:"FAILED",timestamp:new Date().toISOString(),
     metadata:{reasons:decision.reasons}
    });
    return{taskId:task.id,state:"FAILED",correlationId:executionId,error:decision.reasons.join(",")};
   }

   if(decision.approvalRequired){
    if(current!=="POLICY_CHECK")throw new Error("Execution requires POLICY_CHECK before approval");
    control.state.transition("APPROVAL_REQUIRED");
    const cp:ExecutionCheckpoint={
     executionId,taskId:task.id,state:"APPROVAL_REQUIRED",attempt:1,updatedAt:new Date().toISOString()
    };
    await control.persistence.saveCheckpoint(cp);
    await control.audit.append({
     id:"audit_"+executionId+"_approval",taskId:task.id,actorId:task.requestedBy,
     action:"APPROVAL_REQUIRED",state:"APPROVAL_REQUIRED",timestamp:new Date().toISOString(),
     metadata:{riskClass:task.riskClass}
    });
    return{taskId:task.id,state:"APPROVAL_REQUIRED",correlationId:executionId,checkpoint:cp};
   }

   if(current!=="POLICY_CHECK"&&current!=="APPROVED"){
    throw new Error("Execution not ready: current="+current);
   }
   control.state.transition("EXECUTING");
   await control.persistence.saveCheckpoint({
    executionId,taskId:task.id,state:"EXECUTING",attempt:1,updatedAt:new Date().toISOString()
   });

   await control.persistence.saveIdempotency({
    key:idempotencyKey,taskId:task.id,operation:"execution",status:"IN_PROGRESS"
   });
   control.governor.reserve({modelCalls:1});
   const controller=new AbortController();
   const deadline=Math.min(
    task.deadlineAt?Math.max(0,new Date(task.deadlineAt).getTime()-Date.now()):Number.MAX_SAFE_INTEGER,
    agent.maxRuntimeMs,task.budget.maxRuntimeMs
   );
   const timer=Number.isFinite(deadline)&&deadline!==Number.MAX_SAFE_INTEGER
    ?setTimeout(()=>controller.abort(),deadline):undefined;

   const result=await this.handler.execute(task,agent,capability,{
    executionId,attempt:1,signal:controller.signal,
    onWaiting:async(state,checkpoint={})=>{
     if(control.state.current()!=="EXECUTING")throw new Error("Execution is not running");
     control.state.transition(state);
     await control.persistence.saveCheckpoint({
      executionId,taskId:task.id,state,attempt:1,updatedAt:new Date().toISOString(),...checkpoint
     });
    }
   });

   if(timer)clearTimeout(timer);
   control.killSwitch.assertRunning();

   const runtimeMs=Date.now()-startedAt;
   control.governor.reserve({...result.usage,runtimeMs});

   if(result.waiting){
    const cp:ExecutionCheckpoint={
     executionId,taskId:task.id,state:result.waiting,attempt:1,updatedAt:new Date().toISOString(),...result.checkpoint
    };
    await control.persistence.saveCheckpoint(cp);
    await control.audit.append({
     id:"audit_"+executionId+"_waiting_"+result.waiting.toLowerCase(),taskId:task.id,
     actorId:task.requestedBy,action:"EXECUTION_WAITING",state:result.waiting,
     timestamp:new Date().toISOString(),metadata:{executionId,checkpoint:result.checkpoint??{}}
    });
    return{taskId:task.id,state:result.waiting,correlationId:executionId,usage:result.usage,checkpoint:cp};
   }

   if(control.state.current()==="WAITING_TOOL"||control.state.current()==="WAITING_EXTERNAL"){
    throw new Error("Pending execution state was not resolved");
   }

   control.state.transition("OBSERVING");
   control.state.transition("EVALUATING");
   control.state.transition("COMPLETED");

   const completedCheckpoint:ExecutionCheckpoint={
    executionId,taskId:task.id,state:"COMPLETED",attempt:1,updatedAt:new Date().toISOString(),output:result.output
   };
   await control.persistence.saveCheckpoint(completedCheckpoint);
   await control.persistence.saveIdempotency({
    key:idempotencyKey,taskId:task.id,operation:"execution",status:"COMPLETED"
   });
   await control.audit.append({
    id:"audit_"+executionId+"_completed",taskId:task.id,actorId:task.requestedBy,
    action:"EXECUTION_COMPLETED",state:"COMPLETED",timestamp:new Date().toISOString(),
    metadata:{runtimeMs,usage:result.usage??{}}
   });

   return{taskId:task.id,state:"COMPLETED",output:result.output,usage:result.usage,correlationId:executionId};
  }catch(error){
   const message=error instanceof Error?error.message:String(error);
   try{
    if(!["COMPLETED","FAILED","CANCELLED"].includes(control.state.current()))control.state.transition("FAILED");
   }catch{}
   try{
    await control.persistence.saveCheckpoint({
     executionId,taskId:task.id,state:"FAILED",attempt:1,updatedAt:new Date().toISOString(),output:{error:message}
    });
    await control.persistence.saveIdempotency({
     key:idempotencyKey,taskId:task.id,operation:"execution",status:"FAILED"
    });
    await control.audit.append({
     id:"audit_"+executionId+"_failed",taskId:task.id,actorId:task.requestedBy,
     action:"EXECUTION_FAILED",state:"FAILED",timestamp:new Date().toISOString(),metadata:{error:message}
    });
   }catch{}
   return{taskId:task.id,state:"FAILED",correlationId:executionId,error:message};
  }
 }
}
