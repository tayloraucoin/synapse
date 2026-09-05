import { readShellStatus } from "../services/shell/status";
import { protectedProcedure, router } from "../trpc";

/**
 * The chrome's one query.
 *
 * It returns null rather than throwing NOT_FOUND when the shadow row is
 * missing: this is the shell, and every consumer already renders without it.
 * A thrown error here would take the page down with the chrome, which is
 * exactly backwards — the page is the thing the person came for.
 */
export const shellRouter = router({
  status: protectedProcedure.query(async ({ ctx }) =>
    readShellStatus(ctx.rls, ctx.authContext.userId),
  ),
});
