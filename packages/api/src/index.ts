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
export { refuse, refusalReason, RefusalCause, withRefusal } from "./errors";
export {
  readPreferences,
  updatePreferences,
  type UserPreferencesRow,
} from "./services/user/preferences";
/* USE-97: the rules over a store, so the web app's tests prove them in memory. */
export {
  listSavedColours,
  removeSavedColour,
  writeSavedColour,
  type SavedColourStore,
} from "./services/planner/saved-colours";
export {
  listMealTopics,
  removeMealTopic,
  writeMealTopic,
  type MealTopicStore,
  type MealTopicValues,
} from "./services/planner/meal-topics";
/* USE-96: the morning and evening loop's rules over a store, proven in memory. */
export {
  readReadiedBefore,
  readyGo,
  stampOrient,
  type DayRecordRow,
  type DayRecordStore,
} from "./services/day/day-records";
export {
  readJournal,
  saveJournalAnswer,
  type JournalStore,
} from "./services/journal/journal";
export {
  readMorningDay,
  readReading,
  writeMorningLines,
  type MorningStore,
} from "./services/morning/morning";
export {
  isVapidConfigured,
  sendWebPush,
  WebPushGoneError,
  type WebPushPayload,
  type WebPushSubscriptionData,
} from "./services/notifications/web-push";
export {
  sendToUser,
  type FanOutResult,
} from "./services/notifications/fan-out";
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
/**
 * Linear connect's two route handlers (USE-100): only a route can take the
 * provider's redirect. No key, ciphertext or token crosses this export.
 */
export {
  finishLinearConnect,
  handleLinearCallback,
  isLocalPath,
  LINEAR_OAUTH_COOKIE,
  LINEAR_OAUTH_COOKIE_OPTIONS,
  startLinearConnect,
  type LinearCallbackOutcome,
} from "./services/linear";
/**
 * Google Calendar connect's two route handlers (USE-103), read-only. No key,
 * ciphertext or token crosses this export.
 */
export {
  finishGoogleConnect,
  GOOGLE_OAUTH_COOKIE,
  GOOGLE_OAUTH_COOKIE_OPTIONS,
  handleGoogleCallback,
  startGoogleConnect,
  type GoogleCallbackOutcome,
} from "./services/google";
