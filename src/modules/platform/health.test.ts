import { describe, expect, it, vi } from "vitest";
import { checkHealth } from "./health";

function configure() {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co/");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
}

describe("checkHealth", () => {
  it("reports unconfigured without calling the network", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    const fetchMock = vi.fn();
    const report = await checkHealth(fetchMock);
    expect(report.supabase.status).toBe("unconfigured");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("probes auth and rest with the publishable key", async () => {
    configure();
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}"));
    const report = await checkHealth(fetchMock);
    expect(report.supabase).toMatchObject({
      status: "ok",
      auth: "ok",
      rest: "ok",
    });
    const urls = fetchMock.mock.calls.map(([url]) => url);
    expect(urls).toEqual([
      "https://example.supabase.co/auth/v1/health",
      "https://example.supabase.co/rest/v1/projects?select=id&limit=0",
    ]);
    expect(fetchMock.mock.calls[0][1].headers).toEqual({
      apikey: "sb_publishable_test",
    });
  });

  it("reports error when a probe fails", async () => {
    configure();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("{}"))
      .mockResolvedValueOnce(new Response("{}", { status: 401 }));
    const report = await checkHealth(fetchMock);
    expect(report.supabase).toMatchObject({ status: "error", rest: "error" });
  });

  it("reports unreachable when the network fails", async () => {
    configure();
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    const report = await checkHealth(fetchMock);
    expect(report.supabase.status).toBe("unreachable");
  });

  it("never includes the key in the report", async () => {
    configure();
    const report = await checkHealth(vi.fn().mockResolvedValue(new Response()));
    expect(JSON.stringify(report)).not.toContain("sb_publishable_test");
  });
});
