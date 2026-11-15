"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { ko, type Dict } from "./ko";
import { en } from "./en";

export type Locale = "ko" | "en";
export const LOCALES: Locale[] = ["ko", "en"];
export const DICTS: Record<Locale, Dict> = { ko, en };
export type TKey = keyof Dict;

const STORAGE_KEY = "digital-safe.locale";
const DEFAULT_LOCALE: Locale = "ko";

/* 언어 설정만 브라우저에 저장한다(민감정보 아님). 상담 내용은 저장하지 않는다. */
const listeners = new Set<() => void>();
let cached: Locale | null = null;

function readLocale(): Locale {
  if (cached) return cached;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    cached = saved === "ko" || saved === "en" ? saved : DEFAULT_LOCALE;
  } catch {
    cached = DEFAULT_LOCALE;
  }
  return cached;
}

function writeLocale(l: Locale) {
  cached = l;
  try {
    window.localStorage.setItem(STORAGE_KEY, l);
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

type LanguageContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, readLocale, () => DEFAULT_LOCALE);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => writeLocale(l), []);

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, setLocale, t: (key) => DICTS[locale][key] }),
    [locale, setLocale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useT() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useT must be used within LanguageProvider");
  return ctx;
}

/** 서버/비컴포넌트 코드에서 사용하는 순수 번역 함수 */
export function translate(locale: Locale, key: TKey): string {
  return DICTS[locale][key];
}
