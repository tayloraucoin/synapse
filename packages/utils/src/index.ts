/**
 * @syn/utils — pure, framework-free helper functions grouped by domain file.
 *
 * Purity rule (conventions §4.10):
 * - Deterministic input → output only. No React, DB, I/O, env reads, or side effects.
 * - Group by domain (time.ts, string.ts, …). misc.ts / helpers.ts are banned.
 * - Domain-coupled logic belongs in its domain package (@syn/api), not here.
 *
 * For side-effectful dev logging, use @syn/observability instead.
 */

export {
  LATE_OFFER_THRESHOLD_MIN,
  SKIP_LINE_WINDOW_DAYS,
  SOON_MINUTES,
  addDays,
  adjustFingerprintOf,
  clockMinutes,
  closingThresholdMin,
  compareForTrim,
  computeAdjust,
  computeBudget,
  cycleIndex,
  dateKeyIn,
  dayModeFor,
  dayWindow,
  daysBefore,
  deriveItemState,
  fitToBudget,
  instantToWallClockMinutes,
  isLateOffer,
  isMoved,
  isOffSchedule,
  isSameOrBefore,
  mondayOf,
  resolveDayKey,
  shouldShowSkipLine,
  stackBlock,
  wallClockToInstant,
  weekDates,
  weekKeyOf,
  weekdayForDayKey,
  weekdayIndex,
  zoneOffsetMinutes,
  type AdjustHow,
  type AdjustInput,
  type AdjustItem,
  type AdjustPlacement,
  type AdjustResult,
  type AdjustWhat,
  type FitItem,
  type FitMode,
  type FitResult,
  type ItemStateInput,
  type PlacedItem,
  type StackInput,
  type StackItem,
  type StackResult,
  type PrioritySortable,
} from "./day";
export { AppError, isAppError } from "./errors";
export { deriveLinkKind } from "./link";
export { clamp, formatBytes, roundToStep } from "./number";
export { sanitizeNextPath } from "./path";
export {
  firstNonEmpty,
  getInitials,
  normalizeEmailInput,
  pluralize,
  slugify,
  truncate,
  withTrailingGap,
} from "./string";
export {
  clockFromMinutes,
  clockToMinutes,
  formatCalendarDay,
  formatClock,
  formatClockFromMinutes,
  formatElapsed,
  formatMinutesShort,
  formatWindow,
  minutesFromDayStart,
  toDateKey,
  zoneCityLabel,
  type CalendarDayStyle,
} from "./time";

/* ---- Workflow — today's lane order and the one *next* (TD-38) ---- */
export { orderGroupsForDay, resolveNext } from "./workflow";

/* ---- the resolver — official spec §7.3, §7.4 ---- */
export {
  bandOf,
  computeAdherence,
  creditFor,
  type AdherenceResult,
  type BandResult,
  type FormulaTermOut,
  type ItemVerdict,
  type PriorityBand,
  type ScoredItem,
  type ScoredMiss,
  type TradedUp,
} from "./review/adherence";
export {
  emptyStripWeek,
  stripStateFor,
  toStripWeek,
  type StripSquare,
} from "./review/strip";

/* ---- the clock, derived from slot events (USE-5) ---- */
export {
  EVENT_AHEAD_LIMIT_MS,
  checkEventTime,
  clockAt,
  deriveClock,
  type ClockEvent,
  type DayClock,
  type DeriveClockOptions,
  type EventTimeCheck,
  type SlotClock,
  type SlotClockState,
  type Span,
  type StepAwayHold,
} from "./planner";

/* ---- repeat rules, and the day read from them (USE-6) ---- */
export {
  occurrences,
  occursOn,
  parseRule,
  presetRule,
  readDay,
  type DayBlock,
  type DayBlockChange,
  type DayOccurrence,
  type DayRead,
  type DaySlot,
  type ParsedRule,
  type RepeatFreq,
  type RepeatPreset,
  type RepeatRule,
} from "./planner";

/* ---- a to-do's Repeats and its next due date (USE-28) ---- */
export {
  nextDue,
  nextTodoDue,
  ruleBody,
  ruleStart,
  todoRepeatOptions,
  type TodoRepeatOption,
} from "./planner";

/* ---- set-up arithmetic: new blocks, re-flow, the usual week (USE-33) ---- */
export {
  boundsEdge,
  dayStrip,
  defaultWeek,
  eventLanding,
  firstFreeTime,
  isOwnChange,
  overlaps,
  reflowItems,
  tappedSlot,
  usualChangeReach,
  usualDay,
  type BlockOverlap,
  type EventLanding,
  type Reflow,
  type ReflowItem,
  type StripPart,
} from "./planner";

/* ---- the room engine: Make room, A later start, a late wake (USE-35) ---- */
export {
  DAY_END_MIN,
  ITEM_GIVES_AT_MOST,
  LATER_START_OFFER_MIN,
  ORIENT_DEFAULT_MIN,
  applyChanges,
  cutAndSlide,
  findRoom,
  layoutFromWake,
  moveLater,
  offerLaterStart,
  planRoom,
  slideDay,
  type BlockMove,
  type CutSummary,
  type DayChange,
  type FindRoom,
  type MoveLaterSummary,
  type RoomBlock,
  type RoomCandidate,
  type RoomDay,
  type RoomEvent,
  type RoomLockReason,
  type RoomOccurrence,
  type RoomPlan,
  type RoomRefusal,
  type RoomResult,
  type RoomSlot,
  type RoomSummary,
  type RoomTake,
  type SetTimeSplit,
  type SlideSummary,
  type WakeSummary,
} from "./planner";

/* ---- work (USE-8) ---- */
export {
  compareInTiers,
  countSessions,
  firstDayWithRoom,
  fitInBlock,
  nextSession,
  pickWhileItFires,
  resolveWorkNext,
  tierRank,
  topMinutes,
  type BlockFit,
  type BlockFitDay,
  type BlockFitSlot,
  type BlockSpan,
  type NextSlot,
  type ReminderTodo,
  type SessionSlot,
  type WorkNext,
  type WorkSize,
  type WorkTier,
} from "./work";

/* ---- how a Linear status is drawn and what it does (USE-32) ---- */
export {
  statusEffect,
  statusFill,
  type LinearStateLike,
  type StatusEffect,
} from "./work";

/* ---- the to-do pool, the pull, and whose work it is (USE-9) ---- */
export {
  PULL_DEFAULT_LENGTH_MIN,
  isReturned,
  pullTodos,
  todoPool,
  type PullBlock,
  type PullSlot,
  type PullTodo,
  type PulledSlot,
  type TodoPoolEntry,
  type TodoPoolSlot,
  type TodoPoolTodo,
} from "./planner";
export { resolveClient, type ClientConnection, type ClientItem } from "./work";

/* ---- the icon picker's suggestions (USE-11) ---- */
export { suggestIcons, type IconSuggestEntry } from "./planner";

/* ---- where the day's first screen goes (USE-12) ---- */
export { resolveDayEntry, type DayEntry, type DayEntryRecord } from "./planner";

/* ---- Orient: last night read back (USE-13) ---- */
export {
  lastNightEntries,
  type LastNightEntry,
  type LastNightPrompt,
} from "./planner";

/* ---- Now: the active block and the current item (USE-16) ---- */
export {
  activeBlock,
  behindSince,
  blockEnding,
  nextBlock,
  currentItem,
  nextItem,
  type NowBlockSpan,
  type NowFocus,
  type NowItem,
} from "./planner";

/* ---- the To-dos tray: its rows and a reminder's words (USE-19) ---- */
export {
  carriedLabel,
  reminderBody,
  trayTodos,
  type TrayRow,
  type TrayTodo,
} from "./planner";

/* ---- Running: the countdown and the over bands (USE-23) ---- */
export {
  formatCountdown,
  overBand,
  runningBand,
  tookMinutes,
  type CountdownText,
  type OverBand,
} from "./planner";

/* ---- Review the day: the bullet grid's cells and "+n more" (USE-31) ---- */
export {
  bulletCellsPerLine,
  bulletGrid,
  bulletLines,
  type BulletGrid,
  type BulletGridOptions,
} from "./planner";

/* ---- Meal topics: where a topic opens on YouTube (USE-22) ---- */
export {
  mealTopicUrl,
  type MealTopicLink,
  type MealTopicLinkKind,
} from "./planner";

/* ---- Later from a closed block: where an item left goes (USE-25) ---- */
export { laterTarget, type LaterBlock, type LaterTarget } from "./planner";

/* ---- Close the day: the Tomorrow peek (USE-44) ---- */
export {
  tomorrowPeek,
  type PeekOccurrence,
  type TomorrowPeek,
} from "./planner";

/* ---- Schedule: each bullet's mark, the one edge, meetings as bands (USE-27) ---- */
export {
  placeEvents,
  scheduleMark,
  underWay,
  type BlockBands,
  type PlacedEvents,
  type PlaceEventsBlock,
  type PlaceEventsEvent,
  type ScheduleMark,
  type UnderWay,
  type UnderWaySpan,
} from "./planner";

/* ---- Ready, go: the welcome before Start (USE-43) ---- */
export {
  WELCOME_BAR_END_MIN,
  welcomeView,
  type WelcomeBlock,
  type WelcomeLayout,
  type WelcomeRow,
  type WelcomeSegment,
  type WelcomeView,
} from "./planner";
