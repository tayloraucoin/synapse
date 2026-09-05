/**
 * @syn/constants — shared runtime values (storage keys, limits, motion, brand).
 *
 * Constant-vs-type rule (conventions §4.8):
 * - If a value survives at runtime (you could console.log it) → it belongs here
 *   (or in a domain package for domain-coupled values).
 * - If it is erased at compile time (type, interface, type-level enum) → @syn/types.
 * - A const is never a type; a type/interface is never a constant.
 *
 * Naming: SCREAMING_SNAKE_CASE primitives; as const maps for grouped values.
 * Files: kebab-case (storage-keys.ts, user-images.ts, …).
 */

export { SITE_NAME } from "./brand";
export { CONTACT_EMAIL, VAPID_MAILTO_SUBJECT } from "./contact";
export {
  DEFAULT_REASONS,
  type DefaultReason,
  type DefaultReasonTier,
} from "./default-reasons";
export {
  CAPACITY_MAX,
  CAPACITY_MIN,
  CATEGORY_NAME_MAX,
  DISPLAY_NAME_MAX,
  DURATION_MAX,
  DURATION_MIN,
  FEEDBACK_MAX,
  HABIT_TITLE_MAX,
  MISS_NOTE_MAX,
  NOTE_MAX,
  OTHER_REASON_MAX,
  PASSWORD_MIN,
  PREFLIGHT_NOTE_MAX,
  PRIORITY_MAX,
  PRIORITY_MIN,
  QUANTITY_UNIT_MAX,
  REASON_LABEL_MAX,
  REFLECTION_AXES_MAX,
  REFLECTION_AXIS_MAX,
  SHIFT_MAX,
  SHIFT_MIN,
  TEMPLATE_NAME_MAX,
  TEMPLATE_OFFSET_MIN,
  WEEKLY_TARGET_MAX,
  WEEKLY_TARGET_MIN,
} from "./limits";
export {
  DURATION_SHEET_MS,
  DURATION_STATE_MS,
  SHIFT_UNDO_WINDOW_MS,
  UNDO_LONG_MS,
  UNDO_SHORT_MS,
} from "./motion";
export {
  NOTIFICATION_CATALOGUE,
  type NotificationCatalogueEntry,
} from "./notification-catalogue";
export { STARTER_HABITS, type StarterHabit } from "./starter-habits";
export {
  ASSET_BUCKET_BY_KIND,
  ASSET_FILE_NAME_PATTERN,
  READABLE_ASSET_BUCKETS,
  buildAssetPath,
  isSafeAssetFileName,
  parseAssetPath,
  toStorageKey,
  type AssetBucket,
  type AssetKind,
  type ParsedAssetPath,
} from "./storage-buckets";
export { STORAGE_KEYS } from "./storage-keys";
export {
  TIMEZONE_REGIONS,
  detectTimezone,
  type TimezoneOption,
  type TimezoneRegionGroup,
} from "./timezones";
export {
  USER_IMAGE_ACCEPT_ATTRIBUTE,
  USER_IMAGE_MAX_BYTES,
  USER_IMAGE_MIME_TYPES,
} from "./user-images";
