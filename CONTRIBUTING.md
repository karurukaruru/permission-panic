# Contributing

Good permission dilemmas are welcome. The most useful contribution is a small,
realistic scenario where context changes the right answer.

## Work locally

Use Node.js 22.12+ (22 or 24 LTS recommended).

```sh
npm ci
npm run dev
```

Before opening a pull request:

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

## Add or refine a scenario

Edit `src/data/scenarios.ts`. Each `Scenario` defines a unique ID, task, request,
command, scope, inspection evidence, final `correct` decision, `reviewRequired`,
risk level, success/failure copy, technical explanation and simulated log lines.

- Provide enough initial context for the intended decision. When it is missing,
  reveal concrete evidence through Inspect and set `reviewRequired: true`.
- `correct` is the final Approve/Deny decision. Inspect reveals information; it
  never finishes a round by itself.
- Do not label a tool inherently safe or malicious. State what it does here,
  to which data, for which task, and under which authorization.
- Avoid traps based on undocumented assumptions. Verify the technical behavior
  against official tool documentation before proposing a scenario.
- Keep logs humorous, explanations accurate, and copy understandable.
- Use synthetic credentials and reserved `.example` hostnames. Never include
  real keys, personal data, or working exfiltration endpoints.
- Every command is display text. No command may ever be executed by the game.

The v1 campaign intentionally has **10 rounds**. Replace/refine one for a small
contribution. Expanding the campaign requires updating fixed-size presentation
and export layouts, the score denominator, independent browser fixtures and tests.

## Code map

- `src/data/scenarios.ts`: typed, dependency-free content.
- `src/lib/game.ts`: pure reducer and scoring; no DOM dependencies.
- `src/components/PermissionCard.tsx`: request, evidence, simulation and outcome.
- `src/components/Results.tsx`: results, review, share and replay.
- `src/lib/share.ts`: native Canvas PNG export and platform-specific text.
- `src/lib/config.ts`: optional repository URL validation.
- `tests/game.spec.ts`: browser journeys with independent answer fixtures.

Use native CSS and browser APIs. Keep runtime dependencies limited to React and
React DOM unless there is a clear reason to change that. Honor reduced motion,
keyboard use, focus states and mobile layouts. Include real screenshots for UI
changes. Keep pull requests focused; explain the behavior and how you tested it.
