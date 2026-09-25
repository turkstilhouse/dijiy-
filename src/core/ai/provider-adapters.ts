import { AgentContract, Evidence, ResourceBudget, ResourceUsage, TaskContract } from "./contracts";

export interface AIProvider {
  id: string;
  generate(input: { task: TaskContract; prompt: string; budget: ResourceBudget }): Promise<{
    output: string;
    usage: Partial<ResourceUsage>;
  }>;
}

export interface ToolProvider {\n  id: string;\n  invoke(input: { toolId: string; task: TaskContract; input: unknown; idempotencyKey: string }): Promise<{ output: unknown; usage?: Partial<ResourceUsage>; waiting?: boolean }>;\n}\n\nexport interface ToolProvider {
  id: string;
  invoke(input: {
    toolId: string;
    task: TaskContract;
    input: unknown;
    idempotencyKey: string;
  }): Promise<{
    output: unknown;
    usage?: Partial<ResourceUsage>;
    waiting?: boolean;
  }>;
}

export interface AgentRuntime {
  id: string;
  execute(task: TaskContract, agent: AgentContract): Promise<{ output: unknown; usage: Partial<ResourceUsage> }>;
}

export interface SearchProvider {
  id: string;
  search(query: string, options?: { limit?: number }): Promise<Evidence[]>;
}

export interface BrowserProvider {
  id: string;
  read(url: string): Promise<{ content: string; source: string }>;
}

export interface StorageProvider {
  id: string;
  put(key: string, value: unknown): Promise<void>;
  get<T>(key: string): Promise<T | undefined>;
}

export interface ObservabilityProvider {
  id: string;
  emit(event: { type: string; taskId: string; data: Record<string, unknown> }): Promise<void>;
}
