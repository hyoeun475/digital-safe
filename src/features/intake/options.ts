import type { TKey } from "@/i18n";
import { INCIDENT_TYPES, RISK_ANSWERS, SITUATIONS, type IncidentType, type RiskAnswer, type Situation } from "@/types/consultation";

export const INCIDENT_TYPE_OPTIONS: { value: IncidentType; labelKey: TKey; descKey: TKey }[] = INCIDENT_TYPES.map((v) => ({
  value: v,
  labelKey: `type_${v}` as TKey,
  descKey: `type_${v}_desc` as TKey,
}));

export const SITUATION_OPTIONS: { value: Situation; labelKey: TKey }[] = SITUATIONS.map((v) => ({
  value: v,
  labelKey: `situation_${v}` as TKey,
}));

export const RISK_OPTIONS: { value: RiskAnswer; labelKey: TKey }[] = RISK_ANSWERS.map((v) => ({
  value: v,
  labelKey: `risk_${v}` as TKey,
}));
