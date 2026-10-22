# Development

Players can use the hosted game or download its single HTML file. These steps
are only for changing the source. Requires Node.js 22.12+ (CI uses Node 22).

```sh
npm ci
npm run dev
```

Open http://localhost:4173. React and React DOM are the only runtime packages.

## Build and test

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

`npm run build` produces the static site in `dist/` and a self-contained
`dist/Permission-Panic.html`. The offline build embeds JavaScript, CSS and the
favicon and uses no CDN. Double-click the HTML file to play without a server.
`npm run preview` serves the actual production build; browser tests use that
production server, so build before running them.

Use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` only for an existing Chrome/Chromium
installation. `PLAYWRIGHT_BASE_URL` can point the same tests at a deployed game,
including a project subpath. An optional `PLAYWRIGHT_STATIC_DIR=dist` fixture
serves built files inside browser tests when a local server is unavailable.

Unit tests cover scoring, state transitions, URL validation, translated content,
language matching and share text. Desktop/mobile browser tests cover complete
runs in all five languages, evidence, language persistence, switching without
losing progress, exported PNGs, clipboard fallback, keyboard behavior and layout.
They also download the actual offline HTML, disable networking, load it through
`file://`, finish all ten requests, and export a score card.
Mobile checks are Chromium emulation, not real iOS Safari or physical devices.

## Code map

- `src/data/scenarios.ts`: canonical scenario data, answers and inert commands.
- `src/locales/`: four translation resources and their type contract.
- `src/lib/i18n.ts`: browser-language detection, optional saved preference and translation.
- `src/lib/game.ts`: reducer and scoring, independent of displayed language.
- `src/lib/share.ts`: localized challenge copy and Canvas PNG export.
- `scripts/build-offline.mjs`: self-contained browser build, no additional runtime packages.
- `tests/`: production-browser journeys and independent answer fixtures.

## GitHub Pages

Push `main`, enable **Settings → Pages → GitHub Actions**, and let `pages.yml`
run. Both workflows run tests and production builds; Pages also runs browser
checks before deploying. Deployment does not require a personal computer to stay on.

Pages sets `VITE_GITHUB_URL` from `github.repository` for the source link and
score-card footer. Other hosts can set it before building (see `.env.example`).
When forking, update the project URLs in the README, HTML share metadata and
the offline challenge-link fallback in `src/lib/share.ts` to the fork's real URL.
Vite uses a relative asset base; the application does not use SPA routing.
