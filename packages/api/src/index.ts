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
