# `apps/web` — app-local rules

**Read the root [`AGENTS.md`](../../AGENTS.md) first.** This file adds only what
is local to this app: the route map, the scope, and the product
non-negotiables. It never restates root guidance.

---

## This is Next.js 16, not the Next.js you remember

`middleware.ts` is gone — the file is `proxy.ts`. `next/config` is gone. Route
`params` and `cookies()`/`headers()` are async. Caching defaults changed. Read
the relevant guide under `node_modules/next/dist/docs/` before writing app code
rather than reaching for a remembered API.

---

**Scope, the product non-negotiables and the route table** are in [`docs/product-rules.md`](docs/product-rules.md), moved there verbatim on 2026-10-09 (record 0001). Read it before any change to this app.

---

## The route map

Cross-cutting §4.1, and every one has a builder in
[`lib/routes.ts`](lib/routes.ts). **A hardcoded path anywhere else in this app
is a defect.**

The two `/legal/*` pages sit outside all three groups on purpose: a privacy
policy a person has to sign in to read is not a privacy policy, and both the
landing footer and About link to them.

### The three route groups

| Group     | Gate                                                | Frame                                                         |
| --------- | --------------------------------------------------- | ------------------------------------------------------------- |
| `(auth)`  | redirects a **signed-in** person to `/`             | one centred column, `max-w-sm`                                |
| `(setup)` | a verified session                                  | the sequence; deliberately does **not** re-run the entry tree |
| `(shell)` | **the auth gate** — session → verified → entry tree | skip link + `main#main`; the chrome arrives with Epic 2       |

---

## Folder layout

```
app/
  _components/     client leaves shared across routes, "use client" line 1
  (auth)/ (setup)/ (shell)/   route groups
  api/             route handlers — the enumerated tRPC exceptions only
lib/
  routes.ts        every path in the app
  auth/            request context, the verified-email gate
  clients/supabase/client.ts   the browser client (reads NEXT_PUBLIC_* literals)
  entry/           the §4.2 decision tree
  env/             tier resolution, read only by env.ts
  forms/           useSynapseForm — submit-first
  pwa/             install detection, push subscribe
  stores/          the client-state rule; no store yet
  trpc/            client · provider · server caller
env.ts             THE only process.env reader
proxy.ts           session refresh only
```

---

## Reminders

- **Server Components by default.** A client leaf carries `"use client"` on
  line 1 and lives in `_components/`.
- **`env.ts` is the only `process.env` reader.** The two documented exceptions
  are `lib/clients/supabase/client.ts` and `lib/trpc/provider.tsx`, which read
  canonical `NEXT_PUBLIC_*` names as literals because Next cannot inline
  anything else.
- **Page data comes from the tRPC server caller** (`lib/trpc/server.ts`), never
  raw `@syn/db` in a page.
- **Real schema names** are in
  [`../../packages/db/SCHEMA_REFERENCE.md`](../../packages/db/SCHEMA_REFERENCE.md),
  generated from the schema. Do not guess a column.
- **Audit `@syn/ui` before building a component.** If it is reusable, it belongs
  there with a story, not here.
