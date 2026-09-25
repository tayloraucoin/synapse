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
  formatWindow,
  minutesFromDayStart,
  toDateKey,
  zoneCityLabel,
  type CalendarDayStyle,
} from "./time";

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
