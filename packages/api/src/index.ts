/**
 * @syn/api — tRPC routers, context, and services. THE typed contract the web
 * app and the future Expo app both consume.
 *
 * `AppRouter` is exported as a TYPE. That is the whole point: a client gets
 * end-to-end types from it without importing a byte of server code.
 */

export {
  createContext,
  type Context,
  type CreateContextInput,
} from "./context";
export { appRouter, createCaller, type AppRouter } from "./root";
export {
  readPreferences,
  updatePreferences,
  type UserPreferencesRow,
} from "./services/user/preferences";
export {
  isVapidConfigured,
  sendWebPush,
  WebPushGoneError,
  type WebPushPayload,
  type WebPushSubscriptionData,
} from "./services/notifications/web-push";
export { sendToUser, type FanOutResult } from "./services/notifications/fan-out";
/**
 * N4's *Later*. Exported because its one caller is a route handler serving the
 * service worker, which has no tRPC client — see `api/pwa/push/snooze`.
 */
export { snoozeDelivery } from "./services/notifications/deliver";
export {
  runScheduledJobs,
  SCHEDULED_JOBS,
  type ScheduledJob,
  type ScheduledJobResult,
} from "./services/jobs/run-scheduled-jobs";
