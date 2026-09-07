import { assetRouter } from "./routers/asset";
import { categoryRouter } from "./routers/category";
import { dayRouter } from "./routers/day";
import { feedbackRouter } from "./routers/feedback";
import { habitRouter } from "./routers/habit";
import { itemRouter } from "./routers/item";
import { notificationRouter } from "./routers/notification";
import { reasonRouter } from "./routers/reason";
import { reviewRouter } from "./routers/review";
import { shellRouter } from "./routers/shell";
import { shiftRouter } from "./routers/shift";
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
  asset: assetRouter,
  category: categoryRouter,
  day: dayRouter,
  feedback: feedbackRouter,
  habit: habitRouter,
  item: itemRouter,
  notification: notificationRouter,
  reason: reasonRouter,
  review: reviewRouter,
  shell: shellRouter,
  shift: shiftRouter,
  template: templateRouter,
  timer: timerRouter,
  user: userRouter,
  week: weekRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
