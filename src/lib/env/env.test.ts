import { describe, expect, it, vi } from "vitest";
import { isSupabaseConfigured, readPublicEnv } from "./public";
import { readServerEnv } from "./server";

describe("readPublicEnv", () => {
  it("returns validated values", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    expect(readPublicEnv().NEXT_PUBLIC_SUPABASE_URL).toBe(
      "https://example.supabase.co",
    );
    expect(isSupabaseConfigured()).toBe(true);
  });

  it("names missing variables without leaking values", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "not-a-url");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    expect(() => readPublicEnv()).toThrow(
      /NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/,
    );
    expect(isSupabaseConfigured()).toBe(false);
  });
});

describe("readServerEnv", () => {
  it("treats empty strings as unset", () => {
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    vi.stubEnv("DIJIY_PROJECT_ID", "");
    expect(readServerEnv()).toEqual({});
  });

  it("rejects a malformed project id", () => {
    vi.stubEnv("DIJIY_PROJECT_ID", "dijiy");
    expect(() => readServerEnv()).toThrow(/DIJIY_PROJECT_ID/);
  });
});
