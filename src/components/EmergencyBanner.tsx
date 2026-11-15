"use client";

import { useT } from "@/i18n";

export function EmergencyBanner() {
  const { t } = useT();
  return (
    <div className="border-b border-danger-border bg-danger-bg text-danger-fg">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm">
        <p className="font-medium">{t("emergency_banner")}</p>
        <a href="tel:112" className="rounded-md border border-danger-border bg-white px-3 py-1 font-bold hover:bg-danger-bg">
          {t("call")} 112
        </a>
      </div>
    </div>
  );
}

export function EmergencyGuide({ onContinue }: { onContinue?: () => void }) {
  const { t } = useT();
  return (
    <section role="alert" aria-live="assertive" className="rounded-xl border-2 border-danger-border bg-danger-bg p-5 text-danger-fg sm:p-6">
      <h2 className="text-xl font-bold">{t("emergency_title")}</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        <li>{t("emergency_step1")}</li>
        <li>{t("emergency_step2")}</li>
        <li>{t("emergency_step3")}</li>
        <li>{t("emergency_step4")}</li>
      </ol>
      <div className="mt-4 flex flex-wrap gap-3">
        <a href="tel:112" className="inline-flex min-h-12 items-center rounded-lg bg-danger-fg px-5 py-3 text-lg font-bold text-white hover:opacity-90">
          {t("call")} 112
        </a>
        <a href="tel:1366" className="inline-flex min-h-12 items-center rounded-lg border border-danger-border bg-white px-5 py-3 font-semibold hover:bg-white/70">
          {t("call")} 1366
        </a>
      </div>
      <p className="mt-4 text-sm">{t("emergency_note")}</p>
      {onContinue && (
        <button type="button" onClick={onContinue} className="mt-3 min-h-11 rounded-lg border border-danger-border bg-white px-4 py-2 text-sm font-semibold hover:bg-white/70">
          {t("emergency_continue")}
        </button>
      )}
    </section>
  );
}
