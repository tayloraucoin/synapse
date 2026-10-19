---
id: "USE-1"
size: small
objective: "The old app moves into _legacy/ folders that nothing builds, lints or imports, leaving auth, the account, push, assets, feedback and the scheduler live and an empty Today for USE to build on"
slice_type: "mechanical move across apps/web and @syn/api; risks a live file still importing a moved one, a copy in place of a git mv, a scheduler job left reading old tables, and a red verify at the end of wave 0"
non_negotiables:
  - "Every move is a git mv; nothing is deleted."
  - "Nothing under packages/db moves: every old schema file stays, or drizzle-kit generate writes a DROP TABLE."
  - "Nothing live imports from a _legacy/ path; a lint rule fails it, and its message names the fix."
  - "Sign-in, sign-out, the account row, push subscription, assets, feedback and the scheduler route keep working."
  - "No migration, no database write, no new dependency."
  - "@syn/ui, @syn/utils, @syn/validators, @syn/hooks, @syn/types and @syn/constants keep every file."
  - "apps/mobile/ is not touched."
devs_call: "Which components/, lib/ and content/ files go with the old routes (a file only legacy code imports goes); the placeholder Today's one line; whether the rule is an eslint-plugin-boundaries element or a no-restricted-imports pattern."
cites:
  - "call C8 (calls.md: the FLO board is legacy)"
  - "call C9 (calls.md: old routes and Settings sections are legacy)"
  - "D-USE-99"
truth_files: "none: specs/web/ux/ areas move to docs/archive/ at USE's promotion, not here"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "apps/web/_legacy/"
  - "apps/web/app/(shell)/"
  - "apps/web/app/(setup)/"
  - "apps/web/app/page.tsx"
  - "apps/web/components/"
  - "apps/web/content/"
  - "apps/web/lib/"
  - "apps/web/tsconfig.json"
  - "apps/web/eslint-suppressions.json"
  - "packages/api/src/_legacy/"
  - "packages/api/src/root.ts"
  - "packages/api/src/routers/"
  - "packages/api/src/services/"
  - "packages/api/tsconfig.json"
  - "packages/config/eslint/"
  - "packages/config/eslint/boundaries.js"
  - "eslint.config.mjs"
  - "tests/legacy-move.test.ts"
  - "docs/architecture/directory-map.md"
depends_on: []
out_of_scope:
  - "The new shell, rail and tabs: the wave 1 shell ticket"
  - "New routes, tables or routers: wave 1 onward"
  - "Moving specs/web/ux/ areas to docs/archive/: USE's promotion"
  - "Notifications for blocks and to-dos: they return with the wave 3 reminders and push tickets"
criteria:
  - id: C1
    statement: "The live route folders under apps/web/app are (auth), (auth-pending), auth, api, legal, logout and (shell) holding only layout.tsx and today/; no (setup) folder remains"
    evidence: test
    command: "yarn test:root"
  - id: C9
    statement: "Every route folder, router and job named in the Build notes' move list exists under apps/web/_legacy/ or packages/api/src/_legacy/, so a deletion fails"
    evidence: test
    command: "yarn test:root"
  - id: C2
    statement: "appRouter mounts exactly user, notification, asset and feedback, and the scheduler registers exactly expire_exports"
    evidence: test
    command: "yarn test:root"
  - id: C3
    statement: "A live file in apps/web or packages/api that imports a _legacy/ path fails lint, with a message that says to git mv the file back out and own it"
    evidence: test
    command: "yarn test:root"
  - id: C4
    statement: "Every workspace type-checks with the _legacy/ folders excluded"
    evidence: check
    command: "yarn check-types"
  - id: C5
    statement: "Every workspace lints clean with the _legacy/ folders ignored"
    evidence: check
    command: "yarn lint"
  - id: C6
    statement: "The boundary graph passes"
    evidence: check
    command: "yarn lint:boundaries"
  - id: C7
    statement: "The web app builds with the old routes gone"
    evidence: check
    command: "yarn build"
  - id: C8
    statement: "Signed out, / shows the landing and sign-in works; signed in, / lands on the empty Today, the push toggle still subscribes, sign-out works, and /orient, /day, /review, /settings, /workflow and /setup are not found"
    evidence: manual
    reason: "needs a real session against Taylor's staging tier; the builder defers it with the steps"
---

# Contract — USE-1 legacy-move

## Build notes

Wave 0, alone: every later USE ticket starts from the tree this leaves. Taylor ruled that everything the app has now is deprecated (C8, C9, 2026-10-13); it is moved, not deleted.

- **Approach:** `git mv` each old folder into `_legacy/`, keeping its relative path (`apps/web/app/(shell)/today/` goes to `apps/web/_legacy/app/(shell)/today/`). Then cut the live files that pointed at them, add the excludes, add the rule, and finish with a new placeholder `today/page.tsx`. Move first and edit after, in separate commits if that keeps renames detectable.
- **Decisions that apply:**
  - C8: the FLO board is legacy; its tables stay in the database.
  - C9: the old routes and Settings sections are legacy.
  - D-USE-99: the tabs and rail are rebuilt by USE. The wave 1 shell ticket draws them, so this ticket leaves no nav at all.
- **What moves** (placement.md's table):
  - `apps/web/app/(shell)/` route folders (orient, today, day, review, settings, workflow), the old shell's `_components/`, and `(setup)/`.
  - The `components/`, `lib/` and `content/` files only those import, including `lib/stores/use-timer-store.ts`.
  - `@syn/api`: the routers adjust, category, day, dayPlan, fixture, habit, item, journal, link, passage, quote, reason, review, shell, template, timer, week and workflow; the services day, library, plan, review, shell and workflow; `notifications/block-pushes.ts`; and the jobs auto-close-days and notify.
- **What stays live:**
  - `app/layout.tsx`, `(auth)/`, `(auth-pending)/`, `auth/`, `api/` (trpc, pwa/push, jobs/scheduler, assets), `legal/`, `logout/`, `manifest.ts`, `public/sw.js`, `env.ts`, `proxy.ts`.
  - `lib/{trpc,clients,auth,pwa,assets,env}`; `lib/routes.ts`, cut to live routes; `lib/entry`, pointed at `/today`.
  - The hooks use-online, use-dismissed, use-remembered-toggle and use-now.
  - `@syn/api`'s `root.ts`, `context.ts`, `trpc.ts`, `services/{user,notifications,asset,system,jobs}` and `run-scheduled-jobs.ts`.
  - A live file that imported a moved one either moves too, when old domains are all it serves, or loses that import.
- **Interfaces:**
  - `appRouter` becomes `{ user, notification, asset, feedback }`.
  - `SCHEDULED_JOBS` becomes `[expireExportsJob]`.
  - `(shell)/layout.tsx` keeps the auth gate and the providers, with no old shell chrome.
  - `/today` renders one muted line inside `@syn/ui`'s frame.
- **Per path:**
  - Each `tsconfig.json` excludes `_legacy`.
  - The shared ESLint config and the root `eslint.config.mjs` ignore `**/_legacy/**`.
  - `boundaries.js` (or the shared config) forbids importing `**/_legacy/**`.
  - `tests/legacy-move.test.ts` reads the tree and source text for C1, C2 and C9, and runs ESLint's Node API on an in-memory live file for C3. Name each test after its criterion.
  - `docs/architecture/directory-map.md` is regenerated with `yarn directory-map`.
- **Gotchas:**
  - `@syn/types` and `@syn/constants` stay, even where only legacy code reads them.
  - `services/user/build-export.ts` and `complete-first-run.ts` read old tables through `@syn/db`. That is allowed: keep them.
  - Run `yarn docs:check-links` after the move. `apps/web/eslint-suppressions.json` entries for moved files go.
  - Notifications stop until wave 3. That is expected; say so in the close.
- **Model:** Opus 5.5 at medium. A smaller model copies instead of moving, or leaves a live import behind and suppresses it.
