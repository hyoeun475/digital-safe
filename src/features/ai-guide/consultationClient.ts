import type { ConsultationRequest } from "@/lib/ai/schema";
import type { ConsultationResponse } from "@/types/consultation";

export class ConsultationClientError extends Error {
  constructor(
    public readonly code: "rate_limited" | "invalid_request" | "server_error" | "network",
    public readonly retryAfterSec = 0,
  ) {
    super(code);
    this.name = "ConsultationClientError";
  }
}

export async function requestConsultation(req: ConsultationRequest): Promise<ConsultationResponse> {
  let res: Response;
  try {
    res = await fetch("/api/consultation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      cache: "no-store",
    });
  } catch {
    throw new ConsultationClientError("network");
  }
  if (res.status === 429) {
    throw new ConsultationClientError("rate_limited", Number(res.headers.get("Retry-After") ?? "60"));
  }
  if (res.status === 400 || res.status === 413) throw new ConsultationClientError("invalid_request");
  if (!res.ok) throw new ConsultationClientError("server_error");
  return (await res.json()) as ConsultationResponse;
}

export async function fetchAiStatus(): Promise<{ aiConfigured: boolean }> {
  try {
    const res = await fetch("/api/status", { cache: "no-store" });
    if (!res.ok) return { aiConfigured: false };
    const data = (await res.json()) as { aiConfigured?: boolean };
    return { aiConfigured: Boolean(data.aiConfigured) };
  } catch {
    return { aiConfigured: false };
  }
}
