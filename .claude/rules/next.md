---
paths:
  - "apps/*/**"
  - "**/next.config.*"
---

# Next.js 16

It is not the Next.js you remember. `middleware.ts` is `proxy.ts`; `next/config` is gone; `params`, `cookies()` and `headers()` are async; the caching defaults changed. Read `node_modules/next/dist/docs/` before writing app code. Next's own agent-rules generator is off (`agentRules: false`), so this file is the one home.

Place a component by its importers (conventions §1); never `app/_components/`.
