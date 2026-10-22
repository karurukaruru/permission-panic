import { useEffect, useRef, useState } from "react";
import { summarize, type RoundResult } from "../lib/game";
import {
  copyText,
  downloadScoreCard,
  shareText,
} from "../lib/share";
import { GITHUB_URL } from "../lib/config";
import { Icon } from "./Icon";
import { useLanguage } from "../lib/i18n";
export function Results({
  history,
  restart,
}: {
  history: RoundResult[];
  restart: () => void;
}) {
  const { locale, t, scenarios } = useLanguage();
  const summary = summarize(history);
  const heading = useRef<HTMLHeadingElement>(null);
  const [notice, setNotice] = useState("");
  const [fallback, setFallback] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);
  async function download() {
    setBusy(true);
    setNotice("");
    try {
      await downloadScoreCard(history, locale);
      setNotice(t("Score card downloaded. The evidence is yours."));
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : t("Export failed. Please try again."),
      );
    } finally {
      setBusy(false);
    }
  }
  async function share() {
    const text = shareText(history, locale);
    try {
      await copyText(text, locale);
      setFallback("");
      setNotice(t("Challenge copied. Ready when you are."));
    } catch {
      setFallback(text);
      setNotice(t("Clipboard blocked by your browser. Copy the text below."));
    }
  }
  return (
    <div className="results-layout">
      <div className="results-intro">
        <span className="eyebrow">
          <span className="pulse-dot" /> {t("SESSION COMPLETE")}
        </span>
        <h1 ref={heading} tabIndex={-1}>
          {t("Session complete.")}
        </h1>
        <p>{t("Ten requests. Here’s how you handled them.")}</p>
      </div>
      <section className="score-card" aria-label={t("Final score card")}>
        <div className="score-card-header">
          <span>
            <Icon name="terminal" /> PERMISSION PANIC
          </span>
          <span>{t("10 REQUESTS")}</span>
        </div>
        <div className="score-number">
          <strong>{summary.score.toString().padStart(3, "0")}</strong>
          <span>/ 1000</span>
          <div className="score-stamp">
            <Icon name="shield" size={32} />
            <span>
              {summary.accuracy}%<small>{t("ACCURACY")}</small>
            </span>
          </div>
        </div>
        <span className="mono-label">{t("YOUR NEW JOB TITLE")}</span>
        <h2>{t(summary.rank)}</h2>
        <p className="quip">{t(summary.quip)}</p>
        <div className="score-rounds" aria-label={t("Round outcomes")}>
          {history.map((r, i) => (
            <span
              key={r.id}
              className={r.correct ? "safe" : "breach"}
              title={t("Round {n}: {result}", { n: i + 1, result: t(r.correct ? "correct" : "incorrect") })}
            >
              {r.correct ? (
                <Icon name="check" size={15} />
              ) : (
                <Icon name="deny" size={15} />
              )}
            </span>
          ))}
        </div>
        <div className="score-card-footer">
          <span>
            {t("{correct}/10 correct decisions · {breaches} unsafe approvals", summary)}
          </span>
          {GITHUB_URL ? (
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">
              GitHub <Icon name="external" size={12} />
            </a>
          ) : (
            <span>{t("Open source · MIT")}</span>
          )}
        </div>
      </section>
      <div className="result-actions">
        <button className="primary-button" onClick={download} disabled={busy}>
          <Icon name="download" />
          {t(busy ? "Exporting…" : "Download score card")}
          <span>PNG</span>
        </button>
        <div className="share-row">
          <button onClick={share}><Icon name="copy" size={14} />{t("Copy challenge")}</button>
        </div>
        <p className="notice" role="status">
          {notice}
        </p>
        {fallback && (
          <textarea
            className="share-fallback"
            aria-label={t("Share text to copy")}
            value={fallback}
            readOnly
            onFocus={(event) => event.target.select()}
          />
        )}
        <p className="repo-note">{t("Made it through? Challenge another human.")}</p>
      </div>
      <details className="round-review">
        <summary>
          {t("Review your decisions")} <span>{t("10 REQUESTS")} ↓</span>
        </summary>
        <div className="review-list">
          {history.map((r, i) => (
            <article key={r.id}>
              <div>
                <span
                  className={`review-index ${r.correct ? "safe" : "breach"}`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{scenarios[i].title}</h3>
                <strong className={r.correct ? "safe-text" : "danger-text"}>
                  {r.points > 0 ? "+" : ""}
                  {r.points}
                </strong>
              </div>
              <p>
                {t("You: {choice}. Best call: {best}.", {
                  choice: `${r.inspected ? t("Inspect") + " → " : ""}${t(r.choice === "approve" ? "Approve" : "Deny")}`,
                  best: `${scenarios[i].reviewRequired ? t("Inspect") + " → " : ""}${t(scenarios[i].correct === "approve" ? "Approve" : "Deny")}`,
                })}
              </p>
              <p>{scenarios[i].explanation}</p>
            </article>
          ))}
        </div>
      </details>
      <button className="replay-button" onClick={restart}>
        <Icon name="reset" size={18} /> {t("Run it back")}{" "}
        <span>{t("Same requests. Better judgment.")}</span>
      </button>
    </div>
  );
}
