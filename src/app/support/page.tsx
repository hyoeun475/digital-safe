"use client";

import { useT } from "@/i18n";
import { useSession } from "@/lib/session/SessionProvider";
import { INSTITUTIONS } from "@/data/institutions";
import { InstitutionCard } from "@/components/InstitutionCard";
import { Card, LinkButton, Notice, PageTitle } from "@/components/ui";

export default function SupportPage() {
  const { t } = useT();
  const { state } = useSession();
  const d = state.evidenceDetails;
  const hasMemo = Boolean(d.url.trim() || d.discoveredDate.trim() || d.platformOrLocation.trim());

  return (
    <div className="space-y-8">
      <PageTitle title={t("support_title")} intro={t("support_intro")} />
      <Notice tone="info">{t("verify_notice")}</Notice>

      <section aria-labelledby="inst-title">
        <h2 id="inst-title" className="text-xl font-bold text-navy">
          {t("result_resources")}
        </h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {INSTITUTIONS.map((inst) => (
            <InstitutionCard key={inst.id} inst={inst} />
          ))}
        </div>
      </section>

      <Card>
        <h2 className="text-xl font-bold text-navy">{t("support_anon_title")}</h2>
        <p className="mt-2">{t("support_anon_desc")}</p>
        <h3 className="mt-4 font-semibold">{t("support_anon_prep_title")}</h3>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
          <li>{t("support_anon_prep_1")}</li>
          <li>{t("support_anon_prep_2")}</li>
          <li>{t("support_anon_prep_3")}</li>
        </ul>
        <div className="mt-4">
          <Notice tone="warn">{t("support_anon_honest")}</Notice>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-navy">{t("support_takedown_title")}</h2>
        <p className="mt-2">{t("support_takedown_desc")}</p>
        <h3 className="mt-4 font-semibold">{t("support_takedown_prep_title")}</h3>
        <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm">
          <li>{t("support_takedown_prep_1")}</li>
          <li>{t("support_takedown_prep_2")}</li>
          <li>{t("support_takedown_prep_3")}</li>
        </ol>
        <h3 className="mt-4 font-semibold">{t("support_your_memo")}</h3>
        {hasMemo ? (
          <dl className="mt-1 grid gap-1 text-sm sm:grid-cols-[auto_1fr]">
            {d.platformOrLocation.trim() && (
              <>
                <dt className="font-medium">{t("evidence_platform")}</dt>
                <dd className="break-all">{d.platformOrLocation}</dd>
              </>
            )}
            {d.url.trim() && (
              <>
                <dt className="font-medium">{t("evidence_url")}</dt>
                <dd className="break-all">{d.url}</dd>
              </>
            )}
            {d.discoveredDate.trim() && (
              <>
                <dt className="font-medium">{t("evidence_discovered_date")}</dt>
                <dd>{d.discoveredDate.replace("T", " ")}</dd>
              </>
            )}
          </dl>
        ) : (
          <p className="mt-1 text-sm text-muted">{t("support_memo_empty")}</p>
        )}
        <div className="mt-4">
          <LinkButton href="/evidence" variant="secondary">
            {t("nav_evidence")}
          </LinkButton>
        </div>
      </Card>
    </div>
  );
}
