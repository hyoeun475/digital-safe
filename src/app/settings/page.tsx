"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n";
import { useSession } from "@/lib/session/SessionProvider";
import { fetchAiStatus } from "@/features/ai-guide/consultationClient";
import { LanguageSwitch } from "@/components/AppShell";
import { Badge, Button, Card, Notice, PageTitle } from "@/components/ui";

export default function SettingsPage() {
  const { t } = useT();
  const router = useRouter();
  const { resetAll } = useSession();
  const [done, setDone] = useState(false);
  const [ai, setAi] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    fetchAiStatus().then((s) => active && setAi(s.aiConfigured));
    return () => {
      active = false;
    };
  }, []);

  const onReset = () => {
    if (!window.confirm(t("reset_confirm"))) return;
    resetAll();
    setDone(true);
    window.setTimeout(() => router.push("/"), 1200);
  };

  return (
    <div className="space-y-6">
      <PageTitle title={t("settings_title")} />
      <Card>
        <h2 className="text-lg font-bold text-navy">{t("settings_lang_title")}</h2>
        <p className="mt-1 text-sm text-muted">{t("settings_lang_desc")}</p>
        <div className="mt-3">
          <LanguageSwitch />
        </div>
      </Card>
      <Card>
        <h2 className="text-lg font-bold text-navy">{t("settings_mode_title")}</h2>
        <p className="mt-2">
          {ai === null ? <span className="text-muted">{t("privacy_ai_checking")}</span> : ai ? <Badge tone="ok">{t("privacy_ai_configured")}</Badge> : <Badge tone="warn">{t("privacy_ai_not_configured")}</Badge>}
        </p>
      </Card>
      <Card>
        <h2 className="text-lg font-bold text-navy">{t("settings_data_title")}</h2>
        <p className="mt-1 text-sm text-muted">{t("settings_data_desc")}</p>
        <div className="mt-3">
          <Button variant="danger" onClick={onReset}>
            {t("reset_session")}
          </Button>
        </div>
        {done && (
          <div className="mt-3">
            <Notice tone="ok" role="status">
              {t("reset_done")}
            </Notice>
          </div>
        )}
      </Card>
    </div>
  );
}
