import type { EvidenceCategory, EvidenceItem, IncidentType } from "@/types/consultation";

export const ALL_EVIDENCE_CATEGORIES: EvidenceCategory[] = [
  "screenshot_post",
  "screenshot_chat",
  "threat_message",
  "url_or_account",
  "payment_record",
  "timeline_memo",
  "witness_or_report_record",
];

/** 피해 유형별로 특히 중요한 항목(우선 표시). 나머지도 모두 표시된다. */
export const PRIORITY_BY_TYPE: Record<IncidentType, EvidenceCategory[]> = {
  illegal_filming: ["timeline_memo", "screenshot_chat", "witness_or_report_record"],
  deepfake: ["screenshot_post", "url_or_account", "timeline_memo"],
  distribution: ["screenshot_post", "url_or_account", "timeline_memo"],
  threat: ["threat_message", "screenshot_chat", "payment_record", "url_or_account"],
  cyber_harassment: ["screenshot_chat", "screenshot_post", "url_or_account"],
};

export function createEmptyChecklist(): EvidenceItem[] {
  return ALL_EVIDENCE_CATEGORIES.map((id) => ({ id, collected: false, note: "" }));
}

export function orderChecklist(items: EvidenceItem[], type: IncidentType | null): EvidenceItem[] {
  if (!type) return items;
  const priority = PRIORITY_BY_TYPE[type];
  return [...items].sort((a, b) => {
    const ai = priority.indexOf(a.id);
    const bi = priority.indexOf(b.id);
    const av = ai === -1 ? 99 : ai;
    const bv = bi === -1 ? 99 : bi;
    return av - bv;
  });
}
