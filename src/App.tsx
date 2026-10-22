import { useEffect, useReducer, useState } from "react";
import { PermissionCard } from "./components/PermissionCard";
import { Results } from "./components/Results";
import { Icon } from "./components/Icon";
import { gameReducer, initialState, summarize } from "./lib/game";
import { GITHUB_URL } from "./lib/config";
import { languages, useLanguage, type Locale } from "./lib/i18n";

export default function App() {
  const { locale, setLanguage, t, scenarios } = useLanguage();
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [help, setHelp] = useState(false);
  const summary = summarize(state.history);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
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
        {t("Skip to game")}
      </a>
      <header className="site-header">
        <a href={import.meta.env.VITE_OFFLINE_BUILD === "true" ? "#game" : "./"} className="brand" aria-label="Permission Panic home">
          <Icon name="terminal" size={21} />
          <span>
            Permission Panic<span className="brand-period">.</span>
          </span>
        </a>
        <nav aria-label={t("Main navigation")}>
          <select className="language-select" aria-label={t("Language")} value={locale}
            onChange={(event) => setLanguage(event.target.value as Locale)}>
            {languages.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
          <button
            className="text-button"
            onClick={() => setHelp(!help)}
            aria-expanded={help}
            aria-controls="how-to-play"
          >
            {t("How to play")}
          </button>
        </nav>
      </header>
      {help && (
        <section
          className="help-panel"
          id="how-to-play"
          aria-label={t("How to play")}
        >
          <div>
            <strong>{t("You make the call.")}</strong>
            <button onClick={() => setHelp(false)} aria-label={t("Close help")}>
              <Icon name="deny" size={18} />
            </button>
          </div>
          <p>{t("Approve if the request fits your task. Inspect to reveal evidence, then approve or deny. Deny if the operation oversteps.")}</p>
          <p>{t("Correct: +100. A correct guess without required evidence: +60. Wrong: −50, or −100 for an unsafe high-risk approval. Inspecting never costs points.")}</p>
          <p>{t("A: approve · I: inspect · D: deny · Enter: next · Esc: close help. All commands are simulated.")}</p>
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
              <h1>{t("Would you allow it?")}</h1>
              <p className="intro-copy">
                {t("10 requests from your AI agent. You make the call.")}
              </p>
            </div>
            <div className="session-progress">
              <div className="progress-labels">
                <span>
                  {t("Request")}{" "}
                  <strong>{String(state.index + 1).padStart(2, "0")}</strong>{" "}
                  <span className="muted">/ 10</span>
                </span>
                <span className="score-label">
                  <strong>{summary.score}</strong>{" "}
                  <span className="muted">{t("pts")}</span>
                </span>
              </div>
              <div
                className="round-track"
                aria-label={t("Request {n} of 10", { n: state.index + 1 })}
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
                    title={t("Request {n} of 10", { n: i + 1 })}
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
              <Icon name="lock" size={12} /> {t("A simulation. No real commands. No API. No login.")}
            </p>
          </div>
        )}
      </main>
      <footer className="site-footer">
        <span>{t("Built for the moment before “Allow always.”")}</span>
        <div className="footer-links">
          {import.meta.env.VITE_OFFLINE_BUILD !== "true" &&
            <a href="./Permission-Panic.html" download="Permission-Panic.html">{t("Download offline")}</a>}
          {GITHUB_URL && <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>}
          <span>{t("Open source · MIT")}</span>
        </div>
      </footer>
    </>
  );
}
