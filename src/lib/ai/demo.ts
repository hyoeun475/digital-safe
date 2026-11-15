/**
 * 데모 모드: 규칙 기반 예시 응답.
 * 실제 AI 분석이 아니며, 외부로 아무것도 전송하지 않는다.
 * 사용자 설명은 요약에 "인용"만 하고 해석·추론을 추가하지 않는다.
 */
import type { Locale } from "@/i18n";
import type { ConsultationResult, RecommendedStep, UrgentRiskLevel } from "@/types/consultation";
import type { ConsultationRequest } from "./schema";
import { defaultResources } from "./resources";

type L = Record<Locale, string>;
const pick = (l: L, locale: Locale) => l[locale];

const ACK: L = {
  ko: "이야기해 주셔서 고맙습니다. 당신의 잘못이 아닙니다. 지금부터 상황을 차분히 정리해 보겠습니다.",
  en: "Thank you for sharing this. It is not your fault. Let's organize the situation calmly.",
};

const DISCLAIMER: L = {
  ko: "이 안내는 데모 모드의 규칙 기반 예시이며 실제 AI 분석, 공식 신고 접수, 법률 판단이 아닙니다.",
  en: "This is rule-based sample guidance in demo mode. It is not real AI analysis, an official report, or legal judgment.",
};

const RISK_MESSAGE: Record<UrgentRiskLevel, L> = {
  immediate_risk: {
    ko: "지금 안전이 가장 중요합니다. 가능하면 가해자와 떨어진 안전한 장소로 이동하고, 긴급한 위험이면 112에 연락하세요. 가해자에게 직접 연락하거나 대면하지 마세요.",
    en: "Your safety comes first. If possible, move to a safe place away from the person threatening you, and call 112 if the danger is immediate. Do not contact or meet them.",
  },
  possible_risk: {
    ko: "위험 여부를 확신하기 어렵다고 하셨습니다. 불안하거나 위협이 느껴지면 주저하지 말고 112 또는 여성긴급전화 1366에 연락하세요.",
    en: "You said you are unsure about the risk. If you feel unsafe or threatened, do not hesitate to call 112 or the 1366 hotline.",
  },
  no_immediate_risk: {
    ko: "현재 즉각적인 신체 위험은 없다고 답하셨습니다. 상황이 바뀌면 언제든 112에 연락할 수 있습니다.",
    en: "You answered that there is no immediate physical danger. If that changes, you can call 112 at any time.",
  },
  unknown: {
    ko: "안전 여부가 확인되지 않았습니다. 위험이 느껴지면 112에 연락하세요.",
    en: "Safety status was not confirmed. If you feel in danger, call 112.",
  },
};

const TYPE_SUMMARY: Record<ConsultationRequest["incidentType"], L> = {
  illegal_filming: { ko: "불법촬영 또는 촬영 의심", en: "illegal filming or suspected filming" },
  deepfake: { ko: "딥페이크·허위 영상물", en: "deepfake or fabricated media" },
  distribution: { ko: "영상·사진 유포 또는 재유포", en: "distribution or re-distribution of images or video" },
  threat: { ko: "유포 협박 또는 금전 요구", en: "threats to distribute or demands for money" },
  cyber_harassment: { ko: "온라인 성희롱 또는 사이버 성범죄", en: "online sexual harassment or cyber sex crime" },
};

const SITUATION_SUMMARY: Record<NonNullable<ConsultationRequest["situation"]>, L> = {
  suspected: { ko: "피해가 의심되지만 확실하지 않은 상태", en: "harm is suspected but not certain" },
  confirmed_filming: { ko: "촬영 또는 제작 정황을 확인한 상태", en: "signs of filming or creation were found" },
  found_online: { ko: "온라인 게시물이나 유포 사실을 발견한 상태", en: "a post or distribution was discovered" },
  being_threatened: { ko: "유포하겠다는 협박을 받고 있는 상태", en: "currently being threatened with distribution" },
  already_reported: { ko: "이미 경찰 또는 기관에 신고한 상태", en: "already reported to police or an organization" },
  other: { ko: "기타 상황", en: "other situation" },
};

const UNKNOWN_COMMON: L[] = [
  { ko: "피해가 발생한 정확한 일시와 장소(또는 플랫폼)", en: "Exact date, time, and place (or platform) of the harm" },
  { ko: "게시물 URL이나 게시자 계정 정보를 확보했는지 여부", en: "Whether post URLs or poster account details have been secured" },
  { ko: "현재까지 확보한 자료(캡처, 메시지 등)의 종류와 보관 위치", en: "What materials (screenshots, messages) you have and where they are kept" },
];

const UNKNOWN_BY_TYPE: Partial<Record<ConsultationRequest["incidentType"], L[]>> = {
  illegal_filming: [{ ko: "촬영 장치 여부는 사진만으로 확정할 수 없으므로 전문기관 확인이 필요함", en: "A device cannot be confirmed from a photo alone; professional verification is needed" }],
  threat: [{ ko: "협박 메시지가 어떤 경로(문자·메신저·이메일)로 왔는지, 금전 요구가 있었는지", en: "Which channel the threats came through and whether money was demanded" }],
  deepfake: [{ ko: "해당 영상물이 현재도 게시되어 있는지, 몇 곳에 올라와 있는지", en: "Whether the content is still posted and in how many places" }],
  distribution: [{ ko: "해당 영상물이 현재도 게시되어 있는지, 몇 곳에 올라와 있는지", en: "Whether the content is still posted and in how many places" }],
};

type StepL = { title: L; description: L; priority: RecommendedStep["priority"] };

const STEP_SAFETY: StepL = {
  title: { ko: "안전 확보", en: "Secure your safety" },
  description: {
    ko: "안전한 장소로 이동하고 긴급하면 112에 연락하세요. 가해자와 직접 연락하지 마세요.",
    en: "Move to a safe place and call 112 if urgent. Do not contact the perpetrator directly.",
  },
  priority: "urgent",
};
const STEP_PRESERVE: StepL = {
  title: { ko: "자료 보존", en: "Preserve materials" },
  description: {
    ko: "게시물·대화 화면을 캡처하고 URL과 발견 일시를 메모하세요. 원본은 편집·삭제하지 마세요.",
    en: "Screenshot posts and chats, note URLs and discovery times. Do not edit or delete originals.",
  },
  priority: "high",
};
const STEP_NO_CONTACT: StepL = {
  title: { ko: "요구에 응하지 않기", en: "Do not comply with demands" },
  description: {
    ko: "돈이나 추가 사진을 보내지 마세요. 협박 메시지는 지우지 말고 보존한 뒤 공식기관과 상의하세요.",
    en: "Do not send money or more images. Keep threat messages and consult an official organization.",
  },
  priority: "high",
};
const STEP_TAKEDOWN: StepL = {
  title: { ko: "삭제 지원 상담", en: "Takedown support counseling" },
  description: {
    ko: "디지털성범죄피해자지원센터에 삭제 지원을 문의할 수 있습니다. 신청 전 URL·발견 일시를 정리해 두세요.",
    en: "You can ask the Digital Sex Crime Victim Support Center about takedown support. Prepare URLs and discovery times first.",
  },
  priority: "high",
};
const STEP_REPORT: StepL = {
  title: { ko: "신고 경로 확인", en: "Check reporting routes" },
  description: {
    ko: "경찰청 사이버범죄 신고시스템(ECRM) 또는 가까운 경찰서를 통해 신고할 수 있습니다. 신고 여부는 본인이 결정합니다.",
    en: "You can report through the police cybercrime system (ECRM) or a local station. Whether to report is your decision.",
  },
  priority: "normal",
};
const STEP_COUNSEL: StepL = {
  title: { ko: "상담·심리 지원", en: "Counseling and support" },
  description: {
    ko: "신고를 결정하기 전에도 여성긴급전화 1366 등에서 상담받을 수 있습니다.",
    en: "Even before deciding to report, you can talk to the 1366 hotline or a support center.",
  },
  priority: "normal",
};
const STEP_FOLLOWUP: StepL = {
  title: { ko: "신고 후 지원 확인", en: "Post-report support" },
  description: {
    ko: "이미 신고하셨다면 삭제 지원·심리·법률 지원을 추가로 받을 수 있는지 지원센터에 문의하세요.",
    en: "If you have already reported, ask the support center about takedown, counseling, and legal support.",
  },
  priority: "normal",
};
const STEP_DRAFT: StepL = {
  title: { ko: "진술 내용 정리", en: "Organize your statement" },
  description: {
    ko: "원하시면 신고 준비용 진술서 초안을 만들어 수정·복사할 수 있습니다. 자동으로 제출되지 않습니다.",
    en: "If you wish, create a report statement draft to edit and copy. Nothing is submitted automatically.",
  },
  priority: "normal",
};

function stepsFor(req: ConsultationRequest): StepL[] {
  const steps: StepL[] = [];
  if (req.immediateRisk === "yes") steps.push(STEP_SAFETY);
  steps.push(STEP_PRESERVE);
  if (req.incidentType === "threat" || req.situation === "being_threatened") steps.push(STEP_NO_CONTACT);
  if (req.incidentType === "deepfake" || req.incidentType === "distribution" || req.situation === "found_online") {
    steps.push(STEP_TAKEDOWN);
  }
  if (req.situation === "already_reported") steps.push(STEP_FOLLOWUP);
  else steps.push(STEP_REPORT);
  steps.push(STEP_COUNSEL, STEP_DRAFT);
  return steps;
}

export function riskLevelFromAnswer(answer: ConsultationRequest["immediateRisk"]): UrgentRiskLevel {
  if (answer === "yes") return "immediate_risk";
  if (answer === "no") return "no_immediate_risk";
  return "possible_risk";
}

function quote(description: string, locale: Locale): string {
  const trimmed = description.trim().replace(/\s+/g, " ");
  const short = trimmed.length > 300 ? trimmed.slice(0, 300) + "…" : trimmed;
  return locale === "ko" ? `사용자 진술: “${short}”` : `Your statement: “${short}”`;
}

export function generateDemoResult(req: ConsultationRequest): ConsultationResult {
  const locale = req.locale;
  const level = riskLevelFromAnswer(req.immediateRisk);
  const typeText = pick(TYPE_SUMMARY[req.incidentType], locale);
  const situationText = req.situation ? pick(SITUATION_SUMMARY[req.situation], locale) : null;

  const summaryHead =
    locale === "ko"
      ? `선택한 피해 유형은 ‘${typeText}’이며${situationText ? `, 현재 상황은 ‘${situationText}’로 선택했습니다` : ""}.`
      : `Selected harm type: ${typeText}${situationText ? `; current situation: ${situationText}` : ""}.`;

  const unknown = [...(UNKNOWN_BY_TYPE[req.incidentType] ?? []), ...UNKNOWN_COMMON].map((u) => pick(u, locale));

  return {
    acknowledgement: pick(ACK, locale),
    urgentRisk: { level, message: pick(RISK_MESSAGE[level], locale) },
    incidentSummary: `${summaryHead}\n${quote(req.description, locale)}`,
    unknownOrUnconfirmed: unknown,
    recommendedSteps: stepsFor(req).map((s) => ({
      title: pick(s.title, locale),
      description: pick(s.description, locale),
      priority: s.priority,
    })),
    supportResources: defaultResources(req.incidentType, locale, req.immediateRisk),
    offerReportDraft: true,
    disclaimer: pick(DISCLAIMER, locale),
  };
}

/** AI 응답 실패 시 사용하는 안전한 기본 응답(데모 생성기와 동일하되 면책 문구만 다름) */
export function generateSafeFallback(req: ConsultationRequest): ConsultationResult {
  const base = generateDemoResult(req);
  return {
    ...base,
    disclaimer:
      req.locale === "ko"
        ? "AI 응답을 확인할 수 없어 안전한 기본 안내로 대체했습니다. 공식 신고 접수나 법률 판단이 아닙니다."
        : "The AI response could not be verified, so safe default guidance is shown. This is not an official report or legal judgment.",
  };
}
