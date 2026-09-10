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

- `src/App.jsx` — root component (`KeisanApp`, default export). Owns top-level state (`screen`: `'menu' | 'quiz' | 'chick'`, `sheets`, `showTimer`, `questionsPerSheet`, `users`, `currentUser`, `points`, `chickGrowth`), loads/saves persistence, and renders `UserSetupScreen`/`MenuScreen`/`QuizScreen`/`ChickScreen`.
- `src/components/UserSetupScreen.jsx` — first-run screen shown whenever `users` is empty; takes a name and calls `onCreateUser`.
- `src/components/MenuScreen.jsx` — current-user badge, points badge, an entry button into `ChickScreen`, level picker, today's sheet counts, past results grid, a monthly `DailyCalendar`, the reset-records button, and a footer block (account switcher/creator, timer toggle, debug question-count slider).
- `src/components/QuizScreen.jsx` — runs one sheet of `questionsPerSheet` questions (prop, not a constant) for `currentUser`, a numeric keypad, correct/wrong flash feedback, elapsed-time tracking, then a results screen (score, time, sheet count, points earned, with a bonus-day popup).
- `src/components/ChickScreen.jsx` — the ひよこそだて (chick-raising) screen: spends points to advance `chickGrowth` through `CHICK_STAGES`, with a whiteout/sparkle transition when the stage actually changes.
- `src/components/ChickIllustration.jsx` — renders the `public/images/*.png` artwork for a given `CHICK_STAGES` index; used by both `MenuScreen` (small badge) and `ChickScreen` (main illustration).
- `src/components/ToggleSwitch.jsx` — the timer on/off switch used by `MenuScreen`; takes a `small` prop for the compact footer variant.
- `src/components/DailyCalendar.jsx` — self-contained month calendar (own prev/next-month state) that counts `sheets` per `date` and renders one cell per day; placed below the per-level results grid in `MenuScreen`.
- `src/constants.js` — `COLORS`, `FONT_DISPLAY`/`FONT_BODY`, `LEVELS`, `QUESTIONS_PER_SHEET` (default/max sheet size), `MIN_QUESTIONS_PER_SHEET` (debug-slider floor), `TIME_THRESHOLDS`, `MAX_USER_NAME_LENGTH`, `BONUS_SHEET_THRESHOLD`/`BONUS_POINTS` (points bonus cadence), `CHICK_FEED_COST`, `CHICK_STAGES`.
- `src/gameLogic.js` — `generateProblem(level)` (picks `genNoCarry()`/`genCarry()`/`genOneDigitPlusTwoDigit()`/`genUpTo20()` internally), `scoreMeta(score, total)`/`timeMeta(seconds, level)` (map a score/time to a badge color+label), `todayStr()`, `chickStageIndex(growth)` (maps cumulative feed count to a `CHICK_STAGES` index).
- `src/pressHandlers.js` — `pressHandlers()`, the pressed-button shadow/translate effect shared by every button.
- `src/storage.js` — plain `window.localStorage` read/write helpers.

Styling is all inline `style={}` objects using the `COLORS` constant and `FONT_DISPLAY`/`FONT_BODY` — there is no CSS framework or CSS modules; `src/index.css` only has a global reset. Icons come from the `lucide-react` package (SVG React components), not custom assets. When adding UI, follow the existing inline-style + `pressHandlers()` pattern rather than introducing a new styling approach.

**Users**: this is a local, password-less multi-profile system (siblings sharing one device), not real auth. `users` is a plain array of name strings; `currentUser` is the active one. `KeisanApp` renders `UserSetupScreen` instead of `MenuScreen`/`QuizScreen` whenever `users.length === 0`. `handleCreateUser(rawName)` in `App.jsx` validates (non-empty, ≤ `MAX_USER_NAME_LENGTH`, not a duplicate) and returns `{ ok, error }` rather than throwing, so both `UserSetupScreen` and the footer "add user" form in `MenuScreen` can show inline errors. Every completed sheet record carries a `user` field; `MenuScreen` filters `sheets` down to `mySheets = sheets.filter(s => s.user === currentUser)` before computing today's counts and the results grid, and `きろくをリセットする` only clears the current user's sheets. Sheets recorded before this feature existed have no `user` field — when the very first profile is created, those orphaned records are migrated onto it (`sheets.map(s => s.user ? s : {...s, user: trimmed})`) so old history isn't silently lost.

**Questions per sheet**: `QUESTIONS_PER_SHEET` in `constants.js` is only the default/max — the debug slider in `MenuScreen`'s footer lets it be lowered per-session via `questionsPerSheet` state in `KeisanApp`. The value active when "プリントをはじめる" is pressed is captured into `activeQuestionsPerSheet` and passed to `QuizScreen` as the `questionsPerSheet` prop, so mid-quiz slider changes (not currently possible from the quiz screen, but future-proofing) can't corrupt an in-progress sheet. Completed-sheet records store their own `total` so `scoreMeta()` and the results grid stay correct even if the slider value changes later; records saved before this field existed fall back to `QUESTIONS_PER_SHEET` (`sheet.total ?? QUESTIONS_PER_SHEET`).

**Points and chick-raising (ひよこそだて)**: completing a sheet always earns 1pt; if that sheet is the `BONUS_SHEET_THRESHOLD`-th (currently 5th, 10th, 15th...) sheet the same user has completed that day, it earns `1 + BONUS_POINTS` instead and `QuizScreen` shows a bonus popup. This bonus math lives in two places that must stay in sync — `App.jsx`'s `handleRecord` (which actually updates the `points` state) and `QuizScreen.jsx`'s `submit` (which computes the numbers shown on the results screen) — both import `BONUS_SHEET_THRESHOLD`/`BONUS_POINTS` from `constants.js` rather than hardcoding them, so a future change to the bonus cadence/amount only needs to happen in one place. `points` and `chickGrowth` in `KeisanApp` are both `{ [user]: number }` maps; `chickGrowth[user]` is the user's cumulative "あたためる／エサをあげる" (warm the egg / feed the chick) count, spent via `handleFeedChick` at `CHICK_FEED_COST` points per action (feeding never fails once affordable — there's no upper limit, so growth keeps counting past the final stage). `gameLogic.chickStageIndex(growth)` maps that cumulative count to an index into `CHICK_STAGES` (`constants.js`), which the chick stays at once it hits the last stage (no further evolution). `KeisanApp` also runs a one-time migration effect that backfills `points` at 1pt/sheet for any user who has completed sheets but has no `points` entry yet (i.e. users who played before the points feature existed).

**Persistence**: `src/storage.js` exports plain (synchronous, non-throwing) `loadSheets()`/`saveSheets()`/`loadSettings()`/`saveSettings()`/`loadUsers()`/`saveUsers()`/`loadPoints()`/`savePoints()`/`loadChickGrowth()`/`saveChickGrowth()` functions backed directly by `window.localStorage` — regular browser usage, not the Claude.ai-artifact storage API shape. Five keys are used: `keisan:sheets` (array of `{level, score, seconds, date, total, user}` completed-sheet records), `keisan:settings` (`{showTimer, questionsPerSheet, currentUser}`), `keisan:users` (array of user-name strings), `keisan:points` (`{ [user]: number }`), and `keisan:chick` (`{ [user]: number }`). `KeisanApp` loads all of them via lazy `useState` initializers and re-saves on every change via `useEffect`.

**PWA shell**: `public/manifest.webmanifest` + `public/sw.js` (network-first fetch, falls back to cache offline) + icons. `index.html` registers the service worker directly (no plugin). `vite.config.js` sets `base: './'` so the built assets resolve correctly under GitHub Pages' subpath (`https://<user>.github.io/keisan-pwa/`).

**Deployment**: `.github/workflows/deploy.yml` builds and deploys `dist/` to GitHub Pages automatically on push to `main` (Pages source must be set to "GitHub Actions" in repo settings).

## Adding a new level or problem type

Levels are declared in the `LEVELS` array (`src/constants.js`) and consumed by `generateProblem()` (`src/gameLogic.js`), `TIME_THRESHOLDS`, and the level-picker grid in `MenuScreen` — a new level needs an entry in `LEVELS`, a threshold in `TIME_THRESHOLDS`, and a branch in `generateProblem()`.

## 言語について

このリポジトリで開発する際のClaude Codeのセッション内チャット、およびプルリクエストの説明文・タイトルは日本語で書くこと。
