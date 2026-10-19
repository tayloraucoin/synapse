---
size: small
objective: "yarn test:e2e loads its specs: the journeys read the test account without importing the app's env.ts, which Playwright loads as CommonJS"
slice_type: "test harness only; risks a second process.env reader outside the env seam"
non_negotiables:
  - "The env seam holds: no process.env outside an env.ts the lint rule names."
  - "No spec signs in to staging or writes to it."
devs_call: "An e2e/env.ts named in packages/config/eslint/process-env.js, or making apps/web/env.ts load under CommonJS (it reads import.meta.url)."
cites:
  - "apps/web/playwright.config.ts"
truth_files: "none: no surface changes"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "apps/web/e2e/"
  - "apps/web/playwright.config.ts"
  - "packages/config/eslint/process-env.js"
depends_on:
  - "USE-106"
out_of_scope:
  - "New journeys"
criteria:
  - id: C1
    statement: "yarn test:e2e in apps/web loads offline.spec.ts and shell-cache.spec.ts: neither is skipped for a load error"
    evidence: check
    command: "yarn workspace web test:e2e"
  - id: C2
    statement: "Lint passes on the e2e files"
    evidence: check
    command: "yarn lint"
id: USE-113
---

# Contract — e2e-env-loader

## Build notes

Found building USE-107 (2026-10-17). `yarn test:e2e` lists 0 tests: both specs import `../env`, and Playwright compiles them as CommonJS (apps/web has no `"type": "module"`), so `env.ts`'s `import.meta.url` throws "Cannot use 'import.meta' outside a module". A `.spec.mts` doesn't help, because `env.ts` itself still loads as CommonJS. USE-106 C1 and USE-107 C1 to C3 are journeys that wait on this. Also: the config's `reuseExistingServer` on :3000 picks up whatever is listening there; on 2026-10-17 that was another project. A dedicated port is worth it.
