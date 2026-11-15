import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { parseModelOutput, AiOutputError } = await import("@/lib/ai/provider");

const good = {
  acknowledgement: "a",
  urgent_risk: { level: "unknown", message: "m" },
  incident_summary: "s",
  unknown_or_unconfirmed: [],
  recommended_steps: [{ title: "t", description: "d", priority: "normal" }],
  support_resource_ids: [],
  offer_report_draft: false,
  disclaimer: "x",
};

describe("parseModelOutput", () => {
  it("parses plain JSON", () => {
    expect(parseModelOutput(JSON.stringify(good)).acknowledgement).toBe("a");
  });
  it("parses JSON inside a code fence", () => {
    expect(parseModelOutput("```json\n" + JSON.stringify(good) + "\n```").disclaimer).toBe("x");
  });
  it("parses JSON surrounded by prose", () => {
    expect(parseModelOutput("Here you go:\n" + JSON.stringify(good) + "\nHope this helps").incident_summary).toBe("s");
  });
  it("throws AiOutputError on invalid JSON", () => {
    expect(() => parseModelOutput("not json at all")).toThrow(AiOutputError);
  });
  it("throws AiOutputError on schema mismatch", () => {
    expect(() => parseModelOutput(JSON.stringify({ ...good, urgent_risk: { level: "fatal", message: "m" } }))).toThrow(AiOutputError);
  });
});
