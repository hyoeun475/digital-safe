"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n";
import { useSession } from "@/lib/session/SessionProvider";
import { INCIDENT_TYPE_OPTIONS, RISK_OPTIONS, SITUATION_OPTIONS } from "@/features/intake/options";
import { fetchAiStatus, requestConsultation, ConsultationClientError } from "@/features/ai-guide/consultationClient";
import { DESCRIPTION_MAX, DESCRIPTION_MIN } from "@/lib/ai/schema";
import { EmergencyGuide } from "@/components/EmergencyBanner";
import { Button, Card, ChoiceGrid, Notice, PageTitle } from "@/components/ui";

type Step = "risk" | "type" | "situation" | "describe" | "consent";
const ORDER: Step[] = ["risk", "type", "situation", "describe", "consent"];

export default function ConsultationPage() {
  const { t, locale } = useT();
  const router = useRouter();
  const { state, updateIntake, setResult, resetAll } = useSession();
  const { intake } = state;

  const [step, setStep] = useState<Step>(() => (intake.incidentType && intake.immediateRisk ? "situation" : "risk"));
  const [showEmergency, setShowEmergency] = useState(false);
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchAiStatus().then((s) => active && setAiConfigured(s.aiConfigured));
    return () => {
      active = false;
    };
  }, []);

  const stepIndex = ORDER.indexOf(step);
  const goNext = () => setStep(ORDER[Math.min(stepIndex + 1, ORDER.length - 1)]);
  const goBack = () => setStep(ORDER[Math.max(stepIndex - 1, 0)]);

  const descLen = intake.description.trim().length;
  const descValid = descLen >= DESCRIPTION_MIN && descLen <= DESCRIPTION_MAX;

  const stepLabel = useMemo(
    () =>
      ({
        risk: t("consult_step_risk"),
        type: t("consult_step_type"),
        situation: t("consult_step_situation"),
        describe: t("consult_step_describe"),
        consent: t("consult_step_consent"),
      })[step],
    [step, t],
  );

  const onStop = () => {
    resetAll();
    router.push("/");
  };

  const onSubmit = async () => {
    if (!intake.incidentType || !intake.immediateRisk || !descValid) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await requestConsultation({
        incidentType: intake.incidentType,
        situation: intake.situation,
        description: intake.description.trim(),
        immediateRisk: intake.immediateRisk,
        aiConsent: aiConfigured === true && intake.aiConsent,
        locale,
      });
      setResult(res);
      router.push("/result");
    } catch (e) {
      if (e instanceof ConsultationClientError && e.code === "rate_limited") {
        setError(`${t("result_error_desc")} (Retry after ${e.retryAfterSec}s)`);
      } else {
        setError(t("result_error_desc"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle title={t("consult_title")} intro={`${t("phrase_talk_as_much")} ${t("phrase_can_skip")}`} />

      <ol className="flex flex-wrap gap-2 text-xs" aria-label="progress">
        {ORDER.map((s, i) => (
          <li
            key={s}
            aria-current={s === step ? "step" : undefined}
            className={`rounded-full border px-3 py-1 ${i <= stepIndex ? "border-navy bg-blue-soft text-navy" : "border-border text-muted"}`}
          >
            {i + 1}
          </li>
        ))}
      </ol>

      {showEmergency && <EmergencyGuide onContinue={() => setShowEmergency(false)} />}

      <Card>
        <p className="text-sm font-semibold text-muted">{stepLabel}</p>

        {step === "risk" && (
          <div className="mt-2">
            <h2 id="risk-label" className="text-xl font-bold text-navy">
              {t("risk_question")}
            </h2>
            <p className="mt-1 text-sm text-muted">{t("risk_help")}</p>
            <div className="mt-4">
              <ChoiceGrid
                name="risk"
                options={RISK_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
                value={intake.immediateRisk}
                onChange={(v) => {
                  updateIntake({ immediateRisk: v });
                  setShowEmergency(v === "yes");
                }}
              />
            </div>
          </div>
        )}

        {step === "type" && (
          <div className="mt-2">
            <h2 id="type-label" className="text-xl font-bold text-navy">
              {t("type_question")}
            </h2>
            <p className="mt-1 text-sm text-muted">{t("type_help")}</p>
            <div className="mt-4">
              <ChoiceGrid
                name="type"
                options={INCIDENT_TYPE_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey), description: t(o.descKey) }))}
                value={intake.incidentType}
                onChange={(v) => updateIntake({ incidentType: v })}
              />
            </div>
          </div>
        )}

        {step === "situation" && (
          <div className="mt-2">
            <h2 id="situation-label" className="text-xl font-bold text-navy">
              {t("situation_question")}
            </h2>
            <p className="mt-1 text-sm text-muted">{t("phrase_can_skip")}</p>
            <div className="mt-4">
              <ChoiceGrid
                name="situation"
                options={SITUATION_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
                value={intake.situation}
                onChange={(v) => {
                  updateIntake({ situation: v });
                  if (v === "being_threatened" && intake.immediateRisk !== "no") setShowEmergency(true);
                }}
              />
            </div>
          </div>
        )}

        {step === "describe" && (
          <div className="mt-2">
            <h2 className="text-xl font-bold text-navy">{t("describe_question")}</h2>
            <p className="mt-1 text-sm text-muted">{t("describe_help")}</p>
            <Notice tone="warn">
              <span className="font-semibold">⚠ {t("describe_privacy_warning")}</span>
            </Notice>
            <label htmlFor="description" className="sr-only">
              {t("describe_question")}
            </label>
            <textarea
              id="description"
              value={intake.description}
              onChange={(e) => updateIntake({ description: e.target.value.slice(0, DESCRIPTION_MAX) })}
              maxLength={DESCRIPTION_MAX}
              rows={7}
              placeholder={t("describe_placeholder")}
              className="mt-3 w-full rounded-lg border border-border bg-white p-3 text-base focus:border-navy"
              aria-describedby="desc-count"
            />
            <div id="desc-count" className="mt-1 flex justify-between text-xs text-muted">
              <span>{descLen < DESCRIPTION_MIN ? t("describe_min") : descLen > DESCRIPTION_MAX ? t("describe_max") : ""}</span>
              <span>
                {t("describe_count")}: {descLen} / {DESCRIPTION_MAX}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted">{t("consent_no_store")}</p>
          </div>
        )}

        {step === "consent" && (
          <div className="mt-2 space-y-4">
            <h2 className="text-xl font-bold text-navy">{t("consent_title")}</h2>
            {aiConfigured === null && <p className="text-sm text-muted">{t("privacy_ai_checking")}</p>}
            {aiConfigured === false && (
              <Notice tone="warn" title={t("consent_demo_title")}>
                {t("consent_demo_desc")}
              </Notice>
            )}
            {aiConfigured === true && (
              <>
                <Notice tone="info" title={t("consent_ai_title")}>
                  {t("consent_ai_desc")}
                </Notice>
                <label className="flex items-start gap-3 rounded-lg border border-border p-3">
                  <input
                    type="checkbox"
                    checked={intake.aiConsent}
                    onChange={(e) => updateIntake({ aiConsent: e.target.checked })}
                    className="mt-1 h-5 w-5"
                  />
                  <span className="font-medium">{t("consent_checkbox")}</span>
                </label>
                <p className="text-sm text-muted">{t("consent_decline_note")}</p>
              </>
            )}
            <p className="text-sm text-muted">{t("consent_no_store")}</p>
            {error && (
              <Notice tone="danger" title={t("result_error_title")} role="alert">
                {error}
              </Notice>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex gap-2">
            <Button variant="ghost" onClick={goBack} disabled={stepIndex === 0}>
              {t("back")}
            </Button>
            <Button variant="danger" onClick={onStop}>
              {t("stop_consult")}
            </Button>
          </div>
          <div className="flex gap-2">
            {step === "situation" && (
              <Button variant="ghost" onClick={goNext}>
                {t("skip")}
              </Button>
            )}
            {step !== "consent" ? (
              <Button
                onClick={goNext}
                disabled={
                  (step === "risk" && !intake.immediateRisk) ||
                  (step === "type" && !intake.incidentType) ||
                  (step === "describe" && !descValid)
                }
              >
                {t("next")}
              </Button>
            ) : (
              <Button onClick={onSubmit} disabled={submitting || aiConfigured === null || !intake.incidentType || !descValid}>
                {submitting ? t("loading") : t("submit_consult")}
              </Button>
            )}
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">{t("stop_help")}</p>
      </Card>
    </div>
  );
}
