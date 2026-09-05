## Summary

<!-- What does this PR change? One or two sentences. -->

## Pre-accept checklist

Run before requesting review:

- [ ] **Location** — each file is where the conventions prescribe (`apps/` vs `packages/`, route colocation, `_components/`).
- [ ] **Naming** — kebab-case filenames; correct identifier casing; `use-` prefix for hooks; `route.ts` for handlers.
- [ ] **Imports** — resolving from the right `@syn/*` packages; no up-layer or cross-app imports. `yarn lint:boundaries` passes.
- [ ] **Server/client** — Server Components by default; client leaves marked `"use client"` on line 1, in `_components/`.
- [ ] **tRPC discipline** — thin resolver; multi-step logic in `@syn/api/services`.
- [ ] **Constant vs type** — runtime values in `@syn/constants`; compile-erased shapes in `@syn/types`.
- [ ] **Validation** — every tRPC input and every form uses a `@syn/validators` schema.
- [ ] **Routes** — every path comes from `apps/web/lib/routes.ts`. No hardcoded strings.
- [ ] **Tokens** — every colour and size comes from `packages/config/tailwind/preset.css` by name. No hex outside that file.
- [ ] **RLS** — every new user-scoped read or write goes through `ctx.rls.execute()`, never the singleton `db`.
- [ ] **Exports** — named exports (except where Next forces a default).
- [ ] **Logged** — one `DEVIATIONS.md` line per divergence; `TECHNICAL-DECISIONS.md` for a choice with real alternatives.

## How to verify

<!-- Commands run, screenshots, or manual steps. -->

```bash
yarn lint
yarn lint:boundaries
yarn check-types
yarn build
```
