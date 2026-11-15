"use client";

import { useT } from "@/i18n";
import type { ConsultationResponse } from "@/types/consultation";
import { Notice } from "./ui";

export function ModeBadge({ mode, modeReason }: Pick<ConsultationResponse, "mode" | "modeReason">) {
  const { t } = useT();
  if (mode === "ai") {
    return (
      <Notice tone="ok" title={t("mode_ai")} role="status">
        {t("mode_ai_desc")}
      </Notice>
    );
  }
  return (
    <Notice tone="warn" title={t("mode_demo")} role="status">
      <p>{t("mode_demo_desc")}</p>
      {modeReason === "consent_not_given" && <p className="mt-1">{t("mode_reason_consent")}</p>}
      {modeReason === "ai_error_fallback" && <p className="mt-1">{t("mode_reason_error")}</p>}
    </Notice>
  );
}
