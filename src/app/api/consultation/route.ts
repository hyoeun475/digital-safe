import { NextResponse } from "next/server";
import { ConsultationRequestSchema, DESCRIPTION_MAX } from "@/lib/ai/schema";
import { generateDemoResult, generateSafeFallback } from "@/lib/ai/demo";
import { callProvider } from "@/lib/ai/provider";
import { resolveResources } from "@/lib/ai/resources";
import { getAiConfig } from "@/lib/env";
import { clientKey, consultationLimiter } from "@/lib/rateLimit";
import type { ConsultationResponse } from "@/types/consultation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = DESCRIPTION_MAX * 4 + 1024;

/**
 * POST /api/consultation
 * - 상담 본문을 DB/로그에 저장하지 않는다. (console에 본문을 출력하지 않는다)
 * - aiConsent가 true이고 서버에 AI가 설정된 경우에만 외부 AI를 호출한다.
 * - 그 외에는 규칙 기반 데모 응답을 mode:"demo"로 명시해 반환한다.
 */
export async function POST(request: Request) {
  const key = await clientKey(request.headers);
  const limit = consultationLimiter.check(key);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec), "Cache-Control": "no-store" } },
    );
  }

  const lengthHeader = Number(request.headers.get("content-length") ?? "0");
  if (lengthHeader > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413, headers: { "Cache-Control": "no-store" } });
  }

  let raw: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "payload_too_large" }, { status: 413, headers: { "Cache-Control": "no-store" } });
    }
    raw = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const parsed = ConsultationRequestSchema.safeParse(raw);
  if (!parsed.success) {
    // 필드 이름만 반환하고 입력값은 에코하지 않는다.
    const fields = Array.from(new Set(parsed.error.issues.map((i) => String(i.path[0] ?? "body"))));
    return NextResponse.json({ error: "invalid_request", fields }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  const req = parsed.data;
  const config = getAiConfig();

  let body: ConsultationResponse;

  if (!config.configured) {
    body = { mode: "demo", modeReason: "ai_not_configured", result: generateDemoResult(req) };
  } else if (!req.aiConsent) {
    body = { mode: "demo", modeReason: "consent_not_given", result: generateDemoResult(req) };
  } else {
    try {
      const out = await callProvider(config, req);
      body = {
        mode: "ai",
        modeReason: "ai",
        result: {
          acknowledgement: out.acknowledgement,
          urgentRisk: out.urgent_risk,
          incidentSummary: out.incident_summary,
          unknownOrUnconfirmed: out.unknown_or_unconfirmed,
          recommendedSteps: out.recommended_steps,
          // 기관 정보는 모델 출력이 아니라 검증된 데이터에서만 가져온다.
          supportResources: resolveResources(out.support_resource_ids, req.locale, req.immediateRisk),
          offerReportDraft: out.offer_report_draft,
          disclaimer: out.disclaimer,
        },
      };
    } catch (err) {
      // 오류 유형만 기록한다. 요청 본문·스택·키는 기록하지 않는다.
      const name = err instanceof Error ? err.name : "UnknownError";
      console.warn(`[consultation] ai_call_failed: ${name}`);
      body = { mode: "demo", modeReason: "ai_error_fallback", result: generateSafeFallback(req) };
    }
  }

  return NextResponse.json(body, { status: 200, headers: { "Cache-Control": "no-store" } });
}
