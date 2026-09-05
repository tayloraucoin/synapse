/**
 * tRPC procedure conventions — the reference for every router in `@syn/api`.
 *
 * TWO TIERS, AND ONLY TWO. `publicProcedure` for anything a signed-out caller
 * may reach; `protectedProcedure` for everything else. Conscious Connections
 * has five because it has couples, admins, a beta gate, and a read-only
 * retention state; Synapse has one person per row and no reader but them, so a
 * third tier would be a third place to get authorisation wrong.
 *
 * TRPCError usage:
 * - UNAUTHORIZED — the caller is not authenticated. **Middleware only**, never
 *   in a procedure body: an auth check inside a resolver is a check the next
 *   resolver can forget.
 * - NOT_FOUND — a row absent within the caller's own scope. Another person's
 *   row is also NOT_FOUND, never FORBIDDEN: a probe must not learn that
 *   something exists.
 * - BAD_REQUEST — input passed zod but failed a rule.
 *
 * DATA ACCESS. Every user-scoped read and write goes through
 * `ctx.rls.execute(tx => …)`. The singleton `db` appears in `context.ts` for
 * bootstrap and nowhere else in this package; a resolver that reaches for it
 * runs as the table owner and skips every policy.
 */
import { createLogger } from "@syn/observability";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

import type { Context } from "./context";

const errorLog = createLogger("trpc");

/**
 * Postgres attaches useful diagnostics to driver errors, and some of them
 * carry ROW VALUES — `detail` on a unique violation quotes the conflicting
 * key, `where` can quote expressions. This picks the fields that describe the
 * FAULT and never the data, so a 500 stays debuggable without turning the
 * server log into a place a person's day leaks.
 */
function describeCause(cause: unknown): Record<string, unknown> {
  if (!(cause instanceof Error)) {
    return { causeType: typeof cause };
  }
  const pg = cause as Error & {
    code?: string;
    constraint_name?: string;
    table_name?: string;
    routine?: string;
  };
  return {
    name: pg.name,
    message: pg.message,
    ...(pg.code ? { pgCode: pg.code } : {}),
    ...(pg.constraint_name ? { constraint: pg.constraint_name } : {}),
    ...(pg.table_name ? { table: pg.table_name } : {}),
    ...(pg.routine ? { routine: pg.routine } : {}),
  };
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  /**
   * A 500 reaches the client as a bare "Internal Server Error" with no body —
   * correct for the client, useless for anyone debugging. Unexpected failures
   * are logged loudly here, once, at the only point every error passes through.
   *
   * Deliberate faults (a `TRPCError` our own code threw) are not logged: a
   * NOT_FOUND is the system working.
   */
  errorFormatter({ shape, error, path }) {
    if (error.code === "INTERNAL_SERVER_ERROR") {
      errorLog.log("unhandled", {
        path: path ?? "unknown",
        ...describeCause(error.cause ?? error),
      });
    }
    return shape;
  },
});

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;
export const middleware = t.middleware;

/**
 * The one gate. Narrowing `authContext` and `rls` to non-null here is what
 * lets every protected resolver use `ctx.rls` without a null check — and what
 * makes forgetting the gate a type error rather than a runtime bypass.
 */
const isAuthed = middleware(({ ctx, next }) => {
  if (!ctx.authContext || !ctx.rls) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      authContext: ctx.authContext,
      rls: ctx.rls,
    },
  });
});

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
