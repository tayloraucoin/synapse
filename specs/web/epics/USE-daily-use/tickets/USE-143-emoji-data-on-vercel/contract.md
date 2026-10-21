---
id: USE-143
size: small
objective: "The production build on Vercel stages the emoji dataset, so the Emoji tab is never blank in production"
slice_type: "build configuration; risks a picker that renders empty only in production"
non_negotiables:
  - "No new dependency; the dataset is copied from the pinned emojibase-data by scripts/copy-emoji-data.mjs."
  - "The copy runs outside turbo's cache, so a cache hit cannot skip it."
devs_call: "Where the step is called from; the default is vercel.json's buildCommand through the root web:build."
cites:
  - "specs/web/epics/USE-daily-use/ux/interactions/icon-picker/index.md"
  - "C-USE-icon-picker-2"
truth_files: "none: no behaviour changes, production now matches it"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "apps/web/vercel.json"
  - "apps/web/lib/env/vercel-build.test.ts"
depends_on: []
out_of_scope:
  - "Committing the dataset"
criteria:
  - id: C1
    statement: "apps/web/vercel.json's buildCommand runs the emoji copy before the web build"
    evidence: test
    command: "yarn workspace web test"
---

# Contract — USE-143 emoji-data-on-vercel

## Build notes

Fix 2 of Taylor's review of 2026-10-19: `vercel.json` ran `turbo run build --filter=web` directly, skipping the root `web:build`'s `yarn emoji-data`.

- **Approach:** `buildCommand` becomes `cd ../.. && yarn web:build`, which already runs the copy then the turbo build. A test reads vercel.json and the root script so the step cannot drop again.
- **Gotchas:** putting the copy in apps/web's `build` would be skipped on a turbo cache hit, since `public/emoji` is not a turbo output.
- **Model:** any.
