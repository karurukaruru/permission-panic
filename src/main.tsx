import { Component, StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import { matchLanguage, translate, type Locale } from "./lib/i18n";
function errorLocale(): Locale {
  try { return matchLanguage(document.documentElement.lang || navigator.language); }
  catch { return "en"; }
}
class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="fatal-error">
          <h1>{translate(errorLocale(), "Unexpected permission panic.")}</h1>
          <p>{translate(errorLocale(), "The game hit an error. Reload to start a clean session.")}</p>
          <button
            className="primary-button"
            onClick={() => window.location.reload()}
          >
            {translate(errorLocale(), "Reload game")}
          </button>
        </main>
      );
    return this.props.children;
  }
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
