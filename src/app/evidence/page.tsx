"use client";

import { useRouter } from "next/navigation";
import { useT, type TKey } from "@/i18n";
import { useSession } from "@/lib/session/SessionProvider";
import { PRIORITY_BY_TYPE, orderChecklist } from "@/features/evidence/checklist";
import { buildDraft } from "@/features/report-draft/buildDraft";
import { Badge, Button, Card, Notice, PageTitle } from "@/components/ui";

const inputClass = "mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-base focus:border-navy";

export default function EvidencePage() {
  const { t, locale } = useT();
  const router = useRouter();
  const { state, updateEvidenceItem, updateEvidenceDetails, setDraft } = useSession();
  const type = state.intake.incidentType;
  const items = orderChecklist(state.evidence, type);
  const priority = type ? PRIORITY_BY_TYPE[type] : [];
  const d = state.evidenceDetails;

  const onDraft = () => {
    setDraft(
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
    );
    router.push("/report-draft");
  };

  return (
    <div className="space-y-6">
      <PageTitle title={t("evidence_title")} intro={t("evidence_intro")} />
      <Notice tone="info">{t("evidence_no_upload")}</Notice>
      {type && (
        <p className="text-sm text-muted">
          {t("draft_field_type")}: <strong className="text-navy">{t(`type_${type}` as TKey)}</strong>
        </p>
      )}

      <Card>
        <h2 className="text-lg font-bold text-navy">{t("evidence_basic_title")}</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            {t("evidence_incident_date")} <span className="text-muted">({t("optional")})</span>
            <input type="datetime-local" className={inputClass} value={d.incidentDate} onChange={(e) => updateEvidenceDetails({ incidentDate: e.target.value })} />
          </label>
          <label className="block text-sm font-medium">
            {t("evidence_discovered_date")} <span className="text-muted">({t("optional")})</span>
            <input type="datetime-local" className={inputClass} value={d.discoveredDate} onChange={(e) => updateEvidenceDetails({ discoveredDate: e.target.value })} />
          </label>
          <label className="block text-sm font-medium">
            {t("evidence_platform")} <span className="text-muted">({t("optional")})</span>
            <input type="text" maxLength={200} className={inputClass} value={d.platformOrLocation} onChange={(e) => updateEvidenceDetails({ platformOrLocation: e.target.value })} />
          </label>
          <label className="block text-sm font-medium">
            {t("evidence_url")} <span className="text-muted">({t("optional")})</span>
            <input type="text" inputMode="url" maxLength={500} className={inputClass} value={d.url} onChange={(e) => updateEvidenceDetails({ url: e.target.value })} />
          </label>
          <label className="block text-sm font-medium sm:col-span-2">
            {t("evidence_description")} <span className="text-muted">({t("optional")})</span>
            <textarea rows={4} maxLength={2000} className={inputClass} value={d.description} onChange={(e) => updateEvidenceDetails({ description: e.target.value })} />
          </label>
        </div>
        <p className="mt-3 text-xs text-muted">{t("describe_privacy_warning")}</p>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-navy">{t("evidence_items_title")}</h2>
        <ul className="mt-3 space-y-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-lg border border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-3 font-medium">
                  <input type="checkbox" className="h-5 w-5" checked={item.collected} onChange={(e) => updateEvidenceItem(item.id, { collected: e.target.checked })} />
                  <span>{t(`ev_${item.id}` as TKey)}</span>
                </label>
                <div className="flex items-center gap-2">
                  {priority.includes(item.id) && <Badge tone="info">{t("evidence_priority_badge")}</Badge>}
                  <Badge tone={item.collected ? "ok" : "warn"}>{item.collected ? t("draft_collected") : t("draft_not_collected")}</Badge>
                </div>
              </div>
              <input
                type="text"
                maxLength={300}
                placeholder={t("evidence_note_placeholder")}
                className={`${inputClass} text-sm`}
                value={item.note}
                onChange={(e) => updateEvidenceItem(item.id, { note: e.target.value })}
                aria-label={`${t(`ev_${item.id}` as TKey)} note`}
              />
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">{t("evidence_saved_note")}</p>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-navy">{t("evidence_guide_title")}</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {([1, 2, 3, 4, 5] as const).map((i) => (
            <li key={i}>{t(`evidence_guide_${i}`)}</li>
          ))}
        </ul>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={onDraft}>{t("evidence_to_draft")}</Button>
        <Button variant="secondary" onClick={() => router.push("/support")}>
          {t("nav_support")}
        </Button>
      </div>
    </div>
  );
}
