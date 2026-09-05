import { assetRouter } from "./routers/asset";
import { shellRouter } from "./routers/shell";
import { userRouter } from "./routers/user";
import { createCallerFactory, router } from "./trpc";

/**
 * The app router — THE typed contract, and the reason tRPC is here at all:
 * `AppRouter` is a type, so the future Expo client gets the same contract
 * without a second schema to keep in step.
 *
 * Three routers today. Habits, categories, templates, days, items, review, and
 * the scheduler are the feature epics' tech spec, mounted here as they land.
 */
export const appRouter = router({
  asset: assetRouter,
  shell: shellRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
