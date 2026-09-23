#!/usr/bin/env node
// Verifies that the configured Supabase project answers with the configured
// publishable key. Reads .env.local if present. Prints no secrets.
import { existsSync } from "node:fs";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error(
    "✗ NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY missing (.env.local).",
  );
  process.exit(1);
}

const checks = [
  ["auth", `${url}/auth/v1/health`],
  ["rest", `${url}/rest/v1/projects?select=id&limit=0`],
];

let failed = false;
for (const [name, target] of checks) {
  try {
    const res = await fetch(target, {
      headers: { apikey: key },
      signal: AbortSignal.timeout(8000),
    });
    console.log(`${res.ok ? "✓" : "✗"} ${name}: HTTP ${res.status}`);
    if (!res.ok) failed = true;
  } catch (err) {
    console.log(`✗ ${name}: ${err.cause?.code ?? err.message}`);
    failed = true;
  }
}
process.exit(failed ? 1 : 0);
