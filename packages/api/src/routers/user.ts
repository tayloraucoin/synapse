import { TRPCError } from "@trpc/server";

import {
  deleteAccountInput,
  exportDownloadInput,
  setAvatarInput,
  updatePreferencesInput,
} from "@syn/validators";

import {
  isOwnedAssetPath,
  readAvatar,
  removeAvatar,
  setAvatar,
} from "../services/user/avatar";
import { completeFirstRun } from "../services/user/complete-first-run";
import { deleteAccount } from "../services/user/delete-account";
import {
  readPreferences,
  updatePreferences,
} from "../services/user/preferences";
import {
  exportDownloadUrl,
  readLatestExport,
  requestExport,
} from "../services/user/request-export";
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

  /* ------------------------------------------------------- ST-10, ST-10a -- */

  /** The newest export row, or null. A `ready` row past its expiry reads as expired. */
  exportStatus: protectedProcedure.query(async ({ ctx }) =>
    readLatestExport(ctx.rls, ctx.authContext.userId),
  ),

  /**
   * *Export everything*. Builds and uploads inside the request, and returns
   * the row in whatever state it ended in — `ready` or `failed`, never a
   * thrown error, because the screen has a sentence for a failure and no
   * sentence for a stack trace.
   */
  requestExport: protectedProcedure.mutation(async ({ ctx }) =>
    requestExport(ctx.rls, ctx.authContext.userId),
  ),

  /**
   * A fresh signed URL for one export. Null when the row is not ready, has
   * expired, or is not the caller's — one answer for all three, because
   * telling them apart would tell a caller whether an id exists.
   */
  exportDownloadUrl: protectedProcedure
    .input(exportDownloadInput)
    .mutation(async ({ ctx, input }) => ({
      url: await exportDownloadUrl(ctx.rls, ctx.authContext.userId, input.id),
    })),

  /**
   * ST-10a. **There is no id parameter** — it deletes the caller, and an id
   * here is how one account ends up deleting another. The typed word is
   * re-checked by the schema; the dialog's disabled button is a courtesy, not
   * a control.
   *
   * The session is ended by the CLIENT posting to `/logout` afterwards: a tRPC
   * mutation cannot clear cookies through the fetch adapter, and `/logout`
   * succeeds whether or not the user still exists.
   */
  deleteAccount: protectedProcedure
    .input(deleteAccountInput)
    .mutation(async ({ ctx }) => deleteAccount(ctx.authContext.userId)),
});
