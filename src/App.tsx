import { useEffect, useReducer, useState } from "react";
import { PermissionCard } from "./components/PermissionCard";
import { Results } from "./components/Results";
import { Icon } from "./components/Icon";
import { scenarios } from "./data/scenarios";
import { gameReducer, initialState, summarize } from "./lib/game";
import { GITHUB_URL } from "./lib/config";
export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [help, setHelp] = useState(false);
  const summary = summarize(state.history);
  useEffect(() => {
    if (state.phase !== "running") return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timer = window.setTimeout(
      () => dispatch({ type: "resolve" }),
      reduced ? 120 : 1150,
    );
    return () => window.clearTimeout(timer);
  }, [state.phase]);
  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if (
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.repeat ||
        event.isComposing
      )
        return;
      const target = event.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable="true"]'))
        return;
      // Preserve native Enter/Space on focused buttons and links.
      if (event.key === "Enter" && target.closest("button, a, summary")) return;
      if (event.key === "Escape") {
        setHelp(false);
        return;
      }
      if (help) return;
      const key = event.key.toLowerCase();
      if (state.phase === "request") {
        if (key === "a" || key === "d") {
          event.preventDefault();
          dispatch({
            type: "decide",
            choice: key === "a" ? "approve" : "deny",
          });
        }
        if (key === "i") {
          event.preventDefault();
          dispatch({ type: "inspect" });
        }
      } else if (state.phase === "outcome" && event.key === "Enter") {
        event.preventDefault();
        dispatch({ type: "next" });
      }
    }
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [state.phase, help]);
  return (
    <>
      <a className="skip-link" href="#game">
        Skip to game
      </a>
      <header className="site-header">
        <a href="./" className="brand" aria-label="Permission Panic home">
          <span className="brand-icon">
            <Icon name="terminal" size={23} />
          </span>
          <span>
            permission<span className="brand-light">panic</span>
            <span className="brand-period">.</span>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <span className="sandbox-badge">
            <span className="pulse-dot" /> 100% SIMULATED
          </span>
          <button
            className="text-button"
            onClick={() => setHelp(!help)}
            aria-expanded={help}
            aria-controls="how-to-play"
          >
            How to play <span>?</span>
          </button>
          {GITHUB_URL && (
            <a
              className="github-link"
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
            >
              GitHub <Icon name="external" size={14} />
            </a>
          )}
        </nav>
      </header>
      {help && (
        <section
          className="help-panel"
          id="how-to-play"
          aria-label="How to play"
        >
          <div>
            <strong>Trust is earned, one permission at a time.</strong>
            <button onClick={() => setHelp(false)} aria-label="Close help">
              <Icon name="deny" size={18} />
            </button>
          </div>
          <p>
            Approve a reasonable request, inspect to reveal evidence, or deny
            when it exceeds the task. After inspecting, choose Approve or Deny.
          </p>
          <p>
            Correct: +100. Skipped required review: +60. Unneeded review: +90.
            Wrong denial: −50. Wrong approval: −50, or −100 for high-risk
            requests. Final score never goes below zero.
          </p>
          <p>
            <kbd>A</kbd> approve · <kbd>I</kbd> inspect · <kbd>D</kbd> deny ·{" "}
            <kbd>Enter</kbd> next. All ten rounds are playable even after a
            mistake. No commands ever execute.
          </p>
        </section>
      )}
      <main id="game" tabIndex={-1}>
        {state.phase === "results" ? (
          <Results
            history={state.history}
            restart={() => dispatch({ type: "restart" })}
          />
        ) : (
          <>
            <div className="session-bar">
              <span>
                <span className="status-square" /> LIVE SESSION{" "}
                <span className="muted">/ LOCAL SANDBOX</span>
              </span>
              <span className="session-id">
                HUMAN IN THE LOOP <span className="muted">v1.0</span>
              </span>
            </div>
            <div className="game-layout">
              <aside className="game-intro">
                <span className="eyebrow">A GAME OF QUESTIONABLE TRUST</span>
                <h1>
                  Think before
                  <br />
                  you{" "}
                  <span className="approve-word">
                    approve<span className="cursor">_</span>
                  </span>
                </h1>
                <p className="intro-copy">
                  Your AI agent wants permission.
                  <br />
                  What’s the worst that could happen?
                </p>
                <div className="challenge-line">
                  <span>10 requests.</span> One very trusting developer.
                </div>
                <div className="session-stats">
                  <div>
                    <span className="mono-label">YOUR SCORE</span>
                    <strong key={summary.score}>
                      {String(summary.score).padStart(3, "0")}
                      <small>/ 1000</small>
                    </strong>
                  </div>
                  <div className="round-stat">
                    <span className="mono-label">REQUEST</span>
                    <strong>
                      {String(state.index + 1).padStart(2, "0")}
                      <small>/ 10</small>
                    </strong>
                  </div>
                </div>
                <div
                  className="round-track"
                  aria-label={`Request ${state.index + 1} of 10`}
                >
                  {scenarios.map((scenario, i) => (
                    <span
                      key={scenario.id}
                      className={
                        i < state.history.length
                          ? state.history[i].correct
                            ? "completed-safe"
                            : "completed-danger"
                          : i === state.index
                            ? "current"
                            : ""
                      }
                      title={`Request ${i + 1}`}
                    >
                      <span>{i + 1}</span>
                    </span>
                  ))}
                </div>
                <div className="human-note">
                  <Icon name="shield" size={18} />
                  <p>
                    The most important security tool?
                    <br />
                    <strong>The person clicking the button.</strong>
                  </p>
                </div>
                <p className="inspired-note">
                  Inspired by the “allow?” moment in Claude Code, Codex &amp;
                  OpenCode. Unaffiliated with all three.
                </p>
              </aside>
              <div className="request-column">
                <div className="request-counter">
                  <span>
                    PERMISSION REQUEST{" "}
                    <strong>{String(state.index + 1).padStart(2, "0")}</strong>
                  </span>
                  <span>
                    <span className="pulse-dot" /> AGENT ACTIVE
                  </span>
                </div>
                <PermissionCard
                  key={scenarios[state.index].id}
                  scenario={scenarios[state.index]}
                  state={state}
                  dispatch={dispatch}
                />
                <div className="below-card">
                  <span>
                    <Icon name="lock" size={13} /> No API. No login. No actual
                    disasters.
                  </span>
                  <span>Choose wisely.</span>
                </div>
              </div>
            </div>
            <section className="terminal-strip" aria-label="Session log">
              <span className="terminal-strip-icon">
                <Icon name="terminal" size={18} />
              </span>
              <div>
                <span className="mono-label">SANDBOX LOG</span>
                <p className="type-line" key={state.index}>
                  {state.index === 0
                    ? "agent connected. human judgment required."
                    : `${state.history.length} permission decisions recorded. production is ${summary.breaches ? "questioning your choices" : "still breathing"}.`}
                </p>
              </div>
              <span className="terminal-end">▌</span>
            </section>
          </>
        )}
      </main>
      <footer className="site-footer">
        <span>Built for the moment before “Allow always.”</span>
        <span>
          <span className="footer-dot" /> OPEN SOURCE / MIT{" "}
          <span className="muted">·</span> A GAME, NOT A SECURITY AUDIT
        </span>
      </footer>
    </>
  );
}
