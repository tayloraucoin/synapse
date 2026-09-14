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
  BlockFlow,
  BlockKind,
  BlockStructure,
  CategoryKey,
  DayBlockState,
  DayShape,
  IconValue,
  ItemOrigin,
  ItemType,
  JournalPrompt,
  MissTier,
  OverflowMode,
  Scheduling,
  SlotRole,
  TimeMode,
  TrainingPlacement,
} from "./domain";
import type { ItemState, MultitaskPosition } from "./ui-state";

/** Mon = 0 … Sun = 6, as `typical_days` and `fixtures.weekdays` store it. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface CategoryView {
  key: CategoryKey;
  name: string;
}

export interface DayItemView {
  id: string;
  /**
   * The library entry this came from, or null for a *Just a title* one-off.
   * WK-03's edit needs it to reopen the sheet on the habit that was chosen;
   * the title alone cannot distinguish a habit from a title someone typed.
   */
  habitId: string | null;
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

  /*
   * ---- UX v1.1 (§10.1, §11.8). Every field below has a neutral value the
   * v1.0 mappers supply until DYN-5 populates it from `day_blocks`.
   */
  /** The block this item sits in; null only for rows written before v1.1. */
  dayBlockId: string | null;
  /** The block's kind, for the row's caption and the sheet's copy. */
  blockKind: BlockKind | null;
  /** A pin — the anchor glyph; the stack flows around it (R3). */
  pinned: boolean;
  /** Transition before this item, snapshotted from the slot; 0 when none. */
  gapBeforeMin: number;
  /**
   * The *one of* group this item belongs to, if any — the chosen member is the
   * one on the day; the other is named so the sheet can offer the swap.
   */
  alternates: {
    id: string;
    chosen: boolean;
    otherTitle: string;
    otherDurationMin: number;
  } | null;
}

export interface SlotView {
  id: string;
  habitId: string;
  title: string;
  icon: IconValue;
  timeMode: TimeMode;
  /**
   * "7:20" — already anchored and formatted. Under v1.1 it is DERIVED by
   * `stackBlock` in the mapper, once per template (TD-4); never stored.
   */
  startClock: string | null;
  endClock: string | null;
  durationMin: number;
  priority: number;
  overridden: boolean;
  scheduling: Scheduling;
  multitask: MultitaskPosition;

  /* ---- UX v1.1 (§3.2, §3.4, §3.5, §11.5) ---- */
  /** Transition before this slot; 0 when it follows the previous one directly. */
  gapBeforeMin: number;
  /** "8:00" when the slot is pinned to a clock time; the stack flows around it. */
  pinnedClock: string | null;
  role: SlotRole;
  /** The *one of* group, with the other member named for the two-tab block. */
  alternates: {
    group: string;
    isDefault: boolean;
    otherTitle: string;
    otherDurationMin: number;
  } | null;
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
  archived: boolean;

  /* ---- UX v1.1 (§11.3) ---- */
  /** The block this habit lives in by default; null = anywhere. */
  blockKind: BlockKind | null;
  /** Workouts and focuses only — the rotation's weekly count. */
  weeklyTarget: number | null;
  /** Workouts and focuses only — the days it usually falls on. Mon = 0. */
  typicalDays: ReadonlyArray<Weekday> | null;
}

export interface TemplateSummaryView {
  id: string;
  name: string;
  itemCount: number;
  totalMin: number;
  /** Mon = 0. */
  typicalDays: ReadonlyArray<Weekday>;
  weeklyTarget: number | null;
  usedThisWeek: number;
  archived: boolean;

  /* ---- UX v1.1 (§11.4, TD-1): a template is a block ---- */
  kind: BlockKind;
  flow: BlockFlow;
  structure: BlockStructure;
}

/*
 * ---- UX v1.1 — new view models ----
 */

/** One block on one day — v1.1 §11.7, TD-2. The Today tab's section, the Schedule's band. */
export interface DayBlockView {
  id: string;
  kind: BlockKind;
  /** The template's name snapshot, or null for an unstructured day's blocks. */
  name: string | null;
  templateId: string | null;
  state: DayBlockState;
  /** "7:03" / "8:11", in the day's zone; null before the block has times. */
  startLabel: string | null;
  endLabel: string | null;
  /** Minutes from the day's start — the List's arithmetic. */
  startMin: number | null;
  endMin: number | null;
  /** The instants — the Schedule measures its bands from these (v1.1 §6.5, DYN-16). */
  startAt: Date | null;
  endAt: Date | null;
  /** Training and break only. */
  placement: TrainingPlacement | null;
  items: DayItemView[];
  /** True on both halves of a work block split around training (§3.7). */
  split: boolean;
}

/** A weekday fixture — v1.1 §3.6, TD-8. */
export interface FixtureView {
  id: string;
  title: string;
  weekdays: ReadonlyArray<Weekday>;
  /** "9:30". */
  atClock: string;
  durationMin: number;
  blockKind: BlockKind;
  scheduling: Scheduling;
  habitId: string | null;
  archived: boolean;
}

/** A routine variant or a focus/workout with what is left of its weekly count. */
export interface RemainingCount {
  remaining: number;
}

/**
 * The quick-pick — v1.1 §5.3. One section per open question, each already
 * answered with today's default; a section is null when the day has no
 * question of that kind.
 */
export interface QuickPickView {
  date: string;
  /** Yesterday's wind-down items still to confirm (§7.3); empty when none. */
  lastNight: DayItemView[];
  /** *Working today?* on a *sometimes* day; null otherwise. */
  shape: { asked: boolean; default: DayShape } | null;
  routine: {
    mode: OverflowMode;
    /** The daily menu — present when `mode` is `daily_menu`. */
    menu?: {
      items: Array<HabitSummaryView & { durationMin: number; ticked: boolean }>;
      availableMin: number;
    };
    /** The variant picker — present when `mode` is `variants`. */
    variants?: Array<TemplateSummaryView & RemainingCount>;
    /** The week's assignment, if any. */
    assignedId: string | null;
  } | null;
  prep: {
    alternates: Array<{
      groupId: string;
      members: Array<{
        slotId: string;
        title: string;
        durationMin: number;
        isDefault: boolean;
      }>;
      /** The member's `slotId` chosen today; defaults to the last choice. */
      chosen: string;
    }>;
  } | null;
  training: {
    /** Today's workout by its typical day, or null when none falls today. */
    todays: HabitSummaryView | null;
    swaps: Array<
      HabitSummaryView & RemainingCount & { tradesWithDay: string | null }
    >;
    placements: ReadonlyArray<TrainingPlacement>;
    lastPlacement: TrainingPlacement | null;
  } | null;
  work: {
    focuses: Array<HabitSummaryView & RemainingCount>;
    assignedId: string | null;
    /** True under *depends on the day* — the pick asks what gives. */
    askAnchor: boolean;
  } | null;
  /** Read-only, under *Already in place*. */
  fixtures: DayItemView[];
  /** The work anchor, and whether it is hard today; null on an unstructured day. */
  anchor: { clock: string; isHard: boolean } | null;
}

/** One day's journal, with the prompts it was written against — v1.1 §7.2. */
export interface JournalEntryView {
  date: string;
  answers: Record<string, string>;
  prompts: ReadonlyArray<JournalPrompt>;
}

export interface ReasonView {
  key: string;
  label: string;
  tier: MissTier;
  builtIn: boolean;
}
