import { AgentContract, ResourceUsage, TaskContract } from "./contracts";
import { AutomationProvider } from "./runtime-providers";

export interface N8nAutomationProviderConfig {
  webhookUrl: string;
  apiKey?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

/**
 * Provider-neutral n8n webhook adapter.
 *
 * n8n remains an automation runtime. DİJİY remains authoritative for
 * identity, policy, canonical state and consequential side effects.
 */
export class N8nAutomationProvider implements AutomationProvider {
  readonly id = "n8n";

  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly config: N8nAutomationProviderConfig) {
    this.timeoutMs = config.timeoutMs ?? 30_000;
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  async execute(input: {
    task: TaskContract;
    executionId: string;
    workflowId: string;
    idempotencyKey: string;
    input: unknown;
  }) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImpl(this.config.webhookUrl, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(this.config.apiKey
            ? { Authorization: `Bearer ${this.config.apiKey}` }
            : {}),
          "X-Dijiy-Execution-Id": input.executionId,
          "Idempotency-Key": input.idempotencyKey,
        },
        body: JSON.stringify({
          workflowId: input.workflowId,
          taskId: input.task.id,
          workspaceId: input.task.workspaceId,
          executionId: input.executionId,
          input: input.input,
        }),
      });

      if (!response.ok) {
        throw new Error(`n8n execution failed: HTTP ${response.status}`);
      }

      const output = await response.json().catch(() => undefined);
      return { output };
    } finally {
      clearTimeout(timer);
    }
  }

  async cancel(_input: {
    taskId: string;
    executionId: string;
    providerExecutionId?: string;
  }): Promise<void> {
    // n8n cancellation is deployment/workflow specific. Do not guess
    // a cancellation endpoint; DİJİY records cancellation locally first.
  }
}
