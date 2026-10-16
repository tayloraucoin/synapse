import { assetRouter } from "./routers/asset";
import { dayRouter } from "./routers/day";
import { feedbackRouter } from "./routers/feedback";
import { journalRouter } from "./routers/journal";
import { morningRouter } from "./routers/morning";
import { notificationRouter } from "./routers/notification";
import { plannerRouter } from "./routers/planner";
import { userRouter } from "./routers/user";
import { createCallerFactory, router } from "./trpc";

/**
 * The app router — THE typed contract, and the reason tRPC is here at all:
 * `AppRouter` is a type, so the future Expo client gets the same contract
 * without a second schema to keep in step.
 *
 * Since the legacy move (USE-1) it mounts the account, notifications, assets
 * and feedback; the old domains' routers sit in `_legacy/`, unmounted. USE's
 * planner, work and integration routers mount here as they land.
 */
export const appRouter = router({
  asset: assetRouter,
  day: dayRouter,
  feedback: feedbackRouter,
  journal: journalRouter,
  morning: morningRouter,
  notification: notificationRouter,
  planner: plannerRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
