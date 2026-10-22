import { scenarios, type Decision, type Scenario } from "../data/scenarios";
export type Phase = "request" | "running" | "outcome" | "results";
export interface RoundResult {
  id: string;
  choice: Decision;
  inspected: boolean;
  correct: boolean;
  points: number;
  missedReview: boolean;
}
export interface GameState {
  index: number;
  phase: Phase;
  inspected: boolean;
  history: RoundResult[];
}
export type GameAction =
  | { type: "inspect" }
  | { type: "decide"; choice: Decision }
  | { type: "resolve" }
  | { type: "next" }
  | { type: "restart" };
export const initialState: GameState = {
  index: 0,
  phase: "request",
  inspected: false,
  history: [],
};
export function judge(
  scenario: Scenario,
  choice: Decision,
  inspected: boolean,
): RoundResult {
  const correct = choice === scenario.correct;
  const missedReview = correct && scenario.reviewRequired && !inspected;
  const points = !correct
    ? choice === "approve" && scenario.risk === "high"
      ? -100
      : -50
    : missedReview
      ? 60
      : inspected && !scenario.reviewRequired
        ? 90
        : 100;
  return { id: scenario.id, choice, inspected, correct, points, missedReview };
}
export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === "restart") return { ...initialState, history: [] };
  if (action.type === "inspect")
    return state.phase === "request" ? { ...state, inspected: true } : state;
  if (action.type === "decide" && state.phase === "request") {
    const result = judge(
      scenarios[state.index],
      action.choice,
      state.inspected,
    );
    return { ...state, phase: "running", history: [...state.history, result] };
  }
  if (action.type === "resolve" && state.phase === "running")
    return { ...state, phase: "outcome" };
  if (action.type === "next" && state.phase === "outcome") {
    return state.index === scenarios.length - 1
      ? { ...state, phase: "results" }
      : {
          ...state,
          index: state.index + 1,
          phase: "request",
          inspected: false,
        };
  }
  return state;
}
export function summarize(history: readonly RoundResult[]) {
  const score = Math.max(
    0,
    history.reduce((sum, r) => sum + r.points, 0),
  );
  const correct = history.filter((r) => r.correct).length;
  const accuracy = history.length
    ? Math.round((correct / history.length) * 100)
    : 0;
  const breaches = history.filter(
    (r) => !r.correct && r.choice === "approve",
  ).length;
  const rank =
    score >= 950
      ? "Permission Whisperer"
      : score >= 750
        ? "Human Firewall"
        : score >= 450
          ? "Cautiously Employed"
          : score >= 150
            ? "Incident Contributor"
            : "YOLO Administrator";
  const quip =
    score >= 950
      ? "Your agent fears your attention to detail."
      : score >= 750
        ? "Production lives to see another deploy."
        : score >= 450
          ? "A few red flags. Mostly still employed."
          : "Your backups would like a word with you.";
  return { score, correct, accuracy, breaches, rank, quip };
}
