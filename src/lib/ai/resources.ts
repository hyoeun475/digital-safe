import { INSTITUTIONS, getInstitution } from "@/data/institutions";
import type { Locale } from "@/i18n";
import type { IncidentType, RiskAnswer, SupportResource } from "@/types/consultation";

/** 검증된 기관 데이터를 UI용 SupportResource로 변환한다. */
export function toSupportResource(id: string, locale: Locale): SupportResource | null {
  const inst = getInstitution(id);
  if (!inst) return null;
  return {
    id: inst.id,
    name: inst.name[locale],
    purpose: inst.purpose[locale],
    url: inst.url,
    phone: inst.phone,
  };
}

/**
 * 모델이 추천한 id 목록을 검증된 데이터로 치환한다.
 * 알 수 없는 id는 버린다. 긴급 위험이면 112를 최상단에 보장한다.
 */
export function resolveResources(ids: string[], locale: Locale, immediateRisk: RiskAnswer): SupportResource[] {
  const ordered: string[] = [];
  if (immediateRisk === "yes") ordered.push("police_112");
  for (const id of ids) if (!ordered.includes(id)) ordered.push(id);
  const resolved = ordered.map((id) => toSupportResource(id, locale)).filter((r): r is SupportResource => r !== null);
  return resolved.length > 0 ? resolved : defaultResources(null, locale, immediateRisk);
}

/** 규칙 기반 기본 기관 추천(데모 모드 및 폴백) */
export function defaultResources(type: IncidentType | null, locale: Locale, immediateRisk: RiskAnswer): SupportResource[] {
  const ids: string[] = [];
  if (immediateRisk !== "no") ids.push("police_112");
  switch (type) {
    case "deepfake":
    case "distribution":
      ids.push("d4u", "ecrm", "women1366");
      break;
    case "threat":
      ids.push("ecrm", "d4u", "women1366");
      break;
    case "illegal_filming":
      ids.push("ecrm", "d4u", "women1366");
      break;
    case "cyber_harassment":
      ids.push("ecrm", "women1366", "d4u");
      break;
    default:
      ids.push(...INSTITUTIONS.map((i) => i.id));
  }
  const unique = ids.filter((id, i) => ids.indexOf(id) === i);
  return unique.map((id) => toSupportResource(id, locale)).filter((r): r is SupportResource => r !== null);
}
