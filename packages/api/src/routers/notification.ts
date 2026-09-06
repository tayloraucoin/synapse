import { and, eq, isNull } from "drizzle-orm";

import { webPushSubscriptions } from "@syn/db";
import { setNotificationPrefInput } from "@syn/validators";

import {
  listNotificationPrefs,
  setNotificationPref,
} from "../services/notifications/list-prefs";
import { protectedProcedure, router } from "../trpc";

/**
 * ST-07's preferences.
 *
 * NOTHING HERE SENDS ANYTHING. A preference is a row; USE-8 registers the jobs
 * that read these rows and builds the payloads. Keeping the two apart is what
 * lets a person turn every reminder off before a single one has ever been
 * written.
 */
export const notificationRouter = router({
  prefs: protectedProcedure.query(async ({ ctx }) =>
    listNotificationPrefs(ctx.rls, ctx.authContext.userId),
  ),

  setPref: protectedProcedure
    .input(setNotificationPrefInput)
    .mutation(async ({ ctx, input }) =>
      setNotificationPref(ctx.rls, ctx.authContext.userId, input),
    ),

  /**
   * Whether this account has a live push subscription anywhere.
   *
   * The SERVER half of the permission picture, and the only half it has. Which
   * state to show is a question about THIS device — its `Notification`
   * permission, whether it supports push, whether it is iOS outside a home
   * screen — and none of that is knowable here. The client computes the state
   * and uses this only to know whether some device is already subscribed.
   */
  hasSubscription: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.rls.execute((tx) =>
      tx
        .select({ id: webPushSubscriptions.id })
        .from(webPushSubscriptions)
        .where(
          and(
            eq(webPushSubscriptions.userId, ctx.authContext.userId),
            isNull(webPushSubscriptions.revokedAt),
          ),
        )
        .limit(1),
    );
    return rows.length > 0;
  }),
});
