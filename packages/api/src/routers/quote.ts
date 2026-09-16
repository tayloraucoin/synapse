import { TRPCError } from "@trpc/server";

import { orientInput } from "@syn/validators";

import { resolveTodayFor } from "../services/day/today";
import { readPreferences } from "../services/user/preferences";
import { quoteForDate } from "../services/system/quotes";
import { protectedProcedure, router } from "../trpc";

/**
 * The quote bank's read (UX v1.2 §3.12, TD-13). The bank is app content
 * under `catalogReadPolicies`; `today` honours the person's opt-in here and
 * returns null otherwise — the frame's `day.orient` does the same in one
 * read, so this router exists for the opt-in screen's preview and for
 * RUN-14's admin list to sit beside. No write lives here in RUN-4.
 */
export const quoteRouter = router({
  today: protectedProcedure.input(orientInput).query(async ({ ctx, input }) => {
    const prefs = await readPreferences(ctx.rls, ctx.authContext.userId);
    if (!prefs) throw new TRPCError({ code: "NOT_FOUND", message: "No account row." });
    if (!prefs.quotesOptIn) return null;

    const today = await resolveTodayFor(ctx.rls, ctx.authContext.userId);
    if (!today) throw new TRPCError({ code: "NOT_FOUND", message: "No account row." });
    return quoteForDate(ctx.rls, input?.date ?? today.todayKey);
  }),
});
