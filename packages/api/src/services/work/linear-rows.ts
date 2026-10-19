import { and, eq, inArray } from "drizzle-orm";
import { workItems, type RlsClient } from "@syn/db";

/**
 * The items already holding these Linear issues (USE-101), so From Linear's
 * write reads their sessions and refuses a date that holds one already.
 */
export async function selectLinkedItemIds(
  rls: RlsClient,
  userId: string,
  issueIds: readonly string[],
): Promise<string[]> {
  if (issueIds.length === 0) return [];
  const rows = await rls.execute((tx) =>
    tx
      .select({ id: workItems.id })
      .from(workItems)
      .where(
        and(
          eq(workItems.userId, userId),
          inArray(workItems.linearIssueId, [...issueIds]),
        ),
      ),
  );
  return rows.map((row) => row.id);
}
