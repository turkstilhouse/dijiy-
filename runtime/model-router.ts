export type RiskLevel = "automatic" | "notification" | "approval";

export type RouteRequest = {
  operationKey: string;
  complexity?: "low" | "medium" | "high";
  modality?: string;
  privacyMode?: "local" | "cloud" | "either";
  requiresVerifiedProvider?: boolean;
};

export type RouteCandidate = {
  provider: string;
  model: string;
  adapter: string;
  risk: RiskLevel;
  conditions?: Record<string, unknown>;
};

const ROUTES: Record<string, RouteCandidate[]> = {
  "creative.media.generate_video": [
    { provider: "bytedance-seed", model: "seedance-2.5", adapter: "seedance", risk: "automatic", conditions: { verified: true } }
  ],
  "creative.media.edit_video": [
    { provider: "bytedance-seed", model: "seedance-2.5", adapter: "seedance", risk: "automatic", conditions: { verified: true } }
  ],
  "creative.audio.generate_music": [
    { provider: "google-ai", model: "lyria-3.5", adapter: "lyria", risk: "automatic", conditions: { verified: true, officialSurface: "Flow Music" } }
  ],
  "research.web.discover": [
    { provider: "agent-reach", model: "", adapter: "agent-reach", risk: "automatic", conditions: { doctorPass: true, noCookieScraping: true } }
  ],
  "ai.local.infer": [
    { provider: "google-ai", model: "gemma-4-12b", adapter: "ollama", risk: "automatic", conditions: { runtime: "ollama", local: true } },
    { provider: "google-ai", model: "gemma-4-26b-a4b", adapter: "ollama", risk: "automatic", conditions: { runtime: "ollama", local: true } }
  ]
};

export function route(request: RouteRequest): RouteCandidate {
  const candidates = ROUTES[request.operationKey] ?? [];
  if (!candidates.length) throw new Error(`NO_ROUTE:${request.operationKey}`);

  const localOnly = request.privacyMode === "local";
  const complexity = request.complexity ?? "medium";

  const filtered = candidates.filter(candidate => {
    if (request.requiresVerifiedProvider && candidate.conditions?.verified !== true && candidate.adapter !== "ollama") return false;
    if (localOnly && candidate.adapter !== "ollama") return false;
    return true;
  });

  if (!filtered.length) throw new Error(`NO_SAFE_ROUTE:${request.operationKey}`);

  if (request.operationKey === "ai.local.infer" && complexity === "high" && filtered[1]) {
    return filtered[1];
  }

  return filtered[0];
}
