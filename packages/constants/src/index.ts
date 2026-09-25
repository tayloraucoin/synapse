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

export {
  BLOCK_KINDS,
  BLOCK_KIND_WORDS,
  DEFAULT_BLOCK_ORDER,
  PLACEABLE_KINDS,
  TRAINING_PLACEMENTS,
  type BlockKindValue,
  type TrainingPlacementValue,
} from "./block-kinds";
export { SITE_NAME } from "./brand";
export { CONTACT_EMAIL, VAPID_MAILTO_SUBJECT } from "./contact";
export {
  DEFAULT_REASONS,
  type DefaultReason,
  type DefaultReasonTier,
} from "./default-reasons";
export {
  DEFAULT_JOURNAL_PROMPTS,
  ORIENT_READBACK_KEYS,
  type DefaultJournalPrompt,
} from "./journal-prompts";
export {
  FIXTURE_KINDS,
  fixtureKindDefaults,
  type FixtureKindEntry,
  type FixtureKindValue,
} from "./fixture-kinds";
export {
  CAPACITY_MAX,
  CAPACITY_MIN,
  CATEGORY_NAME_MAX,
  CYCLE_EPOCH,
  DAY_PLAN_NAME_MAX,
  DEVICES_OFF_OFFSET_MIN,
  DISPLAY_NAME_MAX,
  DRAG_SNAP_MIN,
  DURATION_MAX,
  DURATION_MIN,
  FEEDBACK_MAX,
  FIXTURE_LOCATION_MAX,
  FIXTURE_TITLE_MAX,
  FOCUS_TITLE_MAX,
  GAP_MAX,
  HABIT_TITLE_MAX,
  HABIT_VERSIONS_MAX,
  INTENTION_MAX,
  JOURNAL_ANSWER_MAX,
  JOURNAL_PROMPT_MAX,
  JOURNAL_PROMPTS_MAX,
  JOURNAL_REMINDER_OFFSET_MIN,
  LATE_WAKE_OFFER_MIN,
  LINK_TITLE_MAX,
  LINK_URL_MAX,
  LONG_PRESS_MS,
  MISS_NOTE_MAX,
  MORNING_GRATITUDE_MAX,
  NOTE_MAX,
  ORIENT_PASSAGE_MAX,
  OTHER_REASON_MAX,
  PASSAGE_BODY_MAX,
  PASSAGE_IMAGES_MAX,
  PASSAGE_TAGS_MAX,
  PASSAGE_TAG_MAX,
  PASSAGE_TITLE_MAX,
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
  SKIP_LINE_WINDOW_DAYS,
  STEPPER_COMMIT_DEBOUNCE_MS,
  TEMPLATE_NAME_MAX,
  TRAVEL_MAX,
  VERSION_LABEL_MAX,
  VISUALISATION_MAX,
  WEEKLY_TARGET_MAX,
  WEEKLY_TARGET_MIN,
  WORKOUT_TITLE_MAX,
} from "./limits";
export {
  ADJUST_UNDO_WINDOW_MS,
  BUDGET_LINE_ANNOUNCE_MS,
  DRAG_LONG_PRESS_MS,
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
export { PLACED_ROW_ICONS, type PlacedRowKey } from "./placed-rows";
export { SCHEDULE_SHAPE_ICONS, type ScheduleShapeValue } from "./schedule-shapes";
export {
  ACTIVITY_GROUPS,
  MORNING_GROUPS,
  STARTER_LIBRARY,
  type ActivityGroup,
  type EmojiIcon,
  type MorningGroup,
  type StarterLibraryEntry,
} from "./starter-library";
export { EXAMPLE_DAY, type ExampleDaySpan } from "./example-day";
export {
  LINK_KINDS,
  SPOTIFY_LINK_HOSTS,
  SPOTIFY_LINK_SCHEME,
  type LinkKindValue,
} from "./link-hosts";
export {
  WORK_DAY_KINDS,
  type WorkDayKindEntry,
  type WorkDayKindValue,
} from "./work-day-kinds";
export {
  WORKOUT_TYPES,
  type WorkoutTypeEntry,
  type WorkoutTypeKey,
} from "./workout-types";
export {
  ASSET_BUCKET_BY_KIND,
  ASSET_FILE_NAME_PATTERN,
  EXPORTS_BUCKET,
  READABLE_ASSET_BUCKETS,
  buildAssetPath,
  exportStorageKey,
  exportStoragePath,
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
