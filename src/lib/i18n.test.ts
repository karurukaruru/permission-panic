import { describe, it, expect } from "vitest";
import { scenarios } from "../data/scenarios";
import { matchLanguage, localizeScenario, translations, translate } from "./i18n";

describe("language selection", () => {
  it("distinguishes Chinese scripts and handles regional language tags", () => {
    for (const tag of ["zh", "zh-CN", "zh-SG", "zh-Hans-HK"]) {
      // Explicit script should take precedence over a region.
      expect(matchLanguage(tag)).toBe("zh-Hans");
    }
    for (const tag of ["zh-TW", "zh-HK", "zh-MO", "zh-Hant-CN"])
      expect(matchLanguage(tag)).toBe("zh-Hant");
    expect(matchLanguage("ko-KR")).toBe("ko");
    expect(matchLanguage("ja-JP")).toBe("ja");
    expect(matchLanguage("de-DE")).toBe("en");
  });
});

describe("translation contracts", () => {
  for (const [locale, copy] of Object.entries(translations)) {
    it(`${locale} covers the UI and all ten scenarios without changing decisions or commands`, () => {
      expect(Object.keys(copy.ui).sort()).toEqual(Object.keys(translations["zh-Hans"].ui).sort());
      for (const [source, text] of Object.entries(copy.ui)) {
        expect(text.length).toBeGreaterThan(0);
        expect(text.match(/\{\w+\}/g)?.sort() || []).toEqual(source.match(/\{\w+\}/g)?.sort() || []);
      }
      expect(Object.keys(copy.scenarios).sort()).toEqual(scenarios.map((s) => s.id).sort());
      for (const scenario of scenarios) {
        const translated = localizeScenario(scenario, locale as keyof typeof translations);
        for (const key of ["title", "task", "request", "inspectionSummary", "explanation", "success", "failure"] as const) {
          expect(translated[key].length).toBeGreaterThan(0);
          expect(translated[key]).not.toBe(scenario[key]);
        }
        expect(translated.command).toBe(scenario.command);
        expect(translated.evidence).toEqual(scenario.evidence);
        expect(translated.correct).toBe(scenario.correct);
        expect(translated.reviewRequired).toBe(scenario.reviewRequired);
      }
    });
  }
  it("inserts score data into translated text", () => {
    expect(translate("zh-Hans", "{correct}/10 correct decisions · {breaches} unsafe approvals", { correct: 7, breaches: 2 }))
      .toBe("7/10 次判断正确 · 2 次危险批准");
  });
});
