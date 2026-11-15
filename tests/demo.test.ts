import { describe, expect, it } from "vitest";
import { generateDemoResult, generateSafeFallback } from "@/lib/ai/demo";
import { INCIDENT_TYPES } from "@/types/consultation";
import { INSTITUTIONS } from "@/data/institutions";
import type { ConsultationRequest } from "@/lib/ai/schema";

const base: ConsultationRequest = {
  incidentType: "threat",
  situation: "being_threatened",
  description: "모르는 사람이 제 사진을 유포하겠다며 돈을 요구하고 있습니다.",
  immediateRisk: "no",
  aiConsent: false,
  locale: "ko",
};

const BANNED = ["왜 그런 사진을", "증거가 없으면 신고할 수 없", "무조건 익명", "신고가 완료", "반드시 처벌"];

describe("generateDemoResult", () => {
  it("puts 112 first when immediate risk is yes", () => {
    const r = generateDemoResult({ ...base, immediateRisk: "yes" });
    expect(r.urgentRisk.level).toBe("immediate_risk");
    expect(r.supportResources[0]?.id).toBe("police_112");
    expect(r.recommendedSteps[0]?.priority).toBe("urgent");
  });

  it("marks possible_risk when unsure", () => {
    expect(generateDemoResult({ ...base, immediateRisk: "unsure" }).urgentRisk.level).toBe("possible_risk");
  });

  it("only uses verified institutions", () => {
    const ids = new Set(INSTITUTIONS.map((i) => i.id));
    for (const type of INCIDENT_TYPES) {
      const r = generateDemoResult({ ...base, incidentType: type });
      for (const s of r.supportResources) expect(ids.has(s.id)).toBe(true);
      expect(r.supportResources.length).toBeGreaterThan(0);
    }
  });

  it("quotes the user's statement without adding claims", () => {
    const r = generateDemoResult(base);
    expect(r.incidentSummary).toContain("모르는 사람이 제 사진을 유포하겠다며");
    expect(r.incidentSummary).toContain("사용자 진술");
  });

  it("never uses banned phrases and always discloses demo mode", () => {
    for (const type of INCIDENT_TYPES) {
      for (const locale of ["ko", "en"] as const) {
        const r = generateDemoResult({ ...base, incidentType: type, locale });
        const text = JSON.stringify(r);
        for (const b of BANNED) expect(text).not.toContain(b);
        expect(r.disclaimer.length).toBeGreaterThan(0);
      }
    }
    expect(generateDemoResult(base).disclaimer).toContain("데모 모드");
    expect(generateDemoResult({ ...base, locale: "en" }).disclaimer).toContain("demo mode");
  });

  it("adds no-compliance step for threats", () => {
    const r = generateDemoResult(base);
    expect(r.recommendedSteps.some((s) => s.title.includes("요구에 응하지"))).toBe(true);
  });

  it("safe fallback explains that AI could not be verified", () => {
    expect(generateSafeFallback(base).disclaimer).toContain("AI 응답을 확인할 수 없어");
  });
});
