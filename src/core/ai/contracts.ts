export type RiskClass = "R0" | "R1" | "R2" | "R3" | "R4" | "R5";
export const RISK_ORDER: readonly RiskClass[] = ["R0", "R1", "R2", "R3", "R4", "R5"];
export type ExecutionState = "REQUESTED" | "CLASSIFIED" | "PLANNED" | "RESEARCHING" | "GENERATING" | "VERIFYING" | "POLICY_CHECK" | "APPROVAL_REQUIRED" | "APPROVED" | "EXECUTING" | "WAITING_TOOL" | "WAITING_EXTERNAL" | "OBSERVING" | "EVALUATING" | "COMPLETED" | "FAILED" | "CANCELLED";
export type Uncertainty = "KNOWN" | "LIKELY" | "UNCERTAIN" | "CONFLICTING" | "UNKNOWN";
export interface TaskContract { id:string; workspaceId:string; requestedBy:string; objective:string; riskClass:RiskClass; requiredCapabilities:string[]; state:ExecutionState; budget:ResourceBudget; createdAt:string; deadlineAt?:string; }
export interface AgentContract { id:string; name:string; capabilities:string[]; allowedDataClasses:string[]; allowedTools:string[]; allowedModelClasses:string[]; maxRiskClass:RiskClass; maxRuntimeMs:number; maxParallelism:number; }
export interface Capability { id:string; description:string; riskClass:RiskClass; reversible:boolean; externalSideEffect:boolean; }
export interface ResourceBudget { maxInputTokens:number; maxOutputTokens:number; maxModelCalls:number; maxToolCalls:number; maxRetries:number; maxParallelAgents:number; maxRuntimeMs:number; maxExternalCalls:number; maxCostUsd?:number; }
export interface ResourceUsage { inputTokens:number; outputTokens:number; modelCalls:number; toolCalls:number; retries:number; parallelAgents:number; runtimeMs:number; externalCalls:number; costUsd:number; }
export interface Evidence { id:string; claim:string; source:string; sourceTrust:"S0"|"S1"|"S2"|"S3"|"S4"|"S5"; collectedAt:string; verification:"UNVERIFIED"|"PARTIAL"|"VERIFIED"|"CONFLICTING"; confidence:number; }
export interface PolicyDecision { allowed:boolean; riskClass:RiskClass; approvalRequired:boolean; reasons:string[]; decidedAt:string; policyVersion:string; }
export interface Approval { id:string; taskId:string; requestedBy:string; approvedBy?:string; status:"PENDING"|"APPROVED"|"REJECTED"|"EXPIRED"; createdAt:string; expiresAt?:string; }
export interface ToolInvocationContract { id:string; taskId:string; toolId:string; providerId?:string; riskClass:RiskClass; inputHash:string; idempotencyKey:string; state:"REQUESTED"|"AUTHORIZED"|"RUNNING"|"WAITING"|"COMPLETED"|"FAILED"|"CANCELLED"; createdAt:string; }
export interface ExecutionCorrelation { taskId:string; executionId:string; parentExecutionId?:string; attempt:number; }
export interface ExecutionCheckpoint { executionId:string; taskId:string; state:ExecutionState; attempt:number; updatedAt:string; resumeToken?:string; providerStateRef?:string; output?:unknown; }
export interface IdempotencyRecord { key:string; taskId:string; operation:string; status:"IN_PROGRESS"|"COMPLETED"|"FAILED"; resultHash?:string; }
export interface ExecutionPersistence { saveCheckpoint(c:ExecutionCheckpoint):Promise<void>; loadCheckpoint(executionId:string):Promise<ExecutionCheckpoint|undefined>; getIdempotency(key:string):Promise<IdempotencyRecord|undefined>; saveIdempotency(r:IdempotencyRecord):Promise<void>; }
export interface AuditEvent { id:string; taskId:string; actorId:string; action:string; state:ExecutionState; timestamp:string; metadata:Record<string,unknown>; }
