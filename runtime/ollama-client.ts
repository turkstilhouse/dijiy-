const DEFAULT_BASE_URL = "http://127.0.0.1:11434";

export type OllamaHealth = {
  ok: boolean;
  baseUrl: string;
  models: string[];
  reason?: string;
};

export type OllamaGenerateInput = {
  model: string;
  prompt: string;
  system?: string;
  temperature?: number;
  stream?: boolean;
};

export type OllamaGenerateResult = {
  model: string;
  response: string;
  raw: unknown;
};

function baseUrl(): string {
  return (process.env.OLLAMA_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
}

export async function checkOllamaHealth(): Promise<OllamaHealth> {
  const url = baseUrl();

  try {
    const response = await fetch(url + "/api/tags");
    if (!response.ok) {
      return { ok: false, baseUrl: url, models: [], reason: `HTTP_${response.status}` };
    }

    const body = (await response.json()) as { models?: Array<{ name?: string }> };
    return {
      ok: true,
      baseUrl: url,
      models: (body.models ?? []).map(m => m.name).filter((x): x is string => Boolean(x))
    };
  } catch (error) {
    return {
      ok: false,
      baseUrl: url,
      models: [],
      reason: error instanceof Error ? error.message : "OLLAMA_UNREACHABLE"
    };
  }
}

export async function generateWithOllama(input: OllamaGenerateInput): Promise<OllamaGenerateResult> {
  const response = await fetch(baseUrl() + "/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model: input.model,
      prompt: input.prompt,
      system: input.system,
      temperature: input.temperature,
      stream: input.stream ?? false
    })
  });

  if (!response.ok) {
    throw new Error(`OLLAMA_HTTP_${response.status}`);
  }

  const raw = (await response.json()) as { model?: string; response?: string };
  return {
    model: raw.model ?? input.model,
    response: raw.response ?? "",
    raw
  };
}
