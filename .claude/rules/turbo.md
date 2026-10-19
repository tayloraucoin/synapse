---
paths:
  - "**/turbo.json"
---

# Turborepo 2.x

It may differ from your training data: read the installed docs (`node -p "require.resolve('turbo/package.json')"`, then its `docs/`) before changing `turbo.json` or a task command. Turbo reads every file it hashes and the sandbox denies reading env files, so only `web#build` hashes them: `apps/web/turbo.json` (a package configuration, `extends: ["//"]`) appends `.env*` to the root's build inputs, and `globalDependencies` never names an env file (MIG-3; `yarn check-turbo-env` proves it). Strict mode hides every variable a task does not declare; `TMPDIR` is passed through for the sandbox. `lint` and `check-types` run sandboxed; `build`, and so `yarn verify`, run unsandboxed on a machine that holds `apps/web/.env.local`.
