import { AgentContract, ResourceUsage, TaskContract } from "./contracts";

/**
 * Provider-neutral AI Workforce runtime.
 *
 * DİJİY owns policy, identity, canonical state and side-effect authority.
 * A Workforce provider only executes an already-authorized workload and
 * returns normalized runtime information.
 */
export interface WorkforceProvider {
  id: string;
  execute(input: {
    task: TaskContract;
    agent: AgentContract;
    executionId: string;
    idempotencyKey: string;
    input: unknown;
  }): Promise<{
    output: unknown;
    providerExecutionId?: string;
    usage?: Partial<ResourceUsage>;
    waiting?: "WAITING_TOOL" | "WAITING_EXTERNAL";
    providerStateRef?: string;
  }>;
  cancel(input: {
    taskId: string;
    executionId: string;
    providerExecutionId?: string;
  }): Promise<void>;
}

/**
 * Provider-neutral deterministic automation runtime.
 *
 * Intended for n8n or an equivalent workflow engine.
 */
export interface AutomationProvider {
  id: string;
  execute(input: {
    task: TaskContract;
    executionId: string;
    workflowId: string;
    idempotencyKey: string;
    input: unknown;
  }): Promise<{
    output: unknown;
    providerExecutionId?: string;
    usage?: Partial<ResourceUsage>;
    waiting?: "WAITING_TOOL" | "WAITING_EXTERNAL";
  }>;
  cancel(input: {
    taskId: string;
    executionId: string;
    providerExecutionId?: string;
  }): Promise<void>;
}
