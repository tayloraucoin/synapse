/**
 * View models — the shapes a surface receives, already resolved.
 *
 * These are not row types. A row type comes from `@syn/db`'s `$inferSelect`; a
 * view is what the API hands a component after the joins, the snapshots, and
 * the derivations (§6.2 now/soon, §6.3 off-schedule, §6.6 priority) are done.
 * They live here rather than in the app because the future Expo app renders the
 * same day from the same shapes.
 *
 * Sources: official UX spec §3, §5.9, §6; Epic 1 LB-01/TP-01/ST-06; Epic 2
 * LS-01; Epic 3 WR-01.
 */

import type {
  AssignmentState,
  CategoryKey,
  CompletionState,
  IconValue,
  ItemOrigin,
  ItemType,
  MissTier,
  Scheduling,
  TimeMode,
} from "./domain";
import type {
  ItemState,
  MultitaskPosition,
  StateWordKind,
  TimerStatus,
} from "./ui-state";

/** A category as any chip, edge, or picker renders it — official spec §3.2. */
export interface CategoryView {
  id: string;
  name: string;
  colorKey: CategoryKey;
}

/**
 * One row of the day, on either tab — Epic 2 LS-01 and SC-01 read the same
 * shape. `state` and `stateWord` are derived per §6.2/§6.3 and are the only
 * things that change minute to minute.
 */
export interface DayItemView {
  id: string;
  habitId: string | null;
  title: string;
  icon: IconValue;
  type: ItemType;
  category: CategoryView | null;

  timeMode: TimeMode;
  scheduling: Scheduling;
  /** Absolute, already shifted. Null for unscheduled items. */
  scheduledStart: string | null;
  scheduledEnd: string | null;
  /** Never moves after materialisation — the ghost renders here (§5.3). */
  originalScheduledStart: string | null;
  durationMin: number;
  priority: number;

  assignmentState: AssignmentState;
  completionState: CompletionState;
  state: ItemState;
  stateWord: StateWordKind | null;
  /** Derived: `done_at` outside the original window (§6.3). */
  isOffSchedule: boolean;
  doneAt: string | null;

  multitaskId: string | null;
  multitaskPosition: MultitaskPosition;

  quantityUnit: string | null;
  quantityValue: number | null;
  reflectionAxes: string[];

  timerStatus: TimerStatus;
  elapsedSeconds: number;

  origin: ItemOrigin;
  /** Set when `origin` is `carried_from` — the weekday the row reads as. */
  carriedFromLabel: string | null;

  missTier: MissTier | null;
  missReasonLabel: string | null;
}

/** One slot inside a template, as the template editor renders it — §3.5. */
export interface SlotView {
  id: string;
  habitId: string;
  title: string;
  icon: IconValue;
  type: ItemType;
  category: CategoryView | null;

  timeMode: TimeMode;
  /** Minutes from the template anchor, so the whole template can move. */
  offsetStart: number | null;
  offsetEnd: number | null;
  durationMin: number;
  /** Resolved: `priority_override ?? habit.life_priority` (§6.6). */
  priority: number;
  priorityOverride: number | null;
  scheduling: Scheduling;
  multitaskGroup: string | null;
  sortOrder: number;
}

/** A library row — Epic 1 LB-01. */
export interface HabitSummaryView {
  id: string;
  title: string;
  icon: IconValue;
  type: ItemType;
  category: CategoryView | null;
  durationMinMin: number | null;
  durationMinMax: number | null;
  lifePriority: number;
  isWakeAnchor: boolean;
  archivedAt: string | null;
  /** How many templates slot this habit — the library's usage line. */
  usedInTemplateCount: number;
}

/** A template row — Epic 1 TP-01 and the week build's picker. */
export interface TemplateSummaryView {
  id: string;
  name: string;
  slotCount: number;
  /** Nullable hint shown during the week build; never a mechanic (§3.4). */
  typicalDays: number[] | null;
  weeklyTarget: number | null;
  /** Applications so far in the week being built, against `weeklyTarget`. */
  usedThisWeek: number;
  anchorTime: string;
  archivedAt: string | null;
}

/** One row of the person's reason set — official spec §3.10, Epic 1 ST-06. */
export interface ReasonView {
  key: string;
  label: string;
  defaultTier: MissTier;
  /** False for the seven defaults; true for reasons the person added. */
  isCustom: boolean;
}
