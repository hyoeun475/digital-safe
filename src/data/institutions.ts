/**
 * 공식 지원기관 데이터.
 * - AI가 생성한 연락처/URL은 절대 사용하지 않는다. 이 파일만이 유일한 출처다.
 * - 배포 전 각 기관 공식 홈페이지에서 최신 정보를 재확인하고 lastVerified를 갱신한다.
 */
export type InstitutionCategory =
  | "emergency"
  | "police_report"
  | "takedown_counseling"
  | "crisis_counseling";

export type Institution = {
  id: string;
  category: InstitutionCategory;
  name: { ko: string; en: string };
  purpose: { ko: string; en: string };
  url: string | null;
  phone: string | null;
  /** 정보 출처 설명 */
  source: { ko: string; en: string };
  /** YYYY-MM-DD, 마지막으로 공식 정보를 확인한 날짜 */
  lastVerified: string;
};

export const INSTITUTIONS: Institution[] = [
  {
    id: "police_112",
    category: "emergency",
    name: { ko: "경찰 긴급신고 112", en: "Police Emergency 112" },
    purpose: {
      ko: "즉각적인 신체 위험, 협박, 보복 위협 등 긴급 범죄 신고",
      en: "Emergency reporting for immediate physical danger, threats, or retaliation",
    },
    url: null,
    phone: "112",
    source: {
      ko: "기획서(PRD v2.0) 기재 정보. 전국 공통 긴급신고 번호.",
      en: "Listed in the project PRD v2.0. Nationwide emergency number.",
    },
    lastVerified: "2026-11-09",
  },
  {
    id: "ecrm",
    category: "police_report",
    name: {
      ko: "경찰청 사이버범죄 신고시스템(ECRM)",
      en: "Korean National Police Cybercrime Report System (ECRM)",
    },
    purpose: {
      ko: "사이버범죄 온라인 신고·상담 안내. 디지털 성범죄 신고 경로 확인",
      en: "Online cybercrime reporting and guidance, including digital sex crimes",
    },
    url: "https://ecrm.police.go.kr",
    phone: null,
    source: {
      ko: "기획서(PRD v2.0) 기재 URL. 운영시간·전화번호는 공식 사이트에서 확인 필요.",
      en: "URL from the project PRD v2.0. Check the official site for hours and phone.",
    },
    lastVerified: "2026-11-09",
  },
  {
    id: "d4u",
    category: "takedown_counseling",
    name: {
      ko: "디지털성범죄피해자지원센터",
      en: "Digital Sex Crime Victim Support Center",
    },
    purpose: {
      ko: "디지털 성범죄 피해 상담, 피해 촬영물 삭제 지원, 수사·법률·의료 지원 연계",
      en: "Counseling, takedown support for abusive content, and referral to legal, medical, and investigative help",
    },
    url: "https://d4u.stop.or.kr",
    phone: null,
    source: {
      ko: "기획서(PRD v2.0) 기재 URL. 전화번호·운영시간은 공식 사이트에서 확인 필요.",
      en: "URL from the project PRD v2.0. Check the official site for phone and hours.",
    },
    lastVerified: "2026-11-09",
  },
  {
    id: "women1366",
    category: "crisis_counseling",
    name: { ko: "여성긴급전화 1366", en: "Women's Emergency Hotline 1366" },
    purpose: {
      ko: "24시간 긴급 상담, 보호시설·의료·법률 지원 연계",
      en: "24-hour crisis counseling and referral to shelter, medical, and legal support",
    },
    url: "https://www.women1366.kr",
    phone: "1366",
    source: {
      ko: "기획서(PRD v2.0) 기재 URL 및 대표번호. 세부 운영 정보는 공식 사이트에서 확인 필요.",
      en: "URL and hotline number from the project PRD v2.0. Check the official site for details.",
    },
    lastVerified: "2026-11-09",
  },
];

export function getInstitution(id: string): Institution | undefined {
  return INSTITUTIONS.find((i) => i.id === id);
}
