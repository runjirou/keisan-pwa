# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

けいさんプリント ("Math Print") — a PWA for Japanese 2nd-graders to drill single-digit addition. All UI text, in-code comments, and content are in Japanese; keep new UI copy consistent with that (child-friendly, hiragana-heavy).

## Commands

```bash
npm install     # install deps
npm run dev     # start Vite dev server
npm run build   # production build to dist/
npm run preview # preview the production build
npm run lint    # oxlint
```

There is no test suite/framework configured in this repo.

## Architecture

The app is split by responsibility:

- `src/App.jsx` — root component (`KeisanApp`, default export). Owns top-level state (`screen`: `'menu' | 'quiz'`, `sheets`, `showTimer`), loads/saves persistence, and renders `MenuScreen`/`QuizScreen` based on `screen`.
- `src/components/MenuScreen.jsx` — level picker, today's sheet counts, timer toggle, past results grid, and the reset-records button.
- `src/components/QuizScreen.jsx` — runs one 20-question sheet (`QUESTIONS_PER_SHEET`), a numeric keypad, correct/wrong flash feedback, elapsed-time tracking, then a results screen.
- `src/components/ToggleSwitch.jsx` — the timer on/off switch used by `MenuScreen`.
- `src/constants.js` — `COLORS`, `FONT_DISPLAY`/`FONT_BODY`, `LEVELS`, `QUESTIONS_PER_SHEET`, `TIME_THRESHOLDS`.
- `src/gameLogic.js` — `generateProblem(level)` (picks `genNoCarry()`/`genCarry()` internally), `scoreMeta()`/`timeMeta()` (map a score/time to a badge color+label), `todayStr()`.
- `src/pressHandlers.js` — `pressHandlers()`, the pressed-button shadow/translate effect shared by every button.
- `src/storage.js` — plain `window.localStorage` read/write helpers.

Styling is all inline `style={}` objects using the `COLORS` constant and `FONT_DISPLAY`/`FONT_BODY` — there is no CSS framework or CSS modules; `src/index.css` only has a global reset. When adding UI, follow the existing inline-style + `pressHandlers()` pattern rather than introducing a new styling approach.

**Persistence**: `src/storage.js` exports plain (synchronous, non-throwing) `loadSheets()`/`saveSheets()`/`loadSettings()`/`saveSettings()` functions backed directly by `window.localStorage` — regular browser usage, not the Claude.ai-artifact storage API shape. Two keys are used: `keisan:sheets` (array of `{level, score, seconds, date}` completed-sheet records) and `keisan:settings` (`{showTimer}`). `KeisanApp` loads both via lazy `useState` initializers and re-saves on every change via `useEffect`.

**PWA shell**: `public/manifest.webmanifest` + `public/sw.js` (network-first fetch, falls back to cache offline) + icons. `index.html` registers the service worker directly (no plugin). `vite.config.js` sets `base: './'` so the built assets resolve correctly under GitHub Pages' subpath (`https://<user>.github.io/keisan-pwa/`).

**Deployment**: `.github/workflows/deploy.yml` builds and deploys `dist/` to GitHub Pages automatically on push to `main` (Pages source must be set to "GitHub Actions" in repo settings).

## Adding a new level or problem type

Levels are declared in the `LEVELS` array (`src/constants.js`) and consumed by `generateProblem()` (`src/gameLogic.js`), `TIME_THRESHOLDS`, and the level-picker grid in `MenuScreen` — a new level needs an entry in `LEVELS`, a threshold in `TIME_THRESHOLDS`, and a branch in `generateProblem()`.
