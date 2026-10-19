# As-built — MIG-6

## Shipped against the contract

- C1: `packages/config/eslint/process-env.js`, spread into the shared base, makes an environment read an error in every workspace's `yarn lint`. That covers the member form, the destructured form, and an `env` import from the process module. The seam is `env.ts` or `src/env.ts` at the workspace root only.
- C2: bulk suppressions in `apps/web`, `packages/api`, `packages/auth`, `packages/db` and `packages/observability`. The lint run measured 30 reads in 13 files; workspaces with no reads carry no file. ESLint fails a count that rises, and also one left above the reads, so every count is exact.
- C3: the two `apps/web/AGENTS.md` exceptions are named in the rule's config. Inside them a local rule (`env-seam/public-names-only`) still errors on any name that is not `NEXT_PUBLIC_*` or `NODE_ENV`.
- C4: `yarn lint` is green over all eleven workspaces.

## Deviations

- `eslint-plugin-only-warn` left `packages/config/eslint/base.js`. It downgraded every error to a warning, and bulk suppressions hold errors only, so the first freeze came out empty. Under `--max-warnings 0` every other rule's gate is unchanged: this is a tightening (toolkit verify recipe 3.1, step 4). `no-emoji.js`'s comment now says so. [ASSUMPTION: the dependency stays in `packages/config/package.json` until a lockfile change of its own removes it.]
- Assess V3 counted 19 files. The lint run counts 13: V3's grep also took comments and the seam files.
- Warden's consult added the public-names-only check, the root-only seam and the process-module import ban. All three are inside the contract's objective.
- `apps/web/env.ts`'s header named `lib/env/resolve-tier-env.ts` as the second exception. That file only mentions the name in a comment. The header now names the two exceptions the rule names.
- `planned_paths` narrowed from `apps/web/**` and `packages/**` to the files the ticket touches, so another thread's untracked file is not counted as this ticket's. The root `package.json` left the list once its one `test:env-seam` line was committed; the file is shared, and MIG-4's thread is editing it.
- [ASSUMPTION] Each count only falls because ESLint fails one that rises. Re-running `--suppress-all` to raise a count shows up in the committed diff; no check compares against the base branch.

## Not verified

- No check compares suppression counts with the base branch (see the last deviation).

## Next

Build MIG-15 (auth) before MIG-7, then MIG-16 to MIG-19 in MIG-7's module order. MIG-20 (secrets in `next.config.ts`'s `env:`) is Warden's red and should not wait on the moves.
