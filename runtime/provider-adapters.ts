import { checkAgentReachHealth, agentReachGet } from "./agent-reach-client";
import { checkOllamaHealth, generateWithOllama } from "./ollama-client";

export type AdapterContext = {
  model: string;
  input: unknown;
  metadata?: Record<string, unknown>;
};

export type AdapterHealth = {
  ok: boolean;
  details?: Record<string, unknown>;
};

export interface ProviderAdapter {
  health(): Promise<AdapterHealth>;
  execute(ctx: AdapterContext): Promise<unknown>;
}

export class SeedanceAdapter implements ProviderAdapter {
  async health(): Promise<AdapterHealth> {
    return { ok: false, details: { state: "NOT_CONNECTED", transport: "server-side-api-required" } };
  }

  async execute(ctx: AdapterContext) {
    const health = await this.health();
    if (!health.ok) {
      return { state: "WAITING_FOR_CONNECTION", provider: "bytedance-seed", model: ctx.model };
    }
    throw new Error("SEEDANCE_TRANSPORT_NOT_IMPLEMENTED");
  }
}

export class OllamaAdapter implements ProviderAdapter {
  async health(): Promise<AdapterHealth> {
    const health = await checkOllamaHealth();
    return {
      ok: health.ok,
      details: { baseUrl: health.baseUrl, models: health.models, reason: health.reason }
    };
  }

  async execute(ctx: AdapterContext) {
    const health = await this.health();
    if (!health.ok) {
      return { state: "WAITING_FOR_CONNECTION", provider: "google-ai", runtime: "ollama", model: ctx.model };
    }

    const input = ctx.input as {
      prompt?: string;
      system?: string;
      temperature?: number;
    };

    if (!input || typeof input.prompt !== "string" || !input.prompt.trim()) {
      throw new Error("OLLAMA_PROMPT_REQUIRED");
    }

    return generateWithOllama({
      model: ctx.model,
      prompt: input.prompt,
      system: input.system,
      temperature: input.temperature,
      stream: false
    });
  }
}

export class AgentReachAdapter implements ProviderAdapter {
  async health(): Promise<AdapterHealth> {
    const health = await checkAgentReachHealth();
    return { ok: health.ok, details: { report: health.report, raw: health.raw } };
  }

  async execute(ctx: AdapterContext) {
    const health = await this.health();
    if (!health.ok) {
      return { state: "WAITING_FOR_CONNECTION", provider: "agent-reach" };
    }

    const input = ctx.input as {
      channel?: string;
      target?: string;
      limit?: number;
      maxTokens?: number;
      noCache?: boolean;
    };

    if (!input?.channel || !input?.target) {
      throw new Error("AGENT_REACH_CHANNEL_AND_TARGET_REQUIRED");
    }

    return agentReachGet({
      channel: input.channel,
      target: input.target,
      limit: input.limit,
      maxTokens: input.maxTokens,
      noCache: input.noCache
    });
  }
}

export class LyriaAdapter implements ProviderAdapter {
  async health(): Promise<AdapterHealth> {
    return { ok: false, details: { state: "WAITING_FOR_VERIFIED_API_SURFACE", officialSurface: "Flow Music" } };
  }

  async execute(ctx: AdapterContext) {
    return {
      state: "WAITING_FOR_CONNECTION",
      provider: "google-ai",
      model: ctx.model,
      reason: "Automated backend transport is not enabled until an official API surface is verified."
    };
  }
}
