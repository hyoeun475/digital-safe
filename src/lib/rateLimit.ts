/**
 * 단순 인메모리 고정 윈도우 레이트 리밋.
 * - 단일 인스턴스 MVP용. 다중 인스턴스 배포 시 외부 스토어로 교체한다.
 * - 키(IP 해시 등)와 카운트만 보관하며 요청 본문은 저장하지 않는다.
 */
type Bucket = { count: number; resetAt: number };

export class RateLimiter {
  private buckets = new Map<string, Bucket>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  /** 허용되면 true. 거부되면 false. */
  check(key: string): { allowed: boolean; retryAfterSec: number } {
    const t = this.now();
    const bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= t) {
      this.buckets.set(key, { count: 1, resetAt: t + this.windowMs });
      this.sweep(t);
      return { allowed: true, retryAfterSec: 0 };
    }
    if (bucket.count >= this.limit) {
      return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - t) / 1000)) };
    }
    bucket.count += 1;
    return { allowed: true, retryAfterSec: 0 };
  }

  private sweep(t: number) {
    if (this.buckets.size < 1000) return;
    for (const [k, b] of this.buckets) if (b.resetAt <= t) this.buckets.delete(k);
  }
}

/** 분당 10회 */
export const consultationLimiter = new RateLimiter(10, 60_000);

/** 요청자 식별 키. IP를 그대로 저장하지 않도록 간단히 해시한다. */
export async function clientKey(headers: Headers): Promise<string> {
  const ip =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown";
  const data = new TextEncoder().encode(ip);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest).slice(0, 8))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
