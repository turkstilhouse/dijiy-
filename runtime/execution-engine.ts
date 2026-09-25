import { route, RouteRequest } from "./model-router";
import {
  AgentReachAdapter,
  LyriaAdapter,
  OllamaAdapter,
  ProviderAdapter,
  SeedanceAdapter
} from "./provider-adapters";

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

  const result = await adapter.execute({
    model: selected.model,
    input,
    metadata: {
      operationKey: request.operationKey,
      complexity: request.complexity
    }
  });

  return { route: selected, result };
}
