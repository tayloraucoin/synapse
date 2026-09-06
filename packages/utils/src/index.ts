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
  DAY_PART_HOURS,
  SOON_MINUTES,
  addDays,
  clockMinutes,
  closingThresholdMin,
  compareForTrim,
  dateKeyIn,
  dayModeFor,
  dayPartBoundaries,
  dayPartOf,
  dayPartSpans,
  dayStartInstant,
  dayWindow,
  daysBefore,
  deriveItemState,
  instantToWallClockMinutes,
  isOffSchedule,
  isSameOrBefore,
  mondayOf,
  resolveDayKey,
  wallClockToInstant,
  weekDates,
  weekKeyOf,
  weekdayForDayKey,
  weekdayIndex,
  zoneOffsetMinutes,
  type DayPart,
  type DayPartAnchors,
  type ItemStateInput,
  type PrioritySortable,
} from "./day";
export { AppError, isAppError } from "./errors";
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
export { stripStateFor, type StripSquare } from "./review/strip";
