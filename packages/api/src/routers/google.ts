import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  googleCalendarToggleInput,
  googleDayEvent,
  googleDisconnectInput,
  googleEventsInput,
} from "@syn/validators";
import {
  disconnectGoogleAccount,
  GoogleAccountMissing,
  readGoogleEventsFor,
  syncGoogleNow,
  toggleGoogleCalendar,
} from "../services/google";
import { protectedProcedure, router } from "../trpc";

/**
 * Google Calendar (USE-103), read-only. The connect is two route handlers
 * (`apps/web/app/api/integrations/google/`). `events` is the day column's
 * read: a date's events on the calendars that are on, its week synced
 * first when stale. Nothing here writes to Google.
 */
export const googleRouter = router({
  events: protectedProcedure
    .input(googleEventsInput)
    .output(z.array(googleDayEvent.strict()))
    .query(({ ctx, input }) =>
      readGoogleEventsFor(ctx.rls, ctx.authContext.userId, input.date),
    ),

  /** Sync now: the date's week, every account, stale or not. */
  sync: protectedProcedure
    .input(googleEventsInput)
    .output(z.object({ synced: z.literal(true) }))
    .mutation(async ({ ctx, input }) => {
      await syncGoogleNow(ctx.rls, ctx.authContext.userId, input.date);
      return { synced: true as const };
    }),

  toggleCalendar: protectedProcedure
    .input(googleCalendarToggleInput)
    .output(z.object({ enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // Another person's calendar reads as absent, never forbidden.
      if (!(await toggleGoogleCalendar(ctx.rls, input))) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return { enabled: input.enabled };
    }),

  disconnect: protectedProcedure
    .input(googleDisconnectInput)
    .output(z.object({ disconnected: z.literal(true) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await disconnectGoogleAccount(ctx.rls, input.accountId);
      } catch (error) {
        if (error instanceof GoogleAccountMissing) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        throw error;
      }
      return { disconnected: true as const };
    }),
});
