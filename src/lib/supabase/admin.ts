import "server-only";
import { createClient } from "@supabase/supabase-js";
import { readPublicEnv } from "@/lib/env/public";
import { readServerEnv } from "@/lib/env/server";
import type { Database } from "./database.types";

/**
 * Privileged Supabase client that BYPASSES RLS.
 *
 * Only for trusted server-side jobs (workers, webhooks, audited system tasks).
 * Never use it to serve data for a user request without an explicit
 * authorization check first, and never import it from client code.
 */
export function createSupabaseAdminClient() {
  const { NEXT_PUBLIC_SUPABASE_URL } = readPublicEnv();
  const { SUPABASE_SECRET_KEY } = readServerEnv();
  if (!SUPABASE_SECRET_KEY) {
    throw new Error(
      "SUPABASE_SECRET_KEY is not set; admin client unavailable.",
    );
  }
  return createClient<Database>(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
