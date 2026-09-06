import { TRPCError } from "@trpc/server";

import { setAvatarInput, updatePreferencesInput } from "@syn/validators";

import {
  isOwnedAssetPath,
  readAvatar,
  removeAvatar,
  setAvatar,
} from "../services/user/avatar";
import { completeFirstRun } from "../services/user/complete-first-run";
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

  /**
   * FR-05's *Open today*. Idempotent, so a double submit is not an error.
   */
  completeFirstRun: protectedProcedure.mutation(async ({ ctx }) =>
    completeFirstRun(ctx.rls, ctx.authContext.userId),
  ),

  /** The account photo's stored path, or null. ST-01 and the header read it. */
  avatar: protectedProcedure.query(async ({ ctx }) =>
    readAvatar(ctx.rls, ctx.authContext.userId),
  ),

  /**
   * Point the account at an uploaded photo (official spec §9.8).
   *
   * The path is re-checked against the caller even though it was minted for
   * them: it came back through a browser, and BAD_REQUEST here is the
   * difference between "the server names every path" being a claim and being
   * true. RLS would stop the row write regardless; this stops a path that
   * would then be unreadable from ever being stored.
   */
  setAvatar: protectedProcedure
    .input(setAvatarInput)
    .mutation(async ({ ctx, input }) => {
      if (!isOwnedAssetPath(input.path, ctx.authContext.userId)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "That image path is not yours.",
        });
      }
      return setAvatar(ctx.rls, ctx.authContext.userId, input);
    }),

  /** Remove the photo and its bytes; the initials fallback returns. */
  removeAvatar: protectedProcedure.mutation(async ({ ctx }) => {
    await removeAvatar(ctx.rls, ctx.authContext.userId);
    return { removed: true };
  }),
});
