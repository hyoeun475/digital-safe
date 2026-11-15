"use client";

import { useRouter } from "next/navigation";
import { useT } from "@/i18n";
import { useSession } from "@/lib/session/SessionProvider";
import { INSTITUTIONS } from "@/data/institutions";
import { buildDraft } from "@/features/report-draft/buildDraft";
import { ModeBadge } from "@/components/ModeBadge";
import { EmergencyGuide } from "@/components/EmergencyBanner";
import { InstitutionCard } from "@/components/InstitutionCard";
import { Badge, Button, Card, CopyButton, LinkButton, PageTitle } from "@/components/ui";
import type { StepPriority } from "@/types/consultation";

const PRIORITY_TONE: Record<StepPriority, "danger" | "warn" | "info"> = { urgent: "danger", high: "warn", normal: "info" };

export default function ResultPage() {
  const { t, locale } = useT();
  const router = useRouter();
  const { state, setDraft, resetAll } = useSession();
  const { result } = state;

  if (!result) {
    return (
      <div className="space-y-4">
        <PageTitle title={t("result_title")} />
        <Card>
          <p>{t("result_empty")}</p>
          <div className="mt-4">
            <LinkButton href="/consultation">{t("result_go_consult")}</LinkButton>
          </div>
        </Card>
      </div>
    );
  }

  const r = result.result;
  const immediate = r.urgentRisk.level === "immediate_risk";

  const plainText = [
    `[${result.mode === "ai" ? t("mode_ai") : t("mode_demo")}]`,
    "",
    r.acknowledgement,
    "",
    `${t("risk_level_label")}: ${t(`risk_level_${r.urgentRisk.level}`)}`,
    r.urgentRisk.message,
    "",
    `## ${t("result_summary")}`,
    r.incidentSummary,
    "",
    `## ${t("result_unknown")}`,
    ...r.unknownOrUnconfirmed.map((u) => `- ${u}`),
    "",
    `## ${t("result_steps")}`,
    ...r.recommendedSteps.map((s) => `- [${t(`priority_${s.priority}`)}] ${s.title}: ${s.description}`),
    "",
    `## ${t("result_resources")}`,
    ...r.supportResources.map((s) => `- ${s.name}${s.phone ? ` (${s.phone})` : ""}${s.url ? ` ${s.url}` : ""}`),
    "",
    r.disclaimer,
  ].join("\n");

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

  const institutionsForResult = r.supportResources
    .map((s) => INSTITUTIONS.find((i) => i.id === s.id))
    .filter((i): i is (typeof INSTITUTIONS)[number] => Boolean(i));

  return (
    <div className="space-y-6">
      <PageTitle title={t("result_title")} />
      <ModeBadge mode={result.mode} modeReason={result.modeReason} />

      {immediate && <EmergencyGuide />}

      <Card>
        <p className="text-lg font-semibold text-navy">{r.acknowledgement}</p>
        <div className="mt-4 rounded-lg border border-border bg-background p-3 text-sm">
          <p className="font-semibold">
            {t("risk_level_label")}: <Badge tone={immediate ? "danger" : r.urgentRisk.level === "possible_risk" ? "warn" : "ok"}>{t(`risk_level_${r.urgentRisk.level}`)}</Badge>
          </p>
          <p className="mt-1">{r.urgentRisk.message}</p>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-navy">{t("result_summary")}</h2>
        <p className="mt-2 whitespace-pre-wrap">{r.incidentSummary}</p>
      </Card>

      {r.unknownOrUnconfirmed.length > 0 && (
        <Card>
          <h2 className="text-lg font-bold text-navy">{t("result_unknown")}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {r.unknownOrUnconfirmed.map((u, i) => (
              <li key={i}>{u}</li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <h2 className="text-lg font-bold text-navy">{t("result_steps")}</h2>
        <ol className="mt-3 space-y-3">
          {r.recommendedSteps.map((s, i) => (
            <li key={i} className="rounded-lg border border-border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={PRIORITY_TONE[s.priority]}>{t(`priority_${s.priority}`)}</Badge>
                <span className="font-semibold">{s.title}</span>
              </div>
              <p className="mt-1 text-sm text-muted">{s.description}</p>
            </li>
          ))}
        </ol>
      </Card>

      <section aria-labelledby="res-title">
        <h2 id="res-title" className="text-lg font-bold text-navy">
          {t("result_resources")}
        </h2>
        <p className="mt-1 text-xs text-muted">{t("verify_notice")}</p>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {institutionsForResult.map((inst) => (
            <InstitutionCard key={inst.id} inst={inst} />
          ))}
        </div>
      </section>

      <p className="text-sm text-muted">{r.disclaimer}</p>

      <div className="flex flex-wrap gap-3">
        {r.offerReportDraft && <Button onClick={onDraft}>{t("result_draft")}</Button>}
        <LinkButton href="/evidence" variant="secondary">
          {t("result_checklist")}
        </LinkButton>
        <CopyButton text={plainText} label={t("result_copy")} />
        <Button
          variant="ghost"
          onClick={() => {
            resetAll();
            router.push("/");
          }}
        >
          {t("home")}
        </Button>
      </div>
    </div>
  );
}
