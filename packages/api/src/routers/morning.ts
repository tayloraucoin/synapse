import {
  dateKeyInput,
  linkFormSchema,
  morningLinesInput,
  passageFormSchema,
  readingRowInput,
  reorderReadingInput,
  turnOnInput,
} from "@syn/validators";
import {
  morningStore,
  readMorningDay,
  readReading,
  writeMorningLines,
} from "../services/morning/morning";
import {
  deleteOffRow,
  listReading,
  readingListStore,
  reorderReading,
  saveLink,
  savePassage,
  turnOff,
  turnOn,
} from "../services/morning/reading-list";
import { protectedProcedure, router } from "../trpc";

/**
 * Orient's morning (USE-96): the reading on its own, so it alone can wait
 * or fail (D-USE-63); the date's lines with last night; the lines' autosave.
 * Settings › Morning reading (USE-150): its one list and its writes on the
 * same passages and links, one procedure per verb with the kind as input.
 */
export const morningRouter = router({
  reading: protectedProcedure
    .input(dateKeyInput)
    .query(({ ctx, input }) =>
      ctx.rls.execute((tx) =>
        readReading(morningStore(tx, ctx.authContext.userId), input.dateKey),
      ),
    ),

  day: protectedProcedure
    .input(dateKeyInput)
    .query(({ ctx, input }) =>
      ctx.rls.execute((tx) =>
        readMorningDay(morningStore(tx, ctx.authContext.userId), input.dateKey),
      ),
    ),

  saveLines: protectedProcedure
    .input(morningLinesInput)
    .mutation(({ ctx, input }) =>
      ctx.rls.execute((tx) =>
        writeMorningLines(morningStore(tx, ctx.authContext.userId), input),
      ),
    ),

  list: protectedProcedure.query(({ ctx }) =>
    ctx.rls.execute((tx) =>
      listReading(readingListStore(tx, ctx.authContext.userId)),
    ),
  ),

  savePassage: protectedProcedure
    .input(passageFormSchema)
    .mutation(({ ctx, input }) =>
      ctx.rls.execute((tx) =>
        savePassage(readingListStore(tx, ctx.authContext.userId), input),
      ),
    ),

  saveLink: protectedProcedure
    .input(linkFormSchema)
    .mutation(({ ctx, input }) =>
      ctx.rls.execute((tx) =>
        saveLink(readingListStore(tx, ctx.authContext.userId), input),
      ),
    ),

  reorder: protectedProcedure
    .input(reorderReadingInput)
    .mutation(({ ctx, input }) =>
      ctx.rls.execute((tx) =>
        reorderReading(readingListStore(tx, ctx.authContext.userId), input),
      ),
    ),

  turnOff: protectedProcedure
    .input(readingRowInput)
    .mutation(({ ctx, input }) =>
      ctx.rls.execute((tx) =>
        turnOff(readingListStore(tx, ctx.authContext.userId), input),
      ),
    ),

  turnOn: protectedProcedure
    .input(turnOnInput)
    .mutation(({ ctx, input }) =>
      ctx.rls.execute((tx) =>
        turnOn(readingListStore(tx, ctx.authContext.userId), input),
      ),
    ),

  delete: protectedProcedure
    .input(readingRowInput)
    .mutation(({ ctx, input }) =>
      ctx.rls.execute((tx) =>
        deleteOffRow(readingListStore(tx, ctx.authContext.userId), input),
      ),
    ),
});
