import { AgentContract, Capability, ExecutionCheckpoint, ExecutionPersistence, IdempotencyRecord, TaskContract } from "./contracts";
import { EvidenceVerifier, VerificationResult } from "./evidence-verifier";
import { ExecutionStateMachine } from "./execution-state";
import { KillSwitch } from "./kill-switch";
import { PolicyGate } from "./policy-gate";
import { ResourceGovernor } from "./resource-governor";
import { MemoryAuditSink, AuditSink } from "./audit";

export class MemoryExecutionPersistence implements ExecutionPersistence {
 private readonly checkpoints=new Map<string,ExecutionCheckpoint>();
 private readonly idempotency=new Map<string,IdempotencyRecord>();
 async saveTask(task:TaskContract,executionId:string){this.checkpoints.set(executionId,Object.freeze({executionId,taskId:task.id,state:task.state,attempt:0,updatedAt:new Date().toISOString()}));}
 async saveCheckpoint(c:ExecutionCheckpoint){this.checkpoints.set(c.executionId,Object.freeze({...c}));}
 async loadCheckpoint(id:string){return this.checkpoints.get(id);}
 async getIdempotency(key:string){return this.idempotency.get(key);}
 async saveIdempotency(r:IdempotencyRecord){this.idempotency.set(r.key,Object.freeze({...r}));}
}
export class AIControlPlane {
 readonly state:ExecutionStateMachine; readonly governor:ResourceGovernor; readonly killSwitch:KillSwitch;
 readonly policy:PolicyGate; readonly verifier:EvidenceVerifier; readonly persistence:ExecutionPersistence; readonly audit:AuditSink;
 constructor(private readonly task:TaskContract,budget:ResourceGovernor,state=new ExecutionStateMachine(task.state),killSwitch=new KillSwitch(),policy=new PolicyGate(),verifier=new EvidenceVerifier(),persistence:ExecutionPersistence=new MemoryExecutionPersistence(),audit:AuditSink=new MemoryAuditSink()){
  this.governor=budget;this.state=state;this.killSwitch=killSwitch;this.policy=policy;this.verifier=verifier;this.persistence=persistence;this.audit=audit;
 }
 authorize(agent:AgentContract,capability:Capability){this.killSwitch.assertRunning();return this.policy.evaluate(agent,capability,this.task.riskClass);}
 verify(claim:string,evidence:Parameters<EvidenceVerifier["verify"]>[1]):VerificationResult{this.killSwitch.assertRunning();return this.verifier.verify(claim,evidence);}
}
