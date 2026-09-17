import { adjustRouter } from "./routers/adjust";
import { assetRouter } from "./routers/asset";
import { categoryRouter } from "./routers/category";
import { dayRouter } from "./routers/day";
import { dayPlanRouter } from "./routers/day-plan";
import { feedbackRouter } from "./routers/feedback";
import { fixtureRouter } from "./routers/fixture";
import { habitRouter } from "./routers/habit";
import { itemRouter } from "./routers/item";
import { journalRouter } from "./routers/journal";
import { notificationRouter } from "./routers/notification";
import { passageRouter } from "./routers/passage";
import { quoteRouter } from "./routers/quote";
import { reasonRouter } from "./routers/reason";
import { reviewRouter } from "./routers/review";
import { shellRouter } from "./routers/shell";
import { templateRouter } from "./routers/template";
import { timerRouter } from "./routers/timer";
import { userRouter } from "./routers/user";
import { weekRouter } from "./routers/week";
import { createCallerFactory, router } from "./trpc";

/**
 * The app router — THE typed contract, and the reason tRPC is here at all:
 * `AppRouter` is a type, so the future Expo client gets the same contract
 * without a second schema to keep in step.
 *
 * Templates, days, items, review, and the scheduler are the remaining feature
 * epics' tech spec, mounted here as they land.
 */
export const appRouter = router({
  adjust: adjustRouter,
  asset: assetRouter,
  category: categoryRouter,
  day: dayRouter,
  dayPlan: dayPlanRouter,
  feedback: feedbackRouter,
  fixture: fixtureRouter,
  habit: habitRouter,
  item: itemRouter,
  journal: journalRouter,
  notification: notificationRouter,
  passage: passageRouter,
  quote: quoteRouter,
  reason: reasonRouter,
  review: reviewRouter,
  shell: shellRouter,
  template: templateRouter,
  timer: timerRouter,
  user: userRouter,
  week: weekRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
