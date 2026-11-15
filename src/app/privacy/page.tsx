"use client";

import { useEffect, useState } from "react";
import { useT } from "@/i18n";
import { fetchAiStatus } from "@/features/ai-guide/consultationClient";
import { Badge, Card, PageTitle } from "@/components/ui";

export default function PrivacyPage() {
  const { t } = useT();
  const [ai, setAi] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    fetchAiStatus().then((s) => active && setAi(s.aiConfigured));
    return () => {
      active = false;
    };
  }, []);

  const sections = [
    { title: t("privacy_collect_title"), items: [t("privacy_collect_1"), t("privacy_collect_2"), t("privacy_collect_3")] },
    { title: t("privacy_server_title"), items: [t("privacy_server_1"), t("privacy_server_2"), t("privacy_server_3"), t("privacy_server_4")] },
    { title: t("privacy_limits_title"), items: [t("privacy_limits_1"), t("privacy_limits_2"), t("privacy_limits_3"), t("privacy_limits_4")] },
    { title: t("privacy_rights_title"), items: [t("privacy_rights_1"), t("privacy_rights_2"), t("privacy_rights_3")] },
  ];

  return (
    <div className="space-y-6">
      <PageTitle title={t("privacy_title")} />
      <Card>
        <p className="text-sm font-semibold">{t("privacy_ai_status")}</p>
        <p className="mt-1">
          {ai === null ? (
            <span className="text-muted">{t("privacy_ai_checking")}</span>
          ) : ai ? (
            <Badge tone="ok">{t("privacy_ai_configured")}</Badge>
          ) : (
            <Badge tone="warn">{t("privacy_ai_not_configured")}</Badge>
          )}
        </p>
      </Card>
      {sections.map((s) => (
        <Card key={s.title}>
          <h2 className="text-lg font-bold text-navy">{s.title}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {s.items.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
