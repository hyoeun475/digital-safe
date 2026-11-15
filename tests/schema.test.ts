import { describe, expect, it } from "vitest";
import { ConsultationRequestSchema, DESCRIPTION_MAX, ModelOutputSchema } from "@/lib/ai/schema";

describe("ConsultationRequestSchema", () => {
  const valid = {
    incidentType: "deepfake",
    situation: "found_online",
    description: "제 사진을 이용한 영상이 온라인에 올라왔습니다.",
    immediateRisk: "no",
    aiConsent: true,
    locale: "ko",
  };

  it("accepts a valid request", () => {
    expect(ConsultationRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty description", () => {
    expect(ConsultationRequestSchema.safeParse({ ...valid, description: "   " }).success).toBe(false);
  });

  it("rejects over-long description", () => {
    expect(ConsultationRequestSchema.safeParse({ ...valid, description: "a".repeat(DESCRIPTION_MAX + 1) }).success).toBe(false);
  });

  it("rejects unknown incident type", () => {
    expect(ConsultationRequestSchema.safeParse({ ...valid, incidentType: "murder" }).success).toBe(false);
  });

  it("defaults aiConsent to false and situation to null", () => {
    const r = ConsultationRequestSchema.parse({ incidentType: "threat", description: valid.description, immediateRisk: "unsure" });
    expect(r.aiConsent).toBe(false);
    expect(r.situation).toBeNull();
    expect(r.locale).toBe("ko");
  });
});

describe("ModelOutputSchema", () => {
  it("rejects output missing required fields", () => {
    expect(ModelOutputSchema.safeParse({ acknowledgement: "hi" }).success).toBe(false);
  });

  it("does not accept model-provided urls/phones (only ids)", () => {
    const out = {
      acknowledgement: "a",
      urgent_risk: { level: "unknown", message: "m" },
      incident_summary: "s",
      unknown_or_unconfirmed: [],
      recommended_steps: [{ title: "t", description: "d", priority: "normal" }],
      support_resource_ids: ["d4u"],
      offer_report_draft: true,
      disclaimer: "x",
    };
    const parsed = ModelOutputSchema.parse(out);
    expect(parsed).not.toHaveProperty("support_resources");
    expect(parsed.support_resource_ids).toEqual(["d4u"]);
  });
});
