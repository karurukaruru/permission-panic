import { useEffect, useRef, useState } from "react";
import { scenarios } from "../data/scenarios";
import { summarize, type RoundResult } from "../lib/game";
import {
  copyText,
  downloadScoreCard,
  shareText,
  type ShareTarget,
} from "../lib/share";
import { GITHUB_URL } from "../lib/config";
import { Icon } from "./Icon";
export function Results({
  history,
  restart,
}: {
  history: RoundResult[];
  restart: () => void;
}) {
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
      await downloadScoreCard(history);
      setNotice("Score card downloaded. The evidence is yours.");
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Export failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function share(target: ShareTarget) {
    const text = shareText(history, target);
    try {
      await copyText(text);
      setFallback("");
      setNotice(`${target} share text copied. Ready when you are.`);
    } catch {
      setFallback(text);
      setNotice("Clipboard blocked by your browser. Copy the text below.");
    }
  }
  return (
    <div className="results-layout">
      <div className="results-intro">
        <span className="eyebrow">
          <span className="pulse-dot" /> SESSION COMPLETE
        </span>
        <h1 ref={heading} tabIndex={-1}>
          Session complete.
        </h1>
        <p>Ten requests. Here’s how you handled them.</p>
      </div>
      <section className="score-card" aria-label="Final score card">
        <div className="score-card-header">
          <span>
            <Icon name="terminal" /> PERMISSION PANIC
          </span>
          <span>10 REQUESTS</span>
        </div>
        <div className="score-number">
          <strong>{summary.score.toString().padStart(3, "0")}</strong>
          <span>/ 1000</span>
          <div className="score-stamp">
            <Icon name="shield" size={32} />
            <span>
              {summary.accuracy}%<small>ACCURACY</small>
            </span>
          </div>
        </div>
        <span className="mono-label">YOUR NEW JOB TITLE</span>
        <h2>{summary.rank}</h2>
        <p className="quip">{summary.quip}</p>
        <div className="score-rounds" aria-label="Round outcomes">
          {history.map((r, i) => (
            <span
              key={r.id}
              className={r.correct ? "safe" : "breach"}
              title={`Round ${i + 1}: ${r.correct ? "correct" : "incorrect"}`}
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
            {summary.correct}/10 correct decisions · {summary.breaches} unsafe
            approvals
          </span>
          {GITHUB_URL ? (
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">
              GitHub <Icon name="external" size={12} />
            </a>
          ) : (
            <span>OPEN SOURCE · MIT</span>
          )}
        </div>
      </section>
      <div className="result-actions">
        <button className="primary-button" onClick={download} disabled={busy}>
          <Icon name="download" />
          {busy ? "Exporting…" : "Download score card"}
          <span>PNG</span>
        </button>
        <div className="share-row">
          <span className="mono-label">COPY TO SHARE</span>
          {(["X", "Reddit", "Bilibili"] as const).map((target) => (
            <button key={target} onClick={() => share(target)}>
              <Icon name="copy" size={14} />
              {target}
            </button>
          ))}
        </div>
        <p className="notice" role="status">
          {notice}
        </p>
        {fallback && (
          <textarea
            className="share-fallback"
            aria-label="Share text to copy"
            value={fallback}
            readOnly
            onFocus={(event) => event.target.select()}
          />
        )}
        <p className="repo-note">Made it through? Challenge another human.</p>
      </div>
      <details className="round-review">
        <summary>
          Review your decisions <span>10 REQUESTS ↓</span>
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
                You: {r.inspected ? "inspect → " : ""}
                {r.choice}. Best call:{" "}
                {scenarios[i].reviewRequired ? "inspect → " : ""}
                {scenarios[i].correct}.
              </p>
              <p>{scenarios[i].explanation}</p>
            </article>
          ))}
        </div>
      </details>
      <button className="replay-button" onClick={restart}>
        <Icon name="reset" size={18} /> Run it back{" "}
        <span>Same requests. Better judgment.</span>
      </button>
    </div>
  );
}
