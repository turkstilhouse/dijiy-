import { AgentContract, ResourceUsage, TaskContract } from "./contracts";
import { WorkforceProvider } from "./runtime-providers";

export interface RelevanceAIProviderConfig {
  region: string;
  projectId: string;
  apiKey: string;
  baseUrl?: string;
  pollIntervalMs?: number;
  maxPolls?: number;
  resolveAgentId?: (agent: AgentContract) => string;
  fetchImpl?: typeof fetch;
}

/**
 * Minimal provider adapter for Relevance AI's async Agent API.
 *
 * Secrets are supplied at runtime only. No key is stored in source,
 * client bundles, task contracts or canonical DİJİY data.
 */
export class RelevanceAIWorkforceProvider implements WorkforceProvider {
  readonly id = "relevance-ai";

  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly pollIntervalMs: number;
  private readonly maxPolls: number;

  constructor(private readonly config: RelevanceAIProviderConfig) {
    this.baseUrl =
      config.baseUrl ??
      `https://api-${config.region}.stack.tryrelevance.com/latest`;
    this.fetchImpl = config.fetchImpl ?? fetch;
    this.pollIntervalMs = config.pollIntervalMs ?? 3000;
    this.maxPolls = config.maxPolls ?? 100;
  }

  async execute(input: {
    task: TaskContract;
    agent: AgentContract;
    executionId: string;
    idempotencyKey: string;
    input: unknown;
  }) {
    const response = await this.fetchImpl(`${this.baseUrl}/agents/trigger`, {
      method: "POST",
      headers: {
        Authorization: `${this.config.projectId}:${this.config.apiKey}`,
        "Content-Type": "application/json",
        "X-Dijiy-Execution-Id": input.executionId,
        "Idempotency-Key": input.idempotencyKey,
      },
      body: JSON.stringify({
        agent_id: this.config.resolveAgentId?.(input.agent) ?? input.agent.id,
        message: {
          role: "user",
          content: typeof input.input === "string"
            ? input.input
            : JSON.stringify(input.input),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Relevance AI trigger failed: HTTP ${response.status}`);
    }

    const job = await response.json() as {
      job_info?: {
        job_id?: string;
        studio_id?: string;
        conversation_id?: string;
      };
    };

    const jobId = job.job_info?.job_id;
    const studioId = job.job_info?.studio_id;
    if (!jobId || !studioId) {
      throw new Error("Relevance AI returned no pollable job identifiers");
    }

    for (let attempt = 0; attempt < this.maxPolls; attempt += 1) {
      const poll = await this.fetchImpl(
        `${this.baseUrl}/studios/${encodeURIComponent(studioId)}/async_poll/${encodeURIComponent(jobId)}`,
        { headers: { Authorization: `${this.config.projectId}:${this.config.apiKey}` } },
      );

      if (!poll.ok) {
        throw new Error(`Relevance AI poll failed: HTTP ${poll.status}`);
      }

      const status = await poll.json() as {
        updates?: Array<{ type?: string; [key: string]: unknown }>;
        [key: string]: unknown;
      };

      const updates = status.updates ?? [];
      const success = updates.find((u) => u.type === "chain-success");
      const failure = updates.find((u) =>
        typeof u.type === "string" &&
        (u.type.includes("error") || u.type.includes("failure")),
      );

      if (failure) {
        throw new Error("Relevance AI agent execution failed");
      }

      if (success) {
        return {
          output: success,
          providerExecutionId: jobId,
        };
      }

      await new Promise((resolve) => setTimeout(resolve, this.pollIntervalMs));
    }

    return {
      output: undefined,
      providerExecutionId: jobId,
      waiting: "WAITING_EXTERNAL" as const,
    };
  }

  async cancel(input: {
    taskId: string;
    executionId: string;
    providerExecutionId?: string;
  }): Promise<void> {
    // Cancellation endpoint varies by Relevance runtime surface.
    // Keep cancellation explicit rather than guessing an endpoint.
    if (!input.providerExecutionId) return;
    throw new Error(
      "Relevance AI cancellation requires a configured provider-specific cancellation adapter",
    );
  }
}
