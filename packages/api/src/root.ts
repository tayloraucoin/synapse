import { assetRouter } from "./routers/asset";
import { clientRouter } from "./routers/client";
import { connectionsRouter } from "./routers/connections";
import { dayRouter } from "./routers/day";
import { feedbackRouter } from "./routers/feedback";
import { googleRouter } from "./routers/google";
import { journalRouter } from "./routers/journal";
import { linearRouter } from "./routers/linear";
import { morningRouter } from "./routers/morning";
import { notificationRouter } from "./routers/notification";
import { plannerRouter } from "./routers/planner";
import { todoRouter } from "./routers/todo";
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
  client: clientRouter,
  connections: connectionsRouter,
  day: dayRouter,
  feedback: feedbackRouter,
  google: googleRouter,
  journal: journalRouter,
  linear: linearRouter,
  morning: morningRouter,
  notification: notificationRouter,
  planner: plannerRouter,
  todo: todoRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
