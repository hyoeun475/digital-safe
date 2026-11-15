"use client";

import { useT } from "@/i18n";
import type { Institution } from "@/data/institutions";
import { Badge, Card } from "./ui";

export function InstitutionCard({ inst }: { inst: Institution }) {
  const { t, locale } = useT();
  return (
    <Card as="article" className="flex h-full flex-col gap-3">
      <div>
        <Badge tone={inst.category === "emergency" ? "danger" : "info"}>{t(`support_cat_${inst.category}`)}</Badge>
        <h3 className="mt-2 text-lg font-bold text-navy">{inst.name[locale]}</h3>
        <p className="mt-1 text-sm text-muted">{inst.purpose[locale]}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {inst.phone && (
          <a
            href={`tel:${inst.phone}`}
            className="inline-flex min-h-11 items-center rounded-lg border border-navy bg-white px-4 py-2 font-semibold text-navy hover:bg-blue-soft"
          >
            {t("call")} {inst.phone}
          </a>
        )}
        {inst.url && (
          <a
            href={inst.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center rounded-lg border border-transparent bg-navy px-4 py-2 font-semibold text-white hover:bg-navy-dark"
          >
            {t("open_link")} ↗
          </a>
        )}
      </div>
      <dl className="mt-auto border-t border-border pt-3 text-xs text-muted">
        <div className="flex gap-2">
          <dt className="shrink-0 font-semibold">{t("source")}:</dt>
          <dd>{inst.source[locale]}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 font-semibold">{t("last_verified")}:</dt>
          <dd>{inst.lastVerified}</dd>
        </div>
      </dl>
    </Card>
  );
}
