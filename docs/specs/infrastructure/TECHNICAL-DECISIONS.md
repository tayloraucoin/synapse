# Infrastructure — Technical Decisions (append-only)

One section per architectural choice that had real alternatives. Written when the decision is made. Format:

```
## YYYY-MM-DD · <ticket-id> · <the decision, as a statement>
**Context (as it was then):** …
**Options weighed:** A … B … C …
**Decision:** …
**Consequences:** what this buys, what it costs, what it forecloses.
**Revisit trigger:** the condition under which this should be reopened.
```

## 2026-09-04 · track · Synapse copies Conscious Connections' conventions and code by hand rather than depending on `@cc/*` packages

**Context:** Two products, two brands, one author, one convention set. The v2 handoff's §11 Q1 asked whether Synapse should join the CC monorepo or stand alone.
**Options weighed:** A — `apps/synapse` inside the CC Turborepo importing `@cc/ui`, `@cc/db`, `@cc/auth`. B — standalone Turborepo, copy-and-adapt from CC with `@syn/*` scope. C — extract a shared `@lighthouse/*` layer both consume.
**Decision:** B.
**Consequences:** Buys brand isolation (CC's tokens never leak), independent deploy cadence, and a schema that can diverge freely. Costs duplicated infrastructure code that will drift; every "copy from CC" in this track is a fork. Forecloses nothing — C remains possible later by extracting the pieces that stayed identical.
**Revisit trigger:** a third product, or a CC infra fix that has to be applied twice more than twice.

## 2026-09-04 · INF-1 · The toolchain is pinned to the CC-validated set — TypeScript 5.9.2, Node 22, ESLint 9 — not the scaffold's TypeScript 7 / Node 24 / ESLint 10

**Context (as it was then):** `create-turbo` scaffolded the repo on TypeScript 7.0.2, Node ≥24, ESLint 10, Prettier 3.9.6. INF-1 proposed the Conscious Connections set instead and routed the call to Mason before INF-2.
**Options weighed:** A — keep the scaffold's TS 7 / Node 24 / ESLint 10 and adapt the toolchain around it. B — pin CC's TS 5.9.2 / Node 22 / ESLint 9 / Prettier 3.7. C — split: TS 7 for apps, 5.9 for the packages that need it.
**Decision:** B, confirmed. `drizzle-kit 0.31.10` parses `schema.ts` with its own TypeScript integration, `typescript-eslint 8.x` declares a `<5.10` supported range, and Storybook 8's `@storybook/react-vite` builder is validated against 5.9 in CC. TypeScript 7 is a compiler rewrite, not a version bump; adopting it means being the first to hit its incompatibilities in three load-bearing tools at once, on a repo that has not yet compiled a single product file. Nothing in Synapse needs it. C is rejected outright — two compilers in one monorepo is a second source of truth for what "compiles" means, which is the failure class this track exists to prevent.
**Consequences:** Buys a toolchain that is known-good, and keeps Synapse and CC on one set of infrastructure fixes rather than two. Costs the TS 7 compile-speed win, which is not a constraint at this size. Forecloses nothing.
**Revisit trigger:** CC bumps TypeScript. Synapse follows in the same week — the pin exists to track CC, not to freeze.

## 2026-09-04 · INF-1 · The boundaries lint gets a module resolver and source-pattern externals, because CC's copy silently enforces nothing

**Context (as it was then):** INF-1 copied `packages/config/eslint/boundaries.js` from CC. Probed with deliberate violations, it reported none of them: not `config → @syn/ui` (an upward import), not `ui → drizzle-orm` (a restricted external), not `ui → apps/web` (a hard ban). `ESLINT_PLUGIN_BOUNDARIES_DEBUG=1` gave the cause: `eslint-import-resolver-node` — the plugin's default, and the only one CC configures — tries `.js`/`.json`/`.node`. Every `@syn/*` package's entry point is `./src/index.ts`, so every workspace import resolved to `path: null` and fell through the `allow: { to: { isUnknown: true } }` rule. Separately, `flag-as-external.inNodeModules: false` meant genuine third-party packages were never flagged `external`, so every `RESTRICTED_EXTERNAL` rule was unreachable. CC (`eslint-plugin-boundaries 6.0.2`, same version) reproduces both. The README makes `yarn lint:boundaries` a non-negotiable enforcement point for the layered package graph; a copy that passes everything is not enforcement.
**Options weighed:** A — copy CC verbatim, log that the lint is inert, and inherit it for eleven tickets. B — add `eslint-import-resolver-typescript` as a dependency and configure it. C — configure the bundled node resolver with TypeScript extensions, and restore external detection with `flag-as-external.customSourcePatterns` derived from the `RESTRICTED_EXTERNAL` list.
**Decision:** C. Two settings change from CC's file, both commented in place: `settings["import/resolver"].node.extensions` gains the TypeScript extensions, and `flag-as-external.customSourcePatterns` is derived from `RESTRICTED_EXTERNAL` (`module` plus `module/**`, so subpath imports like `drizzle-orm/pg-core` are caught). `inNodeModules` stays `false` — flipping it to `true` does make third-party modules external, but it also flags `@syn/*` imports external, because Yarn resolves them through the `node_modules` symlink without realpathing, and that destroys internal element detection. A was rejected on the ground that a constraint nothing enforces is a constraint already eroding, and this one is load-bearing for every later ticket. B was rejected as a new dependency for a resolution problem three lines of configuration already solve.
**Consequences:** Buys an import matrix that actually fails the build. Verified against five probes before closing INF-1: `config → @syn/ui` errors, `config → drizzle-orm` errors, `ui → drizzle-orm/pg-core` errors, `ui → apps/web` errors, and the legal `ui → @syn/config` and `apps/web → @syn/ui` edges both pass. Costs a documented divergence from CC's file, which now has to be re-reasoned rather than re-copied if CC's version changes. It also means a package must declare `main`/`types` pointing at its entry for the resolver to see it — a requirement INF-2 onward must honour, and the reason `@syn/ui` gained both in this ticket.
**Revisit trigger:** CC fixes its own boundaries config, at which point compare and converge. Also revisit if a restricted module ever needs to be caught by resolved path rather than by source string — `customSourcePatterns` matches the import specifier, not the file it resolves to.
