import { ResourceBudget, ResourceUsage } from "./contracts";

export class ResourceLimitError extends Error {
  constructor(public readonly resource: string, public readonly limit: number, public readonly current: number) {
    super(`Resource limit exceeded: ${resource} (${current}/${limit})`);
    this.name = "ResourceLimitError";
  }
}

export class ResourceGovernor {
  constructor(
    private readonly budget: ResourceBudget,
    private readonly usage: ResourceUsage = {
      inputTokens: 0, outputTokens: 0, modelCalls: 0, toolCalls: 0,
      retries: 0, parallelAgents: 0, runtimeMs: 0, externalCalls: 0, costUsd: 0,
    },
  ) {}

  snapshot(): Readonly<ResourceUsage> { return { ...this.usage }; }

  reserve(delta: Partial<ResourceUsage>): void {
    const next = { ...this.usage, ...Object.fromEntries(
      Object.entries(delta).map(([k, v]) => [k, (this.usage as any)[k] + Number(v ?? 0)])
    ) } as ResourceUsage;

    this.assert("inputTokens", next.inputTokens, this.budget.maxInputTokens);
    this.assert("outputTokens", next.outputTokens, this.budget.maxOutputTokens);
    this.assert("modelCalls", next.modelCalls, this.budget.maxModelCalls);
    this.assert("toolCalls", next.toolCalls, this.budget.maxToolCalls);
    this.assert("retries", next.retries, this.budget.maxRetries);
    this.assert("parallelAgents", next.parallelAgents, this.budget.maxParallelAgents);
    this.assert("runtimeMs", next.runtimeMs, this.budget.maxRuntimeMs);
    this.assert("externalCalls", next.externalCalls, this.budget.maxExternalCalls);
    if (this.budget.maxCostUsd !== undefined) this.assert("costUsd", next.costUsd, this.budget.maxCostUsd);

    Object.assign(this.usage, next);
  }

  canContinue(): boolean {
    try { this.assertAll(); return true; } catch { return false; }
  }

  remaining(): Record<string, number | undefined> {
    return {
      inputTokens: this.budget.maxInputTokens - this.usage.inputTokens,
      outputTokens: this.budget.maxOutputTokens - this.usage.outputTokens,
      modelCalls: this.budget.maxModelCalls - this.usage.modelCalls,
      toolCalls: this.budget.maxToolCalls - this.usage.toolCalls,
      retries: this.budget.maxRetries - this.usage.retries,
      parallelAgents: this.budget.maxParallelAgents - this.usage.parallelAgents,
      runtimeMs: this.budget.maxRuntimeMs - this.usage.runtimeMs,
      externalCalls: this.budget.maxExternalCalls - this.usage.externalCalls,
      costUsd: this.budget.maxCostUsd === undefined ? undefined : this.budget.maxCostUsd - this.usage.costUsd,
    };
  }

  private assertAll() {
    const r = this.remaining();
    for (const [key, value] of Object.entries(r)) if (value !== undefined && value < 0) throw new ResourceLimitError(key, 0, Math.abs(value));
  }

  private assert(resource: string, current: number, limit: number) {
    if (current > limit) throw new ResourceLimitError(resource, limit, current);
  }
}
