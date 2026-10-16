import { journalGetInput, journalSaveInput } from "@syn/validators";

import {
  journalStore,
  readJournal,
  saveJournalAnswer,
} from "../services/journal/journal";
import { protectedProcedure, router } from "../trpc";

/**
 * Close the day's journal (USE-96): the date's entry with the prompts and
 * the quote, and one answer merged per save.
 */
export const journalRouter = router({
  read: protectedProcedure
    .input(journalGetInput)
    .query(({ ctx, input }) =>
      ctx.rls.execute((tx) =>
        readJournal(journalStore(tx, ctx.authContext.userId), input.date),
      ),
    ),

  save: protectedProcedure
    .input(journalSaveInput)
    .mutation(({ ctx, input }) =>
      ctx.rls.execute((tx) =>
        saveJournalAnswer(journalStore(tx, ctx.authContext.userId), input),
      ),
    ),
});
