import { route, RouteRequest } from "./model-router";
import {
  AgentReachAdapter,
  LyriaAdapter,
  OllamaAdapter,
  ProviderAdapter,
  SeedanceAdapter
} from "./provider-adapters";
import { recordAuditEvent } from "./audit";

const adapters: Record<string, ProviderAdapter> = {
  seedance: new SeedanceAdapter(),
  ollama: new OllamaAdapter(),
  "agent-reach": new AgentReachAdapter(),
  lyria: new LyriaAdapter()
};

export type ExecutionResult = {
  route: ReturnType<typeof route>;
  result: Awaited<ReturnType<ProviderAdapter["execute"]>>;
};

export async function execute(request: RouteRequest, input: unknown): Promise<ExecutionResult> {
  const selected = route(request);
  const adapter = adapters[selected.adapter];

  if (!adapter) {
    throw new Error(`ADAPTER_NOT_FOUND:${selected.adapter}`);
  }

  await recordAuditEvent({
    action: "runtime.execution.started",
    state: "STARTED",
    metadata: {
      operationKey: request.operationKey,
      provider: selected.provider,
      model: selected.model,
      adapter: selected.adapter,
      complexity: request.complexity ?? "medium"
    }
  });

  try {
    const result = await adapter.execute({
      model: selected.model,
      input,
      metadata: {
        operationKey: request.operationKey,
        complexity: request.complexity
      }
    });

    const state =
      typeof result === "object" &&
      result !== null &&
      "state" in result &&
      typeof (result as { state?: unknown }).state === "string"
        ? String((result as { state: string }).state)
        : "COMPLETED";

    await recordAuditEvent({
      action: "runtime.execution.finished",
      state,
      metadata: {
        operationKey: request.operationKey,
        provider: selected.provider,
        model: selected.model,
        adapter: selected.adapter
      }
    });

    return { route: selected, result };
  } catch (error) {
    await recordAuditEvent({
      action: "runtime.execution.failed",
      state: "FAILED",
      metadata: {
        operationKey: request.operationKey,
        provider: selected.provider,
        model: selected.model,
        adapter: selected.adapter,
        error: error instanceof Error ? error.message : "UNKNOWN_ERROR"
      }
    });

    throw error;
  }
}
