import { useSyncExternalStore } from "react";
import { scenarios, type Scenario } from "../data/scenarios";
import hans from "../locales/zh-Hans.json";
import hant from "../locales/zh-Hant.json";
import ko from "../locales/ko.json";
import ja from "../locales/ja.json";
import type { Locale, Translation } from "../locales/types";

export type { Locale };
export const languages: { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "zh-Hans", label: "简体中文" },
  { value: "zh-Hant", label: "繁體中文" },
  { value: "ko", label: "한국어" },
  { value: "ja", label: "日本語" },
];
export const translations: Record<Exclude<Locale, "en">, Translation> = {
  "zh-Hans": hans, "zh-Hant": hant, ko, ja,
};
export function matchLanguage(language: string): Locale {
  const tag = language.toLowerCase();
  if (tag === "zh" || tag.startsWith("zh-")) {
    if (tag.includes("hans")) return "zh-Hans";
    return /hant|tw|hk|mo/.test(tag) ? "zh-Hant" : "zh-Hans";
  }
  if (tag === "ja" || tag.startsWith("ja-")) return "ja";
  if (tag === "ko" || tag.startsWith("ko-")) return "ko";
  return "en";
}
function initialLanguage(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem("permission-panic-language");
    if (languages.some(({ value }) => value === saved)) return saved as Locale;
  } catch { /* file:// and private mode can deny storage */ }
  return matchLanguage(navigator.languages?.[0] || navigator.language || "en");
}
let current = initialLanguage();
const listeners = new Set<() => void>();
export function setLanguage(value: Locale) {
  current = value;
  if (typeof document !== "undefined") document.documentElement.lang = value;
  try { localStorage.setItem("permission-panic-language", value); } catch { /* optional */ }
  listeners.forEach((listener) => listener());
}
export function translate(locale: Locale, message: string, values: Record<string, string | number> = {}) {
  const text = locale === "en" ? message : translations[locale].ui[message] || message;
  return text.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match));
}
export function localizeScenario(scenario: Scenario, locale: Locale): Scenario {
  return locale === "en" ? scenario : { ...scenario, ...translations[locale].scenarios[scenario.id] };
}
export function useLanguage() {
  const locale = useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    () => current,
  );
  return {
    locale, setLanguage,
    t: (message: string, values?: Record<string, string | number>) => translate(locale, message, values),
    scenarios: scenarios.map((scenario) => localizeScenario(scenario, locale)),
  };
}
