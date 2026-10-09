---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.mjs"
---

# TypeScript

Only the rules a capable model would not apply by default. Full contract: `docs/architecture/codebase-conventions.md`, which wins on any conflict here.

- Named exports; a default export only where Next.js or a config file requires one.
- Kebab-case file names; verb-first function names (`getAllDocs`, `resolveDocLink`); no `helpers`, `misc` or `utils.ts` catch-alls.
- Import workspaces as `@syn/<name>`, never by relative path across a package. `yarn lint:boundaries` enforces the layer graph; never suppress it.
- Server Components by default; `"use client"` on line 1 of a leaf, placed by its importers.
- `process.env` is read only in an app's `env.ts`, created by the first variable.
- `tooling/*.ts` runs directly on Node 22 with type stripping: no enums, no parameter properties, no `namespace`; import with explicit `.ts` extensions.
