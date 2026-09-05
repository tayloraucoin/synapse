# tRPC patterns — context, tiers, errors, and the RLS rule

**Authority:** `docs/architecture/codebase-conventions.md` §3.5 (tRPC is the
default rail; the exceptions are enumerated) and the doc block at the top of
`packages/api/src/trpc.ts`, which is the version an agent should read first
because it cannot go stale.

---

## The one rule

**Every user-scoped read and write goes through `ctx.rls.execute()`.**

The exported singleton `db` connects as the table owner, which bypasses every
row-level policy. A resolver that reaches for it is not faster — it is
unpoliced. `db` appears in `packages/api/src/context.ts` (bootstrap) and in
nothing else in the package.

```ts
// right
const rows = await ctx.rls.execute((tx) =>
  tx.select().from(habits).where(eq(habits.userId, ctx.authContext.userId)),
);

// wrong — runs as the owner, sees everyone's rows
const rows = await db.select().from(habits);
```

The `where` clause stays even though RLS already restricts the query. Belt and
braces: a query with no `where` is one refactor from being a query over the
table, and the policy should not be the only thing between here and that.

---

## Two procedure tiers, and only two

| Tier | Requires | Use for |
|---|---|---|
| `publicProcedure` | nothing | Anything a signed-out caller may reach. There is very little. |
| `protectedProcedure` | a session — narrows `ctx.authContext` and `ctx.rls` to non-null | Everything else. |

Conscious Connections has five tiers because it has couples, admins, a beta
gate, and a read-only retention state. Synapse has one person per row and no
reader but them, so a third tier would be a third place to get authorisation
wrong.

The narrowing is the point: after `protectedProcedure`, `ctx.rls` is
non-nullable, so **forgetting the gate is a type error** rather than a runtime
bypass.

---

## Errors

| Code | When | Never |
|---|---|---|
| `UNAUTHORIZED` | no session | **In a procedure body.** Middleware only — an auth check inside a resolver is a check the next resolver forgets. |
| `NOT_FOUND` | a row absent within the caller's own scope | |
| `BAD_REQUEST` | input passed zod but failed a rule | |
| `CONFLICT` | a stale-write guard tripped | |

**Another person's row is `NOT_FOUND`, never `FORBIDDEN`.** `FORBIDDEN` tells a
prober that something exists and they may not have it. `NOT_FOUND` tells them
nothing, which is the whole point.

Unexpected 500s are logged once, in the `errorFormatter`, with the fault and
never the row values — Postgres puts the conflicting key in `detail` on a
unique violation, so a naive log of the driver error is a place a person's day
leaks. Deliberate `TRPCError`s are not logged: a `NOT_FOUND` is the system
working.

---

## Thin resolvers

A resolver validates, calls a service, and returns. **If a resolver is
interesting, the logic is in the wrong layer.**

```ts
// packages/api/src/routers/user.ts
updatePreferences: protectedProcedure
  .input(updatePreferencesInput)
  .mutation(({ ctx, input }) =>
    updatePreferences(ctx.rls, ctx.authContext.userId, input),
  ),
```

Multi-step work lives in `packages/api/src/services/<domain>/`, written to be
called from anywhere: a procedure today, a scheduled job tomorrow. The same
rule implemented in two seams will diverge in one of them.

---

## Input validation

Every input is a schema from `@syn/validators`, and the **same** schema the
form uses. One definition, two consumers — otherwise the client accepts what
the server rejects, and the person sees a 500 where they should have seen a
sentence.

---

## The two rails

- **The React client** (`apps/web/lib/trpc/client.ts`) for client components,
  through the fetch adapter at `/api/trpc/[trpc]`.
- **The server caller** (`apps/web/lib/trpc/server.ts`) for Server Components.
  A page calls the router in-process — it never `fetch`es its own server.

Both carry `superjson`, on the link **and** on `initTRPC`. Set on only one and
`Date`s arrive as strings, which makes every time in the app wrong by a type.

---

## When not to use tRPC

Conventions §3.5 enumerates the exceptions, and they are exceptions:

- **Third-party inbound** — a provider posting to a URL it was given
  (`/auth/callback`, `/auth/confirm`).
- **A scheduler** — a cron with a bearer secret and no session
  (`/api/jobs/scheduler`).
- **A browser API's shape** — the push-subscribe endpoint, which the service
  worker flow posts to directly.

Everything else is a procedure. "It's simpler as a route handler" is not on the
list; a route handler is a second place to write auth.

---

## Service-role access

There is exactly one sanctioned RLS bypass: `buildServiceRoleAuthContext(userId)`
in `packages/api/src/services/notifications/fan-out.ts`, because the scheduler
has no session and therefore no `app.user_id` to scope by.

Naming it keeps it findable — **every RLS bypass in this codebase is a
`buildServiceRoleAuthContext` call you can grep for**, rather than an unmarked
`db` import. If you need a second one, that is a conversation, not a commit.
