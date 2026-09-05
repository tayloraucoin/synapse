import { assetRouter } from "./routers/asset";
import { categoryRouter } from "./routers/category";
import { habitRouter } from "./routers/habit";
import { shellRouter } from "./routers/shell";
import { templateRouter } from "./routers/template";
import { userRouter } from "./routers/user";
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
  habit: habitRouter,
  shell: shellRouter,
  template: templateRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
