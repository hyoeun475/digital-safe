import { z } from "zod";
import { INCIDENT_TYPES, RISK_ANSWERS, SITUATIONS } from "@/types/consultation";

export const DESCRIPTION_MIN = 10;
export const DESCRIPTION_MAX = 2000;

/** POST /api/consultation 요청 본문 */
export const ConsultationRequestSchema = z.object({
  incidentType: z.enum(INCIDENT_TYPES),
  situation: z.enum(SITUATIONS).nullable().default(null),
  description: z.string().trim().min(DESCRIPTION_MIN).max(DESCRIPTION_MAX),
  immediateRisk: z.enum(RISK_ANSWERS),
  aiConsent: z.boolean().default(false),
  locale: z.enum(["ko", "en"]).default("ko"),
});
export type ConsultationRequest = z.infer<typeof ConsultationRequestSchema>;

/**
 * 모델이 반환해야 하는 JSON. 기관 정보(support_resources)는 모델 출력에서 받지 않는다.
 * 모델은 기관 id만 추천하고, 서버가 검증된 데이터로 치환한다 (PRD 5.4).
 */
export const ModelOutputSchema = z.object({
  acknowledgement: z.string().min(1).max(400),
  urgent_risk: z.object({
    level: z.enum(["unknown", "no_immediate_risk", "possible_risk", "immediate_risk"]),
    message: z.string().min(1).max(600),
  }),
  incident_summary: z.string().min(1).max(1500),
  unknown_or_unconfirmed: z.array(z.string().max(300)).max(10),
  recommended_steps: z
    .array(
      z.object({
        title: z.string().min(1).max(120),
        description: z.string().min(1).max(600),
        priority: z.enum(["urgent", "high", "normal"]),
      }),
    )
    .min(1)
    .max(8),
  support_resource_ids: z.array(z.string().max(40)).max(8),
  offer_report_draft: z.boolean(),
  disclaimer: z.string().min(1).max(400),
});
export type ModelOutput = z.infer<typeof ModelOutputSchema>;
