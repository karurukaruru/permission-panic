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
      reduced ? 120 : 1000,
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
          <Icon name="terminal" size={21} />
          <span>
            Permission Panic<span className="brand-period">.</span>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <button
            className="text-button"
            onClick={() => setHelp(!help)}
            aria-expanded={help}
            aria-controls="how-to-play"
          >
            How to play
          </button>
          {GITHUB_URL && (
            <a
              className="github-link"
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
            >
              GitHub <Icon name="external" size={13} />
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
            <strong>You make the call.</strong>
            <button onClick={() => setHelp(false)} aria-label="Close help">
              <Icon name="deny" size={18} />
            </button>
          </div>
          <p>
            <b>Approve</b> if the request fits your task. <b>Inspect</b> to
            reveal evidence, then approve or deny. <b>Deny</b> if the operation
            oversteps.
          </p>
          <p>
            Correct: +100. A correct guess without required evidence: +60.
            Wrong: −50, or −100 for an unsafe high-risk approval. Inspecting
            never costs points.
          </p>
          <p>
            <kbd>A</kbd> approve · <kbd>I</kbd> inspect · <kbd>D</kbd> deny ·{" "}
            <kbd>Enter</kbd> next · <kbd>Esc</kbd> close. All commands are
            simulated.
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
          <div className="game-layout">
            <div className="game-intro">
              <h1>Would you allow it?</h1>
              <p className="intro-copy">
                10 requests from your AI agent. You make the call.
              </p>
            </div>
            <div className="session-progress">
              <div className="progress-labels">
                <span>
                  Request{" "}
                  <strong>{String(state.index + 1).padStart(2, "0")}</strong>{" "}
                  <span className="muted">/ 10</span>
                </span>
                <span className="score-label">
                  <strong>{summary.score}</strong>{" "}
                  <span className="muted">pts</span>
                </span>
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
                  />
                ))}
              </div>
            </div>
            <PermissionCard
              key={scenarios[state.index].id}
              scenario={scenarios[state.index]}
              state={state}
              dispatch={dispatch}
            />
            <p className="sandbox-note">
              <Icon name="lock" size={12} /> A simulation. No real commands. No
              API. No login.
            </p>
          </div>
        )}
      </main>
      <footer className="site-footer">
        <span>Built for the moment before “Allow always.”</span>
        <span>Open source · MIT</span>
      </footer>
    </>
  );
}
