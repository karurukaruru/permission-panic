import type { Scenario } from "../data/scenarios";

export type Locale = "en" | "zh-Hans" | "zh-Hant" | "ko" | "ja";
export type ScenarioCopy = Pick<Scenario,
  "title" | "task" | "request" | "inspectionSummary" | "success" | "failure" | "explanation"
>;
export interface Translation {
  ui: Record<string, string>;
  scenarios: Record<string, ScenarioCopy>;
}
