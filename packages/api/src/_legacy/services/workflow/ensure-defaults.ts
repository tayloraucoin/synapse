import { eq, sql } from "drizzle-orm";

import { workflowColumns, workflowViews } from "@syn/db";
import { WORKFLOW_STARTERS } from "@syn/constants";

import type { Tx } from "./cells";

/**
 * A person's two starting views, made the first time anything reads Workflow
 * (TD-41, UX §3.6) — the `ensureX` idiom, as `ensureReasonSet`.
 *
 * ONLY WHEN THERE IS NO VIEW AT ALL, archived or not: a person who archived
 * *Queue* does not find it back tomorrow.
 *
 * AT MOST ONE PAIR, EVEN UNDER A RACE. Two first requests (the page and a
 * prefetch) can both read "no views". A transaction-scoped advisory lock keyed
 * by the person serialises them; the second re-reads inside the lock, finds
 * the pair, and writes nothing. The lock is released when the transaction ends.
 *
 * Runs inside the caller's transaction, so the read that follows sees the rows.
 */
export async function ensureWorkflowDefaults(tx: Tx, userId: string): Promise<void> {
  const existing = await tx
    .select({ id: workflowViews.id })
    .from(workflowViews)
    .where(eq(workflowViews.userId, userId))
    .limit(1);
  if (existing.length > 0) return;

  await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${`workflow_defaults:${userId}`}))`);

  const recheck = await tx
    .select({ id: workflowViews.id })
    .from(workflowViews)
    .where(eq(workflowViews.userId, userId))
    .limit(1);
  if (recheck.length > 0) return;

  for (const [viewIndex, starter] of WORKFLOW_STARTERS.entries()) {
    const [view] = await tx
      .insert(workflowViews)
      .values({ userId, name: starter.name, sortOrder: viewIndex })
      .returning({ id: workflowViews.id });
    if (!view) continue;
    await tx.insert(workflowColumns).values(
      starter.columns.map((column, columnIndex) => ({
        userId,
        viewId: view.id,
        name: column.name,
        role: column.role,
        sortOrder: columnIndex,
      })),
    );
  }
}
