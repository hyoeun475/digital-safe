"use client";

import Link from "next/link";
import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { useT } from "@/i18n";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variantClass: Record<Variant, string> = {
  primary: "bg-navy text-white hover:bg-navy-dark border-transparent",
  secondary: "bg-white text-navy border-navy hover:bg-blue-soft",
  ghost: "bg-transparent text-navy border-transparent hover:bg-blue-soft",
  danger: "bg-white text-danger-fg border-danger-border hover:bg-danger-bg",
};

const baseBtn =
  "inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-3 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 min-h-12";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type="button" className={`${baseBtn} ${variantClass[variant]} ${className}`} {...props} />;
}

export function LinkButton({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${baseBtn} ${variantClass[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function Card({ children, className = "", as: Tag = "section" }: { children: ReactNode; className?: string; as?: "section" | "div" | "article" }) {
  return <Tag className={`rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6 ${className}`}>{children}</Tag>;
}

export function PageTitle({ title, intro }: { title: string; intro?: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold text-navy sm:text-3xl">{title}</h1>
      {intro && <p className="mt-2 text-muted">{intro}</p>}
    </header>
  );
}

type NoticeTone = "info" | "warn" | "danger" | "ok";
const toneClass: Record<NoticeTone, string> = {
  info: "bg-blue-soft text-navy border-border",
  warn: "bg-warn-bg text-warn-fg border-warn-border",
  danger: "bg-danger-bg text-danger-fg border-danger-border",
  ok: "bg-ok-bg text-ok-fg border-border",
};

export function Notice({ tone = "info", title, children, role }: { tone?: NoticeTone; title?: string; children: ReactNode; role?: "alert" | "status" }) {
  return (
    <div role={role} className={`rounded-lg border px-4 py-3 text-sm ${toneClass[tone]}`}>
      {title && <p className="font-semibold">{title}</p>}
      <div className={title ? "mt-1" : ""}>{children}</div>
    </div>
  );
}

export function Badge({ children, tone = "info" }: { children: ReactNode; tone?: NoticeTone }) {
  return <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${toneClass[tone]}`}>{children}</span>;
}

export function CopyButton({ text, label, variant = "secondary" }: { text: string; label?: string; variant?: Variant }) {
  const { t } = useT();
  const [status, setStatus] = useState<"idle" | "ok" | "fail">("idle");

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("ok");
    } catch {
      setStatus("fail");
    }
    window.setTimeout(() => setStatus("idle"), 2500);
  };

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <Button variant={variant} onClick={onCopy} aria-live="polite">
        {status === "ok" ? t("copied") : (label ?? t("copy"))}
      </Button>
      {status === "fail" && <span className="text-xs text-danger-fg">{t("copy_failed")}</span>}
    </span>
  );
}

export function ChoiceGrid<T extends string>({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: { value: T; label: string; description?: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-labelledby={`${name}-label`} className="grid gap-3 sm:grid-cols-2">
      {options.map((o) => {
        const selected = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(o.value)}
            className={`min-h-14 rounded-lg border px-4 py-3 text-left transition-colors ${
              selected ? "border-navy bg-blue-soft ring-2 ring-navy" : "border-border bg-surface hover:bg-blue-soft/60"
            }`}
          >
            <span className="block font-semibold text-navy">{o.label}</span>
            {o.description && <span className="mt-1 block text-sm text-muted">{o.description}</span>}
          </button>
        );
      })}
    </div>
  );
}
