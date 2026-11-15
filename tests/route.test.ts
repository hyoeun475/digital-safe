import { beforeEach, describe, expect, it, vi } from "vitest";

// server-only는 Node 테스트 환경에서 import 시 throw 하므로 무력화한다.
vi.mock("server-only", () => ({}));

const callProvider = vi.fn();
vi.mock("@/lib/ai/provider", () => ({ callProvider: (...args: unknown[]) => callProvider(...args) }));

const getAiConfig = vi.fn();
vi.mock("@/lib/env", () => ({ getAiConfig: () => getAiConfig() }));

const { POST } = await import("@/app/api/consultation/route");

function makeRequest(body: unknown, ip = "203.0.113.5") {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return new Request("http://localhost/api/consultation", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip, "content-length": String(new TextEncoder().encode(text).length) },
    body: text,
  });
}

const valid = {
  incidentType: "deepfake",
  situation: "found_online",
  description: "제 사진을 이용한 영상이 온라인에 올라왔습니다.",
  immediateRisk: "no",
  aiConsent: true,
  locale: "ko",
};

const modelOutput = {
  acknowledgement: "ack",
  urgent_risk: { level: "no_immediate_risk", message: "msg" },
  incident_summary: "summary",
  unknown_or_unconfirmed: ["x"],
  recommended_steps: [{ title: "t", description: "d", priority: "high" }],
  support_resource_ids: ["d4u", "fake_institution", "https://evil.example"],
  offer_report_draft: true,
  disclaimer: "disc",
};

let ipCounter = 0;
const nextIp = () => `198.51.100.${++ipCounter}`;

beforeEach(() => {
  callProvider.mockReset();
  getAiConfig.mockReset();
  getAiConfig.mockReturnValue({ configured: false });
});

describe("POST /api/consultation", () => {
  it("returns demo mode and never calls the provider when AI is not configured", async () => {
    const res = await POST(makeRequest(valid, nextIp()));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.mode).toBe("demo");
    expect(body.modeReason).toBe("ai_not_configured");
    expect(callProvider).not.toHaveBeenCalled();
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("does not call the provider without consent even when AI is configured", async () => {
    getAiConfig.mockReturnValue({ configured: true, provider: "anthropic", apiKey: "k", model: "m" });
    const res = await POST(makeRequest({ ...valid, aiConsent: false }, nextIp()));
    const body = await res.json();
    expect(body.mode).toBe("demo");
    expect(body.modeReason).toBe("consent_not_given");
    expect(callProvider).not.toHaveBeenCalled();
  });

  it("calls the provider with consent and replaces resource ids with verified data only", async () => {
    getAiConfig.mockReturnValue({ configured: true, provider: "anthropic", apiKey: "k", model: "m" });
    callProvider.mockResolvedValue(modelOutput);
    const res = await POST(makeRequest(valid, nextIp()));
    const body = await res.json();
    expect(callProvider).toHaveBeenCalledTimes(1);
    expect(body.mode).toBe("ai");
    const ids = body.result.supportResources.map((r: { id: string }) => r.id);
    expect(ids).toEqual(["d4u"]);
    expect(body.result.supportResources[0].url).toBe("https://d4u.stop.or.kr");
  });

  it("falls back safely when the provider throws", async () => {
    getAiConfig.mockReturnValue({ configured: true, provider: "anthropic", apiKey: "k", model: "m" });
    callProvider.mockRejectedValue(new Error("boom"));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const res = await POST(makeRequest(valid, nextIp()));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.mode).toBe("demo");
    expect(body.modeReason).toBe("ai_error_fallback");
    // 로그에 상담 본문이 포함되지 않는다.
    expect(warn.mock.calls.flat().join(" ")).not.toContain(valid.description);
    warn.mockRestore();
  });

  it("rejects empty and invalid input without echoing values", async () => {
    const res = await POST(makeRequest({ ...valid, description: "" }, nextIp()));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("invalid_request");
    expect(body.fields).toContain("description");
    expect(JSON.stringify(body)).not.toContain("deepfake");
  });

  it("rejects malformed JSON", async () => {
    const res = await POST(makeRequest("{not json", nextIp()));
    expect(res.status).toBe(400);
  });

  it("rejects over-long descriptions", async () => {
    const res = await POST(makeRequest({ ...valid, description: "가".repeat(2001) }, nextIp()));
    expect(res.status).toBe(400);
  });

  it("rate limits after 10 requests per minute per client", async () => {
    const ip = nextIp();
    for (let i = 0; i < 10; i++) {
      expect((await POST(makeRequest(valid, ip))).status).toBe(200);
    }
    const res = await POST(makeRequest(valid, ip));
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBeTruthy();
  });
});
