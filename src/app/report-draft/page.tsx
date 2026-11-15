"use client";

import { useEffect, useMemo, useState } from "react";
import { useT } from "@/i18n";
import { useSession } from "@/lib/session/SessionProvider";
import { buildDraft } from "@/features/report-draft/buildDraft";
import { INSTITUTIONS } from "@/data/institutions";
import { InstitutionCard } from "@/components/InstitutionCard";
import { Button, Card, CopyButton, Notice, PageTitle } from "@/components/ui";

export default function ReportDraftPage() {
  const { t, locale } = useT();
  const { state, setDraft, setDraftRequest } = useSession();

  const generated = useMemo(
    () =>
      buildDraft({
        locale,
        incidentType: state.intake.incidentType,
        situation: state.intake.situation,
        immediateRisk: state.intake.immediateRisk,
        description: state.intake.description,
        evidence: state.evidence,
        details: state.evidenceDetails,
        request: state.draftRequest,
      }),
    [locale, state.intake, state.evidence, state.evidenceDetails, state.draftRequest],
  );

  // 초안이 아직 없으면 현재 입력으로 생성한다.
  useEffect(() => {
    if (state.draft === null) setDraft(generated);
  }, [state.draft, generated, setDraft]);

  const [saved, setSaved] = useState(false);
  const draft = state.draft ?? generated;

  const regenerate = () => {
    if (state.draft && state.draft !== generated && !window.confirm(t("draft_regenerate_confirm"))) return;
    setDraft(generated);
  };

  const download = () => {
    const blob = new Blob([draft], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `digital-safe-draft-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const reportInstitutions = INSTITUTIONS.filter((i) => i.category === "police_report" || i.category === "takedown_counseling");

  return (
    <div className="space-y-6">
      <PageTitle title={t("draft_title")} intro={t("draft_intro")} />
      <Notice tone="warn" title={t("draft_disclaimer")} role="status">
        {t("draft_no_submit")}
      </Notice>
      {!state.intake.incidentType && <p className="text-sm text-muted">{t("draft_empty_hint")}</p>}

      <Card>
        <label className="block text-sm font-medium">
          {t("draft_field_request")} <span className="text-muted">({t("optional")})</span>
          <input
            type="text"
            maxLength={300}
            value={state.draftRequest}
            onChange={(e) => setDraftRequest(e.target.value)}
            placeholder={t("draft_request_placeholder")}
            className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-base focus:border-navy"
          />
        </label>
        <div className="mt-3">
          <Button variant="secondary" onClick={regenerate}>
            {t("draft_regenerate")}
          </Button>
        </div>
      </Card>

      <Card>
        <label htmlFor="draft" className="block text-sm font-semibold text-navy">
          {t("draft_textarea_label")}
        </label>
        <textarea
          id="draft"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={22}
          className="mt-2 w-full rounded-lg border border-border bg-white p-3 font-mono text-sm leading-relaxed focus:border-navy"
          spellCheck={false}
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <CopyButton text={draft} variant="primary" />
          <Button variant="secondary" onClick={download}>
            {saved ? "✓" : ""} {t("download")}
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted">{t("draft_download_note")}</p>
      </Card>

      <section aria-labelledby="draft-inst">
        <h2 id="draft-inst" className="text-lg font-bold text-navy">
          {t("result_resources")}
        </h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {reportInstitutions.map((inst) => (
            <InstitutionCard key={inst.id} inst={inst} />
          ))}
        </div>
      </section>
    </div>
  );
}
