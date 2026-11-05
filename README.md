# DSA Hero — Zero to DSA Hero in Java

A web app that takes a complete beginner to interview-grade data structures and algorithms in Java.
**One concept, one problem, mastery before moving on.** Learners write real Java in the browser, and their code is compiled and tested right there. There's no server and nothing to install.

## What's inside (first release)

| | |
|---|---|
| **Content** | Phase 0 *Java foundations* (10 modules) and Phase 1 *Complexity and linear structures* (9 modules): 95 module problems plus 12 timed phase-exam problems, all verified against a real JDK |
| **Learning loop** | Story hook → concept lesson → step-through visualizer → Java spotlight → guided problem → mastery set → boss problem → mastery gate |
| **Mastery gate** | ≥ 80 % of the mastery-set tests, the boss problem, a gate question, and an "explain it back" check (key-idea matching). Then the next module unlocks |
| **Phase gates** | Timed exams on unseen problems (Phase 0: 8 problems / 60 min; Phase 1: 4 problems / 75 min). Passing one levels you up |
| **Motivation** | Daily streak (1 solve or 5 reviews), streak freezes (earned every 7 days, max 2), XP, 8 levels (Novice → DSA Hero), 17 badges, a daily challenge, activity heatmap, celebrations |
| **Retention** | Spaced-repetition review cards (1, 3, 7, 21, 60 days), added when a module is mastered |
| **Editor** | CodeMirror 6 with Java highlighting, auto-save, Run (visible tests) and Submit (all tests, hidden included), shortcuts Ctrl/⌘+Enter and Ctrl/⌘+Shift+Enter |
| **Feedback** | Per-test input / expected / actual / printed output, compile errors mapped to the learner's own line numbers, a time limit that catches infinite loops *and* too-slow solutions (large generated tests) |
| **Hints** | Progressive hints (−10 XP each); the solution and walkthrough unlock after solving or using every hint |
| **Visualizers** | Variables, arrays with pointers and windows, linked lists, stacks, queues, and an interactive Big-O growth explorer |
| **Profiles** | Learn as a guest, or create a free profile (username + password, or Continue with Google) to save progress in the cloud and use any device. Guest progress moves into the profile; devices merge, never overwrite |
| **Other** | Free-form Java playground, light and dark themes, mobile layout, progress export/import, preview mode for reviewers |

## How Java runs in the browser

Learner code is compiled and run by **[CheerpJ](https://cheerpj.com)**, a WebAssembly JVM. CheerpJ 5.0 (released 2 Nov 2026) ships the full JDK, including `javac`, so the app needs no backend. The setup works like this:

- `public/runner.html` loads CheerpJ inside a hidden iframe. The app talks to it with `postMessage`. If a program runs too long (an infinite loop, or a solution too slow for the large tests), the app **removes the iframe** to stop it and starts a fresh one.
- `public/cj/DsaCompile.class` is a tiny helper (source in `java-src/`) that drives `javac` and captures diagnostics.
- `src/runner/harness.ts` wraps the learner's code with a generated test harness (`src/runner/testkit.ts`) that runs each test in isolation and reports JSON.
- The first run downloads the JVM (expect 10–20 s). After that, runs are quick.

Configure with environment variables at build time:

| Variable | Default | Purpose |
|---|---|---|
| `VITE_CHEERPJ_VERSION` | `5.0` | CheerpJ loader version (`https://cjrtnc.leaningtech.com/<v>/loader.js`) |
| `VITE_JAVA_VERSION` | `17` | Java version CheerpJ runs (17 supports records and switch expressions) |
| `VITE_RUNNER` | *(CheerpJ)* | Set to `local` in development to run Java with your local JDK instead |

> **Licensing.** CheerpJ's Community licence is free for personal projects and technical evaluation. Its licensing page also allows commercial use by individuals and one-person companies. Larger commercial deployments need a paid licence. Check [cheerpj.com/licensing](https://cheerpj.com) before launching commercially.

## Profiles and cloud progress

Learners can use the site as a guest (progress in that browser only), or create a profile to save progress in the cloud:

- **Username + password.** Passwords are hashed with PBKDF2-SHA256. At sign-up the learner gets a one-time **recovery code** that resets a forgotten password (no email needed). Resetting signs out every other device.
- **Continue with Google** (optional). Google accounts can also be linked to an existing profile from the Profile page.
- **Sessions** are HMAC-signed, HttpOnly cookies (90 days), so signing in costs no storage writes.
- **Sync works like KinFit**: pull, merge, push only when something changed, about 20 seconds after progress and when the page is hidden. Merging never loses progress: solved problems, gates, badges and best scores are combined; XP is counted per device and added up; the newest code wins per problem.
- **Daily backups**: one snapshot per day of progress is kept for 30 days and can be restored from the Profile page.

Server code lives in `functions/` (Cloudflare Pages Functions): `functions/api/auth/*` (sign-up, sign-in, reset, Google, account) and `functions/api/progress.js`.

### One-time Cloudflare setup

1. **Storage (required for profiles):** Cloudflare dashboard → **Storage & Databases → KV → Create namespace**, name it `dsa-hero-store`. Then open the Pages project → **Settings → Bindings → Add → KV namespace**, variable name **`STORE`**, pick `dsa-hero-store`, **Save**.
2. **Redeploy:** **Deployments → ⋯ on the latest deployment → Retry deployment.** Bindings only apply to new deployments.
3. *(Optional)* **Session secret:** add an encrypted environment variable `AUTH_SECRET` (any long random string). Without it, a secret is generated once and kept in KV.

Without the `STORE` binding the site still works; it just runs in guest mode and hides sign-in.

### Optional: Continue with Google

1. In [Google Cloud Console](https://console.cloud.google.com/): create a project → **APIs & Services → OAuth consent screen** (External; app name *DSA Hero*; your email) → **Credentials → Create credentials → OAuth client ID** → *Web application*.
2. **Authorized redirect URI:** `https://dsa-hero.pages.dev/api/auth/google-callback` (add your custom domain's version too if you use one).
3. Copy the client ID and secret into the Pages project → **Settings → Variables and Secrets**: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (encrypt the secret). Redeploy.

The **Continue with Google** button appears automatically once both variables and the `STORE` binding exist.

### Free-plan limits

KV's free plan allows 1,000 writes and 100,000 reads a day. Sign-up costs 2 writes; a progress save costs 1 (plus 1 for the first save of each day, for the daily backup). Saves are batched (one per ~20 s of activity) and skipped when nothing changed, which comfortably supports small classes. For larger audiences, move progress to D1 or upgrade the Workers plan.

## Run it locally

```bash
npm install
npm run dev          # uses CheerpJ from its CDN
npm run dev:local    # local JDK (javac + java on PATH) + the server functions with in-memory storage
```

## Deploy to Cloudflare Pages

1. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**, then pick this repository.
2. Build settings: framework preset **None** (or Vite), build command `npm run build`, output directory `dist`.
3. Optional: add the environment variables above.
4. Deploy. Pages serves `index.html` for every unknown route, so client-side routes such as `/module/0.1` work without extra config.

## Verify the course content

Every problem has a reference solution. The verifier compiles each one against all of its tests (hidden and large-input ones included) with your local JDK, and also checks that each starter template compiles:

```bash
npm run verify             # all 107 problems
npm run verify -- p1-3     # only problems whose id contains "p1-3"
```

CI (`.github/workflows/verify.yml`) runs the verifier and the production build on every push.

## Project layout

```
src/content/        course content: phases → modules → problems (TypeScript data)
  phase0/, phase1/  lessons, visualizer frames, problems, tests, solutions, review cards, exams
src/runner/         harness generator, Java test kit, CheerpJ and local engines
src/state/          progress store (localStorage), streaks, XP, gates, spaced review, badges
src/ui/             editor, markdown and syntax highlighting, visualizers, widgets, layout
src/pages/          Home, CourseMap, Module, Problem, Review, Exam, Profile, Playground
public/runner.html  the sandboxed Java runner page
scripts/verify.mts  content verifier
```

### Adding a problem

Problems are plain data (`src/content/types.ts`). Three kinds are supported:

- **`program`**: stdin → expected stdout (used for early Phase 0).
- **`function`**: a method on `class Solution`, tested with argument/expected pairs. Arguments can be **generated** (`{ gen: 'random', n: 200000, … }`) for performance tests; their expected values come from a Java `oracle`.
- **`custom`**: hand-written harness code using `T.test(name, expected, () -> …)` for classes and data-structure designs.

Run `npm run verify` after every content change.

## Roadmap

- Phases 2–6 from the curriculum: recursion and sorting, hashing and trees, graphs, greedy/backtracking/DP, Hero track
- AI tutor with Socratic hints and code-style review; AI-graded "explain it back"
- Friends leaderboard for the daily challenge
- Interactive visualizers that run on the learner's own input
