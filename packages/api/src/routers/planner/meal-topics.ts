import { idInput, mealTopicWriteInput } from "@syn/validators";

import {
  listMealTopics,
  mealTopicStore,
  removeMealTopic,
  writeMealTopic,
} from "../../services/planner/meal-topics";
import { protectedProcedure, router } from "../../trpc";

/** Meal topics (USE-97): list, write (add or change) and remove. */
export const mealTopicsRouter = router({
  list: protectedProcedure.query(({ ctx }) =>
    ctx.rls.execute((tx) =>
      listMealTopics(mealTopicStore(tx, ctx.authContext.userId)),
    ),
  ),

  write: protectedProcedure
    .input(mealTopicWriteInput)
    .mutation(({ ctx, input }) =>
      ctx.rls.execute((tx) =>
        writeMealTopic(mealTopicStore(tx, ctx.authContext.userId), input),
      ),
    ),

  remove: protectedProcedure
    .input(idInput)
    .mutation(({ ctx, input }) =>
      ctx.rls.execute((tx) =>
        removeMealTopic(mealTopicStore(tx, ctx.authContext.userId), input.id),
      ),
    ),
});
