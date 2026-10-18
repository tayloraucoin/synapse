import { z } from "zod";
import { slotEventRecord } from "@syn/validators";
import { eventStore } from "../services/clock/event-store";
import { writeEvents } from "../services/clock/write-events";
import { protectedProcedure, router } from "../trpc";

/**
 * The clock (USE-94): slot events, append-only. `writeEvents` takes a batch
 * (one tap, or Step away's pauses) and lands it whole or not at all, in one
 * `rls.execute`; each event is parsed by the service, so a bad one is refused
 * "invalid" in the schema's words, as on fixtures. It hands back the batch's
 * rows as stored, by `at` then `received_at`.
 */

/** Step away writes one pause per running item; no day runs more. */
const MAX_BATCH = 100;

export const clockRouter = router({
  writeEvents: protectedProcedure
    .input(z.array(z.unknown()).max(MAX_BATCH))
    .output(z.array(slotEventRecord))
    .mutation(({ ctx, input }) => {
      const now = new Date();
      return ctx.rls.execute((tx) =>
        writeEvents(eventStore(tx, ctx.authContext.userId), input, now),
      );
    }),
});
