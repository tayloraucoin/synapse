/**
 * View models — the shapes presentational composites receive. The caller maps
 * schema rows to these; `@syn/ui` never sees a DB row.
 *
 * Fixed by the v2 component handoff §3.5 (`types/view.ts`), which every §5
 * component entry references. Copied as written.
 *
 * These are not row types. A row type comes from `@syn/db`'s `$inferSelect`; a
 * view is what the API hands a component after the joins, the snapshots, and
 * the derivations (§6.2 now/soon, §6.3 off-schedule, §6.6 priority) are done.
 * They live here rather than in the app because the future Expo app renders
 * the same day from the same shapes.
 */

import type {
  CategoryKey,
  IconValue,
  ItemOrigin,
  ItemType,
  MissTier,
  Scheduling,
  TimeMode,
} from "./domain";
import type { ItemState, MultitaskPosition } from "./ui-state";

export interface CategoryView {
  key: CategoryKey;
  name: string;
}

export interface DayItemView {
  id: string;
  title: string;
  icon: IconValue;
  type: ItemType;
  category: CategoryView | null;
  timeMode: TimeMode;
  scheduledStart: Date | null;
  scheduledEnd: Date | null;
  originalScheduledStart: Date | null;
  durationMin: number | null;
  /** Resolved, 1–7 (official spec §6.6). */
  priority: number;
  scheduling: Scheduling;
  origin: ItemOrigin;
  /** "Thu" — set when `origin` is `carried`. */
  carriedFromLabel: string | null;
  doneAt: Date | null;
  quantityUnit: string | null;
  quantityValue: number | null;
  /** When active. */
  timerElapsedSec: number | null;
  state: ItemState;
  multitask: MultitaskPosition;
}

export interface SlotView {
  id: string;
  habitId: string;
  title: string;
  icon: IconValue;
  timeMode: TimeMode;
  /** "7:20" — already anchored and formatted. */
  startClock: string | null;
  endClock: string | null;
  durationMin: number;
  priority: number;
  overridden: boolean;
  scheduling: Scheduling;
  multitask: MultitaskPosition;
}

export interface HabitSummaryView {
  id: string;
  title: string;
  icon: IconValue;
  type: ItemType;
  category: CategoryView | null;
  durationMin: number | null;
  durationMax: number | null;
  lifePriority: number;
  isWakeAnchor: boolean;
  archived: boolean;
}

export interface TemplateSummaryView {
  id: string;
  name: string;
  itemCount: number;
  totalMin: number;
  /** Mon = 0. */
  typicalDays: ReadonlyArray<0 | 1 | 2 | 3 | 4 | 5 | 6>;
  weeklyTarget: number | null;
  usedThisWeek: number;
  archived: boolean;
}

export interface ReasonView {
  key: string;
  label: string;
  tier: MissTier;
  builtIn: boolean;
}
