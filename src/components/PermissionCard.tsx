import { useEffect, useRef } from "react";
import type { Scenario } from "../data/scenarios";
import type { GameAction, GameState } from "../lib/game";
import { Icon } from "./Icon";
export function PermissionCard({
  scenario,
  state,
  dispatch,
}: {
  scenario: Scenario;
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}) {
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
      aria-label="Agent permission request"
    >
      <div className="window-bar">
        <div className="window-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <span>agent / permission-request</span>
        <Icon name="lock" size={14} />
      </div>
      <div className="request-body">
        <div className="request-meta">
          <span className="agent-mark">
            <Icon name="terminal" size={22} />
          </span>
          <div>
            <strong>YOUR CODING AGENT</strong>
            <span>needs your permission</span>
          </div>
          <span className="request-type">{scenario.category}</span>
        </div>
        <h2 ref={titleRef} tabIndex={-1}>
          {scenario.title}
        </h2>
        <div className="task-context">
          <span className="mono-label">YOUR TASK</span>
          <p>{scenario.task}</p>
        </div>
        <p className="request-copy">{scenario.request}</p>
        <div className="command-block">
          <div className="command-label">
            <span>
              <i /> PROPOSED COMMAND
            </span>
            <span>SIMULATION</span>
          </div>
          <pre>
            <code>
              <span className="prompt">$ </span>
              {scenario.command}
            </code>
          </pre>
          <div className="scope-line">
            <Icon name="lock" size={12} />
            <span>{scenario.scope}</span>
          </div>
        </div>
        {state.phase === "request" && state.inspected && (
          <div
            className="evidence-panel"
            ref={evidenceRef}
            tabIndex={-1}
            aria-label="Inspection evidence"
          >
            <div className="evidence-heading">
              <Icon name="inspect" size={16} />
              <strong>INSPECTION REPORT</strong>
              <span>READ BEFORE DECIDING</span>
            </div>
            {scenario.evidence.map((item) => (
              <div className="evidence-item" key={item.label}>
                <span className="mono-label">{item.label}</span>
                <pre>{item.content}</pre>
              </div>
            ))}
          </div>
        )}
        {state.phase === "request" && (
          <>
            <div className="decision-label">
              {state.inspected
                ? "You have the context. Make the call."
                : "The agent is waiting. What’s your call?"}
            </div>
            <div
              className={`decision-buttons ${state.inspected ? "inspected" : ""}`}
            >
              <button
                className="decision approve"
                onClick={() => dispatch({ type: "decide", choice: "approve" })}
              >
                <Icon name="check" />
                <span>Approve</span>
                <kbd>A</kbd>
              </button>
              <button
                className="decision inspect"
                disabled={state.inspected}
                onClick={() => dispatch({ type: "inspect" })}
              >
                <Icon name="inspect" />
                <span>{state.inspected ? "Inspected" : "Inspect"}</span>
                <kbd>I</kbd>
              </button>
              <button
                className="decision deny"
                onClick={() => dispatch({ type: "decide", choice: "deny" })}
              >
                <Icon name="deny" />
                <span>Deny</span>
                <kbd>D</kbd>
              </button>
            </div>
          </>
        )}
        {state.phase === "running" && (
          <div
            className={`execution ${catastrophe ? "execution-danger" : ""}`}
            role="status"
            aria-label="Simulated execution in progress"
          >
            <div className="execution-heading">
              <span className="spinner" />
              {result.choice === "deny"
                ? "Blocking request…"
                : "Simulating execution…"}
            </div>
            {(result.choice === "deny"
              ? [
                  "Permission denied. No operation performed.",
                  "Checking your decision…",
                ]
              : scenario.simulation
            ).map((line, index) => (
              <div
                key={line}
                className="execution-line"
                style={{ animationDelay: `${index * 160}ms` }}
              >
                <span>›</span> {line}
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
                <Icon name={failed ? "deny" : "shield"} size={16} />
                {failed
                  ? catastrophe
                    ? "SIMULATED INCIDENT"
                    : "MISSED OPPORTUNITY"
                  : result.missedReview
                    ? "RIGHT CALL · SKIPPED REVIEW"
                    : "GOOD CALL"}
              </span>
              <strong>
                {result.points > 0 ? "+" : ""}
                {result.points} pts
              </strong>
            </div>
            <h3 ref={resultRef} tabIndex={-1}>
              {failed ? scenario.failure : scenario.success}
            </h3>
            <p>{scenario.explanation}</p>
            {result.missedReview && (
              <p className="review-note">
                You chose correctly, but skipped evidence needed to justify it.
                Inspect first for full points.
              </p>
            )}
            {result.correct && state.inspected && !scenario.reviewRequired && (
              <p className="review-note">
                Safe call. The request already contained enough context: −10 for
                an unnecessary review.
              </p>
            )}
            <button
              className="next-button"
              onClick={() => dispatch({ type: "next" })}
            >
              {state.index === 9 ? "See my results" : "Next request"}
              <span>
                <kbd>↵</kbd>
                <Icon name="arrow" size={18} />
              </span>
            </button>
          </div>
        )}
      </div>
      <div className="card-bottom">
        <span className="pulse-dot" />{" "}
        {state.phase === "request"
          ? "Awaiting human judgment"
          : state.phase === "running"
            ? "All operations are simulated"
            : "Human judgment recorded"}
        <span>NO REAL COMMANDS EXECUTED</span>
      </div>
    </section>
  );
}
