import { router } from "../../trpc";
import { plannerDayWrites } from "./day-writes";
import { mealTopicsRouter } from "./meal-topics";
import { plannerReads } from "./reads";
import { savedColoursRouter } from "./saved-colours";
import { plannerWrites } from "./writes";

/**
 * The planner's routers (USE-97 first): one sub-router per record, each in
 * its own file beside this one. Wave 3's other planner domains join here;
 * the day and week reads (USE-91) sit at the top, `planner.today` and
 * `planner.week`, and so do its writes (USE-92), `planner.createBlock` and
 * the rest, with `planner.undo`, and the day-level four (USE-93),
 * `planner.copyDay` and the rest.
 */
export const plannerRouter = router({
  ...plannerReads,
  ...plannerWrites,
  ...plannerDayWrites,
  mealTopics: mealTopicsRouter,
  savedColours: savedColoursRouter,
});
