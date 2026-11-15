/**
 * 서버 측 AI 제공업체 연결. API 키는 이 모듈(서버)에서만 사용된다.
 * 현재 지원: anthropic (Anthropic SDK).
 */
import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { AiConfig } from "@/lib/env";
import { SYSTEM_PROMPT, buildUserMessage } from "./prompts";
import { ModelOutputSchema, type ConsultationRequest, type ModelOutput } from "./schema";

export class AiOutputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiOutputError";
  }
}

/** 모델 응답 문자열에서 JSON 객체를 추출해 검증한다. 실패하면 AiOutputError. */
export function parseModelOutput(text: string): ModelOutput {
  let candidate = text.trim();
  const fence = candidate.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) candidate = fence[1].trim();
  if (!candidate.startsWith("{")) {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) throw new AiOutputError("no_json_object");
    candidate = candidate.slice(start, end + 1);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    throw new AiOutputError("invalid_json");
  }
  const result = ModelOutputSchema.safeParse(parsed);
  if (!result.success) throw new AiOutputError("schema_mismatch");
  return result.data;
}

export async function callAnthropic(
  config: Extract<AiConfig, { configured: true }>,
  req: ConsultationRequest,
): Promise<ModelOutput> {
  const client = new Anthropic({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
    timeout: 60_000,
    maxRetries: 1,
  });

  const response = await client.messages.create({
    model: config.model,
    max_tokens: 4096,
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    output_config: { effort: "low" },
    messages: [{ role: "user", content: buildUserMessage(req) }],
  });

  if (response.stop_reason === "refusal") throw new AiOutputError("refusal");
  if (response.stop_reason === "max_tokens") throw new AiOutputError("truncated");

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  return parseModelOutput(text);
}

export async function callProvider(
  config: Extract<AiConfig, { configured: true }>,
  req: ConsultationRequest,
): Promise<ModelOutput> {
  switch (config.provider) {
    case "anthropic":
      return callAnthropic(config, req);
  }
}
