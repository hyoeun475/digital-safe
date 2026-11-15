/**
 * 서버 전용 환경변수 접근. 이 모듈은 클라이언트 번들에 포함되면 안 된다.
 * (NEXT_PUBLIC_ 접두사가 없으므로 Next.js가 브라우저로 노출하지 않는다.)
 */
import "server-only";

export type AiProvider = "anthropic";

export type AiConfig =
  | { configured: false }
  | { configured: true; provider: AiProvider; apiKey: string; model: string; baseUrl?: string };

export function getAiConfig(env: NodeJS.ProcessEnv = process.env): AiConfig {
  const provider = (env.AI_PROVIDER ?? "").trim().toLowerCase();
  const apiKey = (env.AI_API_KEY ?? "").trim();
  if (provider !== "anthropic" || !apiKey) return { configured: false };
  const model = (env.AI_MODEL ?? "").trim() || "claude-opus-5-5";
  const baseUrl = (env.AI_API_BASE_URL ?? "").trim() || undefined;
  return { configured: true, provider: "anthropic", apiKey, model, baseUrl };
}
