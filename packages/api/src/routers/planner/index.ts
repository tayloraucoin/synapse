import { router } from "../../trpc";
import { mealTopicsRouter } from "./meal-topics";
import { plannerReads } from "./reads";
import { savedColoursRouter } from "./saved-colours";
import { plannerWrites } from "./writes";

/**
 * The planner's routers (USE-97 first): one sub-router per record, each in
 * its own file beside this one. Wave 3's other planner domains join here;
 * the day and week reads (USE-91) sit at the top, `planner.today` and
 * `planner.week`, and so do its writes (USE-92), `planner.createBlock` and
 * the rest, with `planner.undo`.
 */
export const plannerRouter = router({
  ...plannerReads,
  ...plannerWrites,
  mealTopics: mealTopicsRouter,
  savedColours: savedColoursRouter,
});
