export type AdapterContext = {
  model: string;
  input: unknown;
  metadata?: Record<string, unknown>;
};

export type AdapterResult = {
  status: "completed" | "waiting_for_connection" | "approval_required" | "failed";
  provider: string;
  model: string;
  output?: unknown;
  error?: string;
};

export interface ProviderAdapter {
  readonly key: string;
  health(): Promise<boolean>;
  execute(context: AdapterContext): Promise<AdapterResult>;
}

export class SeedanceAdapter implements ProviderAdapter {
  readonly key = "seedance";

  async health(): Promise<boolean> {
    return false; // Real API/credential health check is intentionally not faked.
  }

  async execute(context: AdapterContext): Promise<AdapterResult> {
    if (!(await this.health())) {
      return {
        status: "waiting_for_connection",
        provider: "bytedance-seed",
        model: context.model,
        error: "Seedance connection/API credentials are not configured."
      };
    }
    throw new Error("Seedance transport adapter not implemented yet.");
  }
}

export class OllamaAdapter implements ProviderAdapter {
  readonly key = "ollama";

  async health(): Promise<boolean> {
    // Runtime implementation must perform a real localhost health check.
    return false;
  }

  async execute(context: AdapterContext): Promise<AdapterResult> {
    if (!(await this.health())) {
      return {
        status: "waiting_for_connection",
        provider: "ollama",
        model: context.model,
        error: "Ollama local runtime is not reachable."
      };
    }
    throw new Error("Ollama transport adapter not implemented yet.");
  }
}

export class AgentReachAdapter implements ProviderAdapter {
  readonly key = "agent-reach";

  async health(): Promise<boolean> {
    return false; // Must run the local doctor's health check.
  }

  async execute(context: AdapterContext): Promise<AdapterResult> {
    if (!(await this.health())) {
      return {
        status: "waiting_for_connection",
        provider: "agent-reach",
        model: "",
        error: "Agent Reach health check has not passed."
      };
    }
    throw new Error("Agent Reach transport adapter not implemented yet.");
  }
}

export class LyriaAdapter implements ProviderAdapter {
  readonly key = "lyria";

  async health(): Promise<boolean> {
    return false; // No invented backend API surface.
  }

  async execute(context: AdapterContext): Promise<AdapterResult> {
    return {
      status: "waiting_for_connection",
      provider: "google-ai",
      model: context.model,
      error: "Lyria 3.5 is registered; automated backend transport requires a verified API surface."
    };
  }
}
