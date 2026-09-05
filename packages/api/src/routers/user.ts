import { TRPCError } from "@trpc/server";

import { updatePreferencesInput } from "@syn/validators";

import {
  readPreferences,
  updatePreferences,
} from "../services/user/preferences";
import { protectedProcedure, router } from "../trpc";

/**
 * The account router.
 *
 * Both resolvers are boring on purpose (conventions §3.5): validate, call the
 * service, return. A resolver that is interesting has logic in the wrong
 * layer.
 */
export const userRouter = router({
  /**
   * The caller's own shadow row. NOT_FOUND means the `handle_new_user()`
   * trigger did not fire — impossible locally after
   * `ensureLocalUserFromSupabaseAuth`, and on a hosted tier a real fault worth
   * surfacing rather than papering over with an insert here.
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    const row = await readPreferences(ctx.rls, ctx.authContext.userId);
    if (!row) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No account row." });
    }
    return row;
  }),

  updatePreferences: protectedProcedure
    .input(updatePreferencesInput)
    .mutation(async ({ ctx, input }) => {
      const row = await updatePreferences(
        ctx.rls,
        ctx.authContext.userId,
        input,
      );
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No account row." });
      }
      return row;
    }),
});
