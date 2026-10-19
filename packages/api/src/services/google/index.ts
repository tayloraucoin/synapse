/**
 * Google Calendar's service (USE-103): the connect, the sync, the switches
 * and the disconnect. Read-only: nothing is written to Google. What leaves
 * this folder is a URL, a cookie value, an outcome or a day's events; no
 * ciphertext, key or token is in any router's output.
 */
export { handleGoogleCallback, type GoogleCallbackOutcome } from "./callback";
export { toggleGoogleCalendar } from "./calendars";
export {
  disconnectGoogleAccount,
  finishGoogleConnect,
  readGoogleEventsFor,
  startGoogleConnect,
  syncGoogleNow,
} from "./entry";
export { googleEventsOn, type EnabledCalendar } from "./events";
export {
  GOOGLE_OAUTH_COOKIE,
  GOOGLE_OAUTH_COOKIE_OPTIONS,
} from "./oauth-cookie";
export { selectGoogleRows, type GoogleSnapshotRow } from "./read-events";
export { GoogleAccountMissing } from "./token-store";
