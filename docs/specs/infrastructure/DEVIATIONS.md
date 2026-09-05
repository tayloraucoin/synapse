# Infrastructure — Deviations (append-only)

One line per intentional divergence from a ticket, the handoff, or CC's convention. Never edit a ticket to match what shipped; append here. Format:

```
YYYY-MM-DD · <ticket-id> · <what changed> · <why>
```

2026-09-04 · track · Repo re-scaffolded with `create-turbo` after the v2 handoff was written; `docs/` was not carried over · The v2 handoff's single-app call (§3.1 D1) is superseded by the Turborepo; `docs/ux/` restored from the source files; the v2 handoff file itself must be re-placed by Taylor (see README).

2026-09-04 · INF-1 · `packages/config/eslint/boundaries.js` diverges from CC's copy in two settings — a TypeScript-aware `import/resolver` and `flag-as-external.customSourcePatterns` derived from `RESTRICTED_EXTERNAL` · CC's copy resolves no `@cc/*` import (its entry points are `.ts`; the default resolver tries `.js`) and never flags third-party modules external, so it reports zero violations; the README makes `yarn lint:boundaries` a non-negotiable, and a lint that passes everything is not one. See TECHNICAL-DECISIONS.
2026-09-04 · INF-1 · `packages/ui/package.json` declares `main` and `types` as `./src/index.ts` alongside `exports` · The boundaries resolver reads `main`; without it `@syn/ui` is unresolvable and every rule against it falls through `isUnknown`. Every `@syn/*` package from INF-2 on carries the same pair — CC's do already.
2026-09-04 · INF-1 · `apps/web/.gitignore` copied from CC `apps/toolkit/.gitignore`; root `.gitignore` gained `*.tsbuildinfo` · The spec's file list did not name an app-level ignore file, but `next-env.d.ts` and `tsconfig.tsbuildinfo` are generated on every `check-types` and CC ignores both at the app level. Root-level `*.tsbuildinfo` covers `packages/*` the same way.
2026-09-04 · INF-1 · `turbo.json` `globalEnv` omits `ENABLE_EXPERIMENTAL_COREPACK`, which CC carries · The spec's keep-list did not name it and no build reads it yet; INF-10 adds it if Vercel's corepack path needs it.
