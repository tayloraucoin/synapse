import { TRPCError } from "@trpc/server";

import { resolveTodayFor } from "../services/day/today";
import { readSettingsCounts } from "../services/shell/settings-counts";
import { readShellStatus } from "../services/shell/status";
import { protectedProcedure, router } from "../trpc";

/**
 * The chrome's queries.
 *
 * `status` returns null rather than throwing NOT_FOUND when the shadow row is
 * missing: this is the shell, and every consumer already renders without it.
 * A thrown error here would take the page down with the chrome, which is
 * exactly backwards — the page is the thing the person came for.
 */
export const shellRouter = router({
  status: protectedProcedure.query(async ({ ctx }) =>
    readShellStatus(ctx.rls, ctx.authContext.userId),
  ),

  /**
   * ST-00's four counts in one round trip. This one DOES throw without a
   * shadow row: the settings index cannot render its own top card without an
   * account, so there is no partial answer worth returning.
   */
  settingsCounts: protectedProcedure.query(async ({ ctx }) => {
    const today = await resolveTodayFor(ctx.rls, ctx.authContext.userId);
    if (!today) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No account row." });
    }
    return readSettingsCounts(
      ctx.rls,
      ctx.authContext.userId,
      today.todayKey,
    );
  }),
});
