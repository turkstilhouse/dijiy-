import { isSupabaseConfigured, readPublicEnv } from "@/lib/env/public";

export type CheckStatus = "ok" | "unconfigured" | "unreachable" | "error";

export type HealthReport = {
  app: "ok";
  supabase: {
    status: CheckStatus;
    auth?: CheckStatus;
    rest?: CheckStatus;
    latencyMs?: number;
  };
  checkedAt: string;
};

const TIMEOUT_MS = 5000;

async function probe(
  url: string,
  apiKey: string,
  fetchImpl: typeof fetch,
): Promise<CheckStatus> {
  try {
    const res = await fetchImpl(url, {
      headers: { apikey: apiKey },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    return res.ok ? "ok" : "error";
  } catch {
    return "unreachable";
  }
}

/**
 * Verifies that Supabase Auth and PostgREST respond with the configured
 * publishable key. It reads no rows and returns no secrets, so the result is
 * safe to expose on a public health endpoint.
 */
export async function checkHealth(
  fetchImpl: typeof fetch = fetch,
): Promise<HealthReport> {
  const checkedAt = new Date().toISOString();
  if (!isSupabaseConfigured()) {
    return { app: "ok", supabase: { status: "unconfigured" }, checkedAt };
  }

  const env = readPublicEnv();
  const base = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
  const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const started = Date.now();
  const [auth, rest] = await Promise.all([
    probe(`${base}/auth/v1/health`, key, fetchImpl),
    // HEAD-like request on an RLS-protected table: proves the API key is
    // accepted without returning any data to an anonymous caller.
    probe(`${base}/rest/v1/projects?select=id&limit=0`, key, fetchImpl),
  ]);
  const latencyMs = Date.now() - started;

  const status: CheckStatus =
    auth === "ok" && rest === "ok"
      ? "ok"
      : auth === "unreachable" && rest === "unreachable"
        ? "unreachable"
        : "error";

  return { app: "ok", supabase: { status, auth, rest, latencyMs }, checkedAt };
}
