import { AgentContract, Capability, ExecutionCheckpoint, ExecutionState, ResourceUsage, TaskContract } from "./contracts";
import { AIControlPlane } from "./control-plane";
export interface ExecutionResult {taskId:string;state:ExecutionState;output?:unknown;correlationId?:string;usage?:Partial<ResourceUsage>;error?:string;checkpoint?:ExecutionCheckpoint;}
export interface ExecutionHandler {
 execute(task:TaskContract,agent:AgentContract,capability:Capability,context:{executionId:string;attempt:number;signal:AbortSignal;onWaiting:(state:"WAITING_TOOL"|"WAITING_EXTERNAL",checkpoint?:Partial<ExecutionCheckpoint>)=>Promise<void>}):Promise<{output:unknown;usage?:Partial<ResourceUsage>;waiting?: "WAITING_TOOL"|"WAITING_EXTERNAL";checkpoint?:Partial<ExecutionCheckpoint>}>;
}
export class ExecutionEngine {
 constructor(private readonly handler:ExecutionHandler){}
 async run(control:AIControlPlane,task:TaskContract,agent:AgentContract,capability:Capability):Promise<ExecutionResult>{
  const executionId="exec_"+task.id+"_"+Date.now(),startedAt=Date.now(),current=control.state.current();
  try{
   control.killSwitch.assertRunning();const decision=control.authorize(agent,capability);
   if(!decision.allowed){if(!["FAILED","CANCELLED"].includes(current))control.state.transition("FAILED");return{taskId:task.id,state:"FAILED",correlationId:executionId,error:decision.reasons.join(",")};}
   if(decision.approvalRequired){if(current!=="POLICY_CHECK")throw new Error("Execution requires POLICY_CHECK before approval");control.state.transition("APPROVAL_REQUIRED");return{taskId:task.id,state:"APPROVAL_REQUIRED",correlationId:executionId};}
   if(current==="POLICY_CHECK"||current==="APPROVED")control.state.transition("EXECUTING");else throw new Error("Execution not ready: current="+current);
   control.governor.reserve({modelCalls:1});
   const controller=new AbortController();
   const deadline=Math.min(task.deadlineAt?Math.max(0,new Date(task.deadlineAt).getTime()-Date.now()):Number.MAX_SAFE_INTEGER,agent.maxRuntimeMs,task.budget.maxRuntimeMs);
   const timer=Number.isFinite(deadline)&&deadline!==Number.MAX_SAFE_INTEGER?setTimeout(()=>controller.abort(),deadline):undefined;
   const result=await this.handler.execute(task,agent,capability,{executionId,attempt:1,signal:controller.signal,onWaiting:async(state,checkpoint={})=>{
    if(control.state.current()!=="EXECUTING")throw new Error("Execution is not running");
    control.state.transition(state);await control.persistence.saveCheckpoint({executionId,taskId:task.id,state,attempt:1,updatedAt:new Date().toISOString(),...checkpoint});
   }});
   if(timer)clearTimeout(timer);control.killSwitch.assertRunning();
   const runtimeMs=Date.now()-startedAt;control.governor.reserve({...result.usage,runtimeMs});
   if(result.waiting){const cp={executionId,taskId:task.id,state:result.waiting,attempt:1,updatedAt:new Date().toISOString(),...result.checkpoint};await control.persistence.saveCheckpoint(cp);return{taskId:task.id,state:result.waiting,correlationId:executionId,usage:result.usage,checkpoint:cp};}
   if(control.state.current()==="WAITING_TOOL"||control.state.current()==="WAITING_EXTERNAL")throw new Error("Pending execution state was not resolved");
   control.state.transition("OBSERVING");control.state.transition("EVALUATING");control.state.transition("COMPLETED");
   return{taskId:task.id,state:"COMPLETED",output:result.output,usage:result.usage,correlationId:executionId};
  }catch(error){try{if(!["COMPLETED","FAILED","CANCELLED"].includes(control.state.current()))control.state.transition("FAILED");}catch{}return{taskId:task.id,state:"FAILED",correlationId:executionId,error:error instanceof Error?error.message:String(error)};}
 }
}
