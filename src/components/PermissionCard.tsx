import { useEffect, useRef } from "react";
import type { Scenario } from "../data/scenarios";
import type { GameAction, GameState } from "../lib/game";
import { Icon } from "./Icon";
import { useLanguage } from "../lib/i18n";

export function PermissionCard({
  scenario,
  state,
  dispatch,
}: {
  scenario: Scenario;
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}) {
  const { t } = useLanguage();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const evidenceRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const result = state.history[state.index];
  const failed = result && !result.correct;
  const catastrophe =
    failed && result.choice === "approve" && scenario.risk === "high";
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, [scenario.id]);
  useEffect(() => {
    if (state.inspected && state.phase === "request")
      evidenceRef.current?.focus({ preventScroll: true });
  }, [state.inspected, state.phase]);
  useEffect(() => {
    if (state.phase === "outcome")
      resultRef.current?.focus({ preventScroll: true });
  }, [state.phase]);
  return (
    <section
      className={`permission-card ${state.phase === "outcome" ? (failed ? "card-failed" : "card-success") : ""}`}
      aria-label={t("Agent permission request")}
    >
      <div className="request-body">
        <div className="request-meta">
          <span className="agent-mark">
            <Icon name="terminal" size={18} />
          </span>
          <span>{t("Agent permission request")}</span>
          <span className="request-type">
            {t(scenario.category.toLowerCase())}
          </span>
        </div>
        <h2 ref={titleRef} tabIndex={-1}>
          {scenario.title}
        </h2>
        <div className="task-context">
          <span className="mono-label">{t("YOUR TASK")}</span>
          <p>{scenario.task}</p>
        </div>
        <p className="request-copy">{scenario.request}</p>
        <div className="command-block">
          <pre>
            <code>
              <span className="prompt">$ </span>
              {scenario.command}
            </code>
          </pre>
          <div className="scope-line">{scenario.scope}</div>
        </div>
        {state.phase === "request" && state.inspected && (
          <div
            className="evidence-panel"
            ref={evidenceRef}
            tabIndex={-1}
            aria-label={t("Inspection evidence")}
          >
            <div className="evidence-heading">
              <Icon name="inspect" size={16} />
              <strong>{t("What you found")}</strong>
            </div>
            <p className="inspection-summary">{scenario.inspectionSummary}</p>
            <details className="technical-evidence">
              <summary>{t("View technical evidence (original)")}</summary>
              {scenario.evidence.map((item) => (
                <div className="evidence-item" key={item.label}>
                  <span className="mono-label">{item.label}</span>
                  <pre>{item.content}</pre>
                </div>
              ))}
            </details>
          </div>
        )}
        {state.phase === "request" && (
          <div className="decision-area">
            <p className="decision-label">
              {t(state.inspected ? "Now, make the call." : "Your call?")}
            </p>
            <div className="decision-buttons">
              <button
                className="decision approve"
                onClick={() => dispatch({ type: "decide", choice: "approve" })}
              >
                <Icon name="check" />
                <span>{t("Approve")}</span>
                <kbd>A</kbd>
              </button>
              <button
                className="decision inspect"
                disabled={state.inspected}
                onClick={() => dispatch({ type: "inspect" })}
              >
                <Icon name="inspect" />
                <span>{t(state.inspected ? "Inspected" : "Inspect")}</span>
                <kbd>I</kbd>
              </button>
              <button
                className="decision deny"
                onClick={() => dispatch({ type: "decide", choice: "deny" })}
              >
                <Icon name="deny" />
                <span>{t("Deny")}</span>
                <kbd>D</kbd>
              </button>
            </div>
          </div>
        )}
        {state.phase === "running" && (
          <div
            className={`execution ${catastrophe ? "execution-danger" : ""}`}
            role="status"
            aria-label={t("Simulated execution in progress")}
          >
            <div className="execution-heading">
              <span className="spinner" />
              {t(result.choice === "deny" ? "Request blocked…" : "Simulating…")}
            </div>
            {(result.choice === "deny"
              ? ["No operation performed.", "Checking your decision…"]
              : scenario.simulation
            ).map((line, i) => (
              <div
                key={line}
                className="execution-line"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                › {t(line)}
              </div>
            ))}
          </div>
        )}
        {state.phase === "outcome" && (
          <div
            className={`outcome ${catastrophe ? "catastrophe" : failed ? "incorrect" : "correct"}`}
          >
            <div className="outcome-top">
              <span className="outcome-state">
                <Icon name={failed ? "deny" : "check"} size={15} />
                {t(failed
                  ? catastrophe
                    ? "SIMULATED INCIDENT"
                    : "MISSED OPPORTUNITY"
                  : result.missedReview
                    ? "RIGHT CALL · MISSING EVIDENCE"
                    : "GOOD CALL")}
              </span>
              <strong>
                {result.points > 0 ? "+" : ""}
                {result.points} {t("pts")}
              </strong>
            </div>
            <h3 ref={resultRef} tabIndex={-1}>
              {failed ? scenario.failure : scenario.success}
            </h3>
            <p>{scenario.explanation}</p>
            {result.missedReview && (
              <p className="review-note">
                {t("Right answer, incomplete evidence. Inspect first to justify this decision and earn full points.")}
              </p>
            )}
            <button
              className="next-button"
              onClick={() => dispatch({ type: "next" })}
            >
              {t(state.index === 9 ? "See my results" : "Next request")}
              <Icon name="arrow" size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
