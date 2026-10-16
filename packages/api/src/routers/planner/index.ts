import { router } from "../../trpc";
import { mealTopicsRouter } from "./meal-topics";
import { savedColoursRouter } from "./saved-colours";

/**
 * The planner's routers (USE-97 first): one sub-router per record, each in
 * its own file beside this one. Wave 3's other planner domains join here.
 */
export const plannerRouter = router({
  mealTopics: mealTopicsRouter,
  savedColours: savedColoursRouter,
});
