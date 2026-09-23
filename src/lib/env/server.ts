import "server-only";
import { z } from "zod";

/**
 * Server-only environment. Importing this module from a Client Component
 * fails the build (via `server-only`), so secrets can never reach the browser.
 */
const serverEnvSchema = z.object({
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),
  DIJIY_ORGANIZATION_ID: z.uuid().optional(),
  DIJIY_PROJECT_ID: z.uuid().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function readServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse({
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY || undefined,
    DIJIY_ORGANIZATION_ID: process.env.DIJIY_ORGANIZATION_ID || undefined,
    DIJIY_PROJECT_ID: process.env.DIJIY_PROJECT_ID || undefined,
  });
  if (!parsed.success) {
    const keys = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Invalid server environment variables: ${keys}`);
  }
  return parsed.data;
}
