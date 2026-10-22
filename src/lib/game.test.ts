import { describe, expect, it } from "vitest";
import { scenarios } from "../data/scenarios";
import {
  gameReducer,
  initialState,
  judge,
  summarize,
  type GameState,
} from "./game";
import { repositoryUrl } from "./config";
import { shareText } from "./share";

describe("scenario contract", () => {
  it("has exactly ten unique, complete, contribution-friendly requests", () => {
    expect(scenarios).toHaveLength(10);
    expect(new Set(scenarios.map((s) => s.id)).size).toBe(10);
    for (const s of scenarios) {
      for (const key of [
        "id",
        "task",
        "request",
        "command",
        "scope",
        "success",
        "failure",
        "explanation",
      ] as const)
        expect(s[key].length).toBeGreaterThan(5);
      expect(s.evidence.length).toBeGreaterThan(0);
      expect(s.evidence.every((e) => e.content.length > 10)).toBe(true);
      expect(s.simulation.length).toBeGreaterThan(1);
    }
    expect(
      scenarios.some((s) => s.correct === "approve" && !s.reviewRequired),
    ).toBe(true);
    expect(
      scenarios.some((s) => s.correct === "deny" && !s.reviewRequired),
    ).toBe(true);
    expect(scenarios.some((s) => s.reviewRequired)).toBe(true);
  });
});
describe("judgment and scoring", () => {
  it("distinguishes necessary review, blind guessing, and optional review", () => {
    const nuanced = scenarios[1];
    expect(judge(nuanced, "deny", true)).toMatchObject({
      correct: true,
      points: 100,
    });
    expect(judge(nuanced, "deny", false)).toMatchObject({
      correct: true,
      points: 60,
      missedReview: true,
    });
    expect(judge(scenarios[0], "approve", true).points).toBe(100);
    expect(judge(scenarios[0], "approve", false).points).toBe(100);
  });
  it("never penalizes inspecting before a correct decision", () => {
    for (const scenario of scenarios) {
      expect(judge(scenario, scenario.correct, true).points).toBe(100);
      expect(
        judge(scenario, scenario.correct, true).points,
      ).toBeGreaterThanOrEqual(judge(scenario, scenario.correct, false).points);
    }
  });
  it("penalizes a dangerous approval more than a false alarm", () => {
    expect(judge(scenarios[1], "approve", true).points).toBe(-100);
    expect(judge(scenarios[0], "deny", false).points).toBe(-50);
  });
  it("clamps final score but preserves honest penalties and decision accuracy", () => {
    const bad = scenarios.map((s) =>
      judge(s, s.correct === "deny" ? "approve" : "deny", false),
    );
    expect(summarize(bad)).toMatchObject({
      score: 0,
      correct: 0,
      accuracy: 0,
      rank: "YOLO Administrator",
    });
    expect(summarize([]).accuracy).toBe(0);
  });
  it("a perfect run earns 1000, 100% and the top rank", () => {
    const perfect = scenarios.map((s) => judge(s, s.correct, s.reviewRequired));
    expect(summarize(perfect)).toMatchObject({
      score: 1000,
      accuracy: 100,
      correct: 10,
      rank: "Permission Whisperer",
      breaches: 0,
    });
  });
});
describe("game state transitions", () => {
  it("completes all ten rounds, with inspections, then fully resets", () => {
    let state: GameState = initialState;
    scenarios.forEach((s, index) => {
      expect(state.index).toBe(index);
      expect(state.phase).toBe("request");
      if (s.reviewRequired) state = gameReducer(state, { type: "inspect" });
      state = gameReducer(state, { type: "decide", choice: s.correct });
      expect(state.phase).toBe("running");
      state = gameReducer(state, { type: "resolve" });
      expect(state.phase).toBe("outcome");
      state = gameReducer(state, { type: "next" });
    });
    expect(state.phase).toBe("results");
    expect(state.history).toHaveLength(10);
    expect(summarize(state.history).score).toBe(1000);
    expect(gameReducer(state, { type: "restart" })).toEqual(initialState);
  });
  it("ignores double clicks, early next, late inspect and duplicate resolution", () => {
    expect(gameReducer(initialState, { type: "next" })).toBe(initialState);
    const running = gameReducer(initialState, {
      type: "decide",
      choice: "approve",
    });
    expect(gameReducer(running, { type: "decide", choice: "deny" })).toBe(
      running,
    );
    expect(gameReducer(running, { type: "inspect" })).toBe(running);
    const outcome = gameReducer(running, { type: "resolve" });
    expect(gameReducer(outcome, { type: "resolve" })).toBe(outcome);
    expect(outcome.history).toHaveLength(1);
  });
});
describe("safe configuration and sharing", () => {
  it("accepts real GitHub repository URLs and rejects unsafe or invented fallback links", () => {
    expect(repositoryUrl(undefined)).toBeNull();
    expect(repositoryUrl("javascript:alert(1)")).toBeNull();
    expect(repositoryUrl("https://evil.example/account/repo")).toBeNull();
    expect(
      repositoryUrl("https://user:secret@github.com/user/repo"),
    ).toBeNull();
    expect(repositoryUrl("https://github.com/")).toBeNull();
    expect(repositoryUrl("https://github.com/example/permission-panic/")).toBe(
      "https://github.com/example/permission-panic",
    );
  });
  it("generates a localized challenge with the actual score and a playable URL", () => {
    const history = scenarios.map((s) => judge(s, s.correct, s.reviewRequired));
    expect(shareText(history, "en")).toContain("1000/1000");
    expect(shareText(history, "en")).toContain("100% accuracy");
    expect(shareText(history, "zh-Hans")).toContain("正确率 100%");
    expect(shareText(history, "ja")).toContain("正答率100%");
    expect(shareText(history)).toContain("https://karurukaruru.github.io/permission-panic/");
  });
});
