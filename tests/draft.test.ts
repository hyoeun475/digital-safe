import { describe, expect, it } from "vitest";
import { buildDraft } from "@/features/report-draft/buildDraft";
import { createEmptyChecklist } from "@/features/evidence/checklist";

const details = { incidentDate: "", discoveredDate: "2026-11-01T10:00", platformOrLocation: "SNS", url: "https://example.invalid/post/1", description: "" };

describe("buildDraft", () => {
  it("marks unknown fields as 미상 and includes disclaimer", () => {
    const d = buildDraft({
      locale: "ko",
      incidentType: "deepfake",
      situation: null,
      immediateRisk: null,
      description: "제 얼굴이 합성된 영상을 발견했습니다.",
      evidence: createEmptyChecklist(),
      details,
      request: "",
    });
    expect(d).toContain("공식 신고 접수 문서가 아닙니다");
    expect(d).toContain("피해 발생 시점: 미상");
    expect(d).toContain("현재 상황: 미상");
    expect(d).toContain("요청하는 도움");
    expect(d).toContain("제 얼굴이 합성된 영상을 발견했습니다.");
    expect(d).toContain("SNS / https://example.invalid/post/1");
  });

  it("separates collected and not-collected evidence", () => {
    const ev = createEmptyChecklist().map((e) => (e.id === "screenshot_post" ? { ...e, collected: true, note: "3장" } : e));
    const d = buildDraft({ locale: "ko", incidentType: "distribution", situation: "found_online", immediateRisk: "no", description: "x".repeat(12), evidence: ev, details, request: "삭제 지원" });
    expect(d).toContain("[확보] 게시물 화면 캡처 — 3장");
    expect(d).toContain("[미확보] 대화 내용 캡처");
    expect(d).toContain("삭제 지원");
  });

  it("renders in English", () => {
    const d = buildDraft({ locale: "en", incidentType: "threat", situation: "being_threatened", immediateRisk: "yes", description: "Someone demands money.", evidence: createEmptyChecklist(), details, request: "" });
    expect(d).toContain("Report statement draft");
    expect(d).toContain("Harm type: Threats to distribute or demands for money");
    expect(d).toContain("Current threat (your answer): Yes");
  });
});
