"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LOCALES, useT, type Locale } from "@/i18n";
import { LanguageProvider } from "@/i18n";
import { SessionProvider } from "@/lib/session/SessionProvider";
import { EmergencyBanner } from "./EmergencyBanner";

const NAV: { href: string; key: "nav_consultation" | "nav_evidence" | "nav_draft" | "nav_support" | "nav_privacy" | "nav_settings" }[] = [
  { href: "/consultation", key: "nav_consultation" },
  { href: "/evidence", key: "nav_evidence" },
  { href: "/report-draft", key: "nav_draft" },
  { href: "/support", key: "nav_support" },
  { href: "/privacy", key: "nav_privacy" },
  { href: "/settings", key: "nav_settings" },
];

const LOCALE_LABEL: Record<Locale, string> = { ko: "한국어", en: "English" };

export function LanguageSwitch({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useT();
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className={compact ? "sr-only" : "font-medium"}>{t("lang_label")}</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="min-h-10 rounded-md border border-border bg-white px-2 py-1 text-sm text-navy"
        aria-label={t("lang_label")}
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>
            {LOCALE_LABEL[l]}
          </option>
        ))}
      </select>
    </label>
  );
}

function Header() {
  const { t } = useT();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight text-navy" onClick={() => setOpen(false)}>
          <span aria-hidden className="inline-block h-7 w-7 rounded-md bg-navy" />
          <span>{t("appName")}</span>
        </Link>
        <nav aria-label="main" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-md px-3 py-2 text-sm font-medium hover:bg-blue-soft ${pathname === n.href ? "bg-blue-soft text-navy" : "text-muted"}`}
            >
              {t(n.key)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitch compact />
          <button
            type="button"
            className="inline-flex min-h-10 items-center rounded-md border border-border px-3 text-sm font-medium text-navy md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "✕" : "☰"} <span className="sr-only">menu</span>
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="mobile" className="border-t border-border bg-white md:hidden">
          <ul className="mx-auto grid max-w-5xl gap-1 px-4 py-2">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-md px-3 py-3 font-medium hover:bg-blue-soft ${pathname === n.href ? "bg-blue-soft text-navy" : "text-navy"}`}
                >
                  {t(n.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

function Footer() {
  const { t } = useT();
  return (
    <footer className="mt-12 border-t border-border bg-white">
      <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted">
        <p>{t("footer_disclaimer")}</p>
        <p className="mt-2">
          <Link href="/privacy" className="underline hover:text-navy">
            {t("nav_privacy")}
          </Link>
          {" · "}
          <span>{t("footer_capstone")}</span>
        </p>
      </div>
    </footer>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <SessionProvider>
        <EmergencyBanner />
        <Header />
        <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
          {children}
        </main>
        <Footer />
      </SessionProvider>
    </LanguageProvider>
  );
}
