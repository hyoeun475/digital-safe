/**
 * 신고 진술서 초안 생성 (순수 함수, 서버 전송 없음).
 * - 사용자가 직접 입력한 내용은 "사용자 진술" 영역에 그대로 넣는다.
 * - 앱이 정리한 항목(선택지 라벨, 체크리스트)은 별도 구분해 표시한다.
 * - 확인되지 않은 항목은 "미상"으로 표기하고 사실을 추가하지 않는다.
 */
import { DICTS, type Locale, type TKey } from "@/i18n";
import type { EvidenceDetails, EvidenceItem, IncidentType, RiskAnswer, Situation } from "@/types/consultation";

export type DraftInput = {
  locale: Locale;
  incidentType: IncidentType | null;
  situation: Situation | null;
  immediateRisk: RiskAnswer | null;
  description: string;
  evidence: EvidenceItem[];
  details: EvidenceDetails;
  request: string;
};

export function buildDraft(input: DraftInput): string {
  const d = DICTS[input.locale];
  const t = (k: TKey) => d[k];
  const unknown = t("draft_unknown");
  const none = t("draft_none");
  const val = (s: string) => (s.trim() ? s.trim() : unknown);

  const typeLabel = input.incidentType ? t(`type_${input.incidentType}` as TKey) : unknown;
  const situationLabel = input.situation ? t(`situation_${input.situation}` as TKey) : unknown;
  const riskLabel = input.immediateRisk ? t(`risk_${input.immediateRisk}` as TKey) : unknown;

  const location = [input.details.platformOrLocation.trim(), input.details.url.trim()].filter(Boolean).join(" / ");

  const collected = input.evidence.filter((e) => e.collected);
  const notCollected = input.evidence.filter((e) => !e.collected);
  const evidenceLines =
    input.evidence.length === 0
      ? [`- ${none}`]
      : [
          ...collected.map((e) => `- [${t("draft_collected")}] ${t(`ev_${e.id}` as TKey)}${e.note.trim() ? ` — ${e.note.trim()}` : ""}`),
          ...notCollected.map((e) => `- [${t("draft_not_collected")}] ${t(`ev_${e.id}` as TKey)}${e.note.trim() ? ` — ${e.note.trim()}` : ""}`),
        ];

  const userStatement = [input.description.trim(), input.details.description.trim()].filter(Boolean).join("\n\n");

  const lines = [
    `# ${t("draft_title")}`,
    "",
    `※ ${t("draft_disclaimer")}`,
    "",
    `## ${t("draft_app_note")}`,
    `- ${t("draft_field_type")}: ${typeLabel}`,
    `- ${t("draft_field_situation")}: ${situationLabel}`,
    `- ${t("draft_field_date")}: ${val(input.details.incidentDate)}`,
    `- ${t("draft_field_discovered")}: ${val(input.details.discoveredDate)}`,
    `- ${t("draft_field_location")}: ${location || unknown}`,
    `- ${t("draft_field_threat")}: ${riskLabel}`,
    "",
    `## ${t("draft_field_description")}`,
    userStatement || unknown,
    "",
    `## ${t("draft_field_evidence")}`,
    ...evidenceLines,
    "",
    `## ${t("draft_field_request")}`,
    val(input.request),
    "",
  ];
  return lines.join("\n");
}
