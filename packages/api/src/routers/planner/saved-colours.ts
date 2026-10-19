import { idInput, savedColourWriteInput } from "@syn/validators";

import {
  listSavedColours,
  removeSavedColour,
  savedColourStore,
  writeSavedColour,
} from "../../services/planner/saved-colours";
import { protectedProcedure, router } from "../../trpc";

/** Saved colours (USE-97): list, write (add or change) and remove. */
export const savedColoursRouter = router({
  list: protectedProcedure.query(({ ctx }) =>
    ctx.rls.execute((tx) =>
      listSavedColours(savedColourStore(tx, ctx.authContext.userId)),
    ),
  ),

  write: protectedProcedure
    .input(savedColourWriteInput)
    .mutation(({ ctx, input }) =>
      ctx.rls.execute((tx) =>
        writeSavedColour(savedColourStore(tx, ctx.authContext.userId), input),
      ),
    ),

  remove: protectedProcedure
    .input(idInput)
    .mutation(({ ctx, input }) =>
      ctx.rls.execute((tx) =>
        removeSavedColour(savedColourStore(tx, ctx.authContext.userId), input.id),
      ),
    ),
});
