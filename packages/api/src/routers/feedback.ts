import { feedbackInput } from "@syn/validators";

import { sendFeedback } from "../services/system/send-feedback";
import { protectedProcedure, router } from "../trpc";

/**
 * SY-01's one write.
 *
 * A PROCEDURE RATHER THAN A SERVER ACTION. Conventions §3.5 lists "feedback
 * note" as a server-action candidate, and this is deliberately not one: the
 * future Expo app has the same About screen and the same message box, and a
 * server action is a web-only door. One procedure, two clients.
 *
 * It returns `{ sent: true }` and nothing else, because the table has no
 * `SELECT` policy — not even for the author — so there is nothing to read back.
 */
export const feedbackRouter = router({
  send: protectedProcedure
    .input(feedbackInput)
    .mutation(async ({ ctx, input }) =>
      sendFeedback(ctx.rls, ctx.authContext.userId, input),
    ),
});
