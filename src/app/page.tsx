"use client";

import Link from "next/link";
import { useT } from "@/i18n";
import { INCIDENT_TYPE_OPTIONS } from "@/features/intake/options";
import { useSession } from "@/lib/session/SessionProvider";
import { useRouter } from "next/navigation";
import { Card, LinkButton } from "@/components/ui";

export default function HomePage() {
  const { t } = useT();
  const router = useRouter();
  const { updateIntake } = useSession();

  const pickType = (value: (typeof INCIDENT_TYPE_OPTIONS)[number]["value"]) => {
    updateIntake({ incidentType: value });
    router.push("/consultation");
  };

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-navy px-6 py-10 text-white sm:px-10 sm:py-14">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-soft/90">{t("appName")}</p>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">{t("hero_title")}</h1>
        <p className="mt-3 max-w-2xl text-lg text-blue-soft">{t("hero_sub")}</p>
        <p className="mt-1 text-sm text-blue-soft/80">{t("phrase_not_your_fault")} {t("phrase_talk_as_much")}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <LinkButton href="/consultation" variant="secondary" className="text-lg">
            {t("cta_consult")}
          </LinkButton>
          <LinkButton href="/report-draft" variant="ghost" className="border-white/40 text-white hover:bg-white/10">
            {t("cta_draft")}
          </LinkButton>
          <LinkButton href="/support" variant="ghost" className="border-white/40 text-white hover:bg-white/10">
            {t("cta_support")}
          </LinkButton>
        </div>
      </section>

      <section aria-labelledby="types-title">
        <h2 id="types-title" className="text-xl font-bold text-navy">
          {t("home_types_title")}
        </h2>
        <p className="mt-1 text-sm text-muted">{t("type_help")}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {INCIDENT_TYPE_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => pickType(o.value)}
              className="min-h-20 rounded-xl border border-border bg-surface p-4 text-left shadow-sm transition-colors hover:border-navy hover:bg-blue-soft"
            >
              <span className="block font-bold text-navy">{t(o.labelKey)}</span>
              <span className="mt-1 block text-sm text-muted">{t(o.descKey)}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold text-navy">{t("home_how_title")}</h2>
          <ul className="mt-3 space-y-3">
            {([1, 2, 3] as const).map((i) => (
              <li key={i}>
                <p className="font-semibold">{t(`home_how_${i}_title`)}</p>
                <p className="text-sm text-muted">{t(`home_how_${i}_desc`)}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="text-lg font-bold text-navy">{t("home_not_title")}</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
            {([1, 2, 3, 4] as const).map((i) => (
              <li key={i}>{t(`home_not_${i}`)}</li>
            ))}
          </ul>
          <Link href="/privacy" className="mt-4 inline-block text-sm font-semibold text-blue underline">
            {t("home_privacy_link")}
          </Link>
        </Card>
      </section>
    </div>
  );
}
