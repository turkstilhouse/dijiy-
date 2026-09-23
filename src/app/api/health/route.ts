import { NextResponse } from "next/server";
import { checkHealth } from "@/modules/platform/health";

export const dynamic = "force-dynamic";

export async function GET() {
  const report = await checkHealth();
  const healthy =
    report.supabase.status === "ok" ||
    report.supabase.status === "unconfigured";
  return NextResponse.json(report, {
    status: healthy ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
