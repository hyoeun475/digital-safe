export const INCIDENT_TYPES = [
  "illegal_filming",
  "deepfake",
  "distribution",
  "threat",
  "cyber_harassment",
] as const;
export type IncidentType = (typeof INCIDENT_TYPES)[number];

export const SITUATIONS = [
  "suspected",
  "confirmed_filming",
  "found_online",
  "being_threatened",
  "already_reported",
  "other",
] as const;
export type Situation = (typeof SITUATIONS)[number];

export const RISK_ANSWERS = ["yes", "no", "unsure"] as const;
export type RiskAnswer = (typeof RISK_ANSWERS)[number];

export type UrgentRiskLevel =
  | "unknown"
  | "no_immediate_risk"
  | "possible_risk"
  | "immediate_risk";

export type StepPriority = "urgent" | "high" | "normal";

export type RecommendedStep = {
  title: string;
  description: string;
  priority: StepPriority;
};

export type SupportResource = {
  id: string;
  name: string;
  purpose: string;
  url: string | null;
  phone: string | null;
};

export type ConsultationResult = {
  acknowledgement: string;
  urgentRisk: { level: UrgentRiskLevel; message: string };
  incidentSummary: string;
  unknownOrUnconfirmed: string[];
  recommendedSteps: RecommendedStep[];
  supportResources: SupportResource[];
  offerReportDraft: boolean;
  disclaimer: string;
};

export type ConsultationMode = "demo" | "ai";

export type ConsultationResponse = {
  mode: ConsultationMode;
  modeReason:
    | "ai_not_configured"
    | "consent_not_given"
    | "ai_error_fallback"
    | "ai";
  result: ConsultationResult;
};

export type EvidenceCategory =
  | "screenshot_post"
  | "screenshot_chat"
  | "threat_message"
  | "url_or_account"
  | "payment_record"
  | "timeline_memo"
  | "witness_or_report_record";

export type EvidenceItem = {
  id: EvidenceCategory;
  collected: boolean;
  note: string;
};

export type EvidenceDetails = {
  incidentDate: string;
  discoveredDate: string;
  platformOrLocation: string;
  url: string;
  description: string;
};
