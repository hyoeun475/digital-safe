import { NextResponse } from "next/server";
import { getAiConfig } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/status — AI 설정 여부만 반환한다. 키·모델명 등 민감정보는 노출하지 않는다. */
export async function GET() {
  const config = getAiConfig();
  return NextResponse.json(
    { aiConfigured: config.configured, provider: config.configured ? config.provider : null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
