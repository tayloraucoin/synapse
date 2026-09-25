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
  AnchorDirection,
  BlockFlow,
  BlockKind,
  BlockStructure,
  CategoryKey,
  DayBlockState,
  DayPlanBreak,
  DayPlanState,
  DayPlanTraining,
  DayShape,
  FixtureKind,
  HabitVersion,
  IconValue,
  ItemOrigin,
  ItemType,
  LinkKind,
  JournalPrompt,
  MissTier,
  OverflowMode,
  Scheduling,
  SlotRole,
  TimeMode,
  TrainingPlacement,
  WorkDayKind,
  WorkoutLocation,
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

  /*
   * ---- UX v1.2 (§3.5, §3.7; TD-11, TD-12). Neutral until RUN-6 populates them.
   */
  /** The chosen version's key, snapshotted; null when hand-set or the habit has none. */
  versionKey: string | null;
  /** For a travel row (`origin: travel`): the workout it belongs beside. */
  parentItemId: string | null;
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

  /* ---- UX v1.2 (§3.5, §3.7; TD-11, TD-12) ---- */
  /** Up to three named lengths; the first is the default. Null when none. */
  versions: ReadonlyArray<HabitVersion> | null;
  /** Workouts only — the curated type's key, or null for *Other* / none. */
  workoutType: string | null;
  /** Workouts only — where it happens. */
  location: WorkoutLocation | null;
  /** Workouts only — the minutes there and back, and whether the day plans for them. */
  travel: { thereMin: number; backMin: number; planned: boolean } | null;
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

  /* ---- UX v1.2 (§3.8, §3.13; TD-10, TD-14) ---- */
  /** Work templates only — a work-day type's own hours, kind, anchor rule, glyph. */
  workDayType: WorkDayTypeView | null;
  /** The day plans that reference this template through any of their three list FKs. */
  usedBy: ReadonlyArray<{ id: string; name: string }>;
}

/** A work-day type — v1.2 §3.8, R32, TD-14: the four columns on a work template. */
export interface WorkDayTypeView {
  /** "9:00" — `anchor_time`, the type's *working by*; null = the profile's. */
  startClock: string | null;
  /** "17:30" — `work_end_time`; null = the profile's. */
  endClock: string | null;
  locationKind: WorkDayKind | null;
  /** Null = the profile's answer. */
  anchorDirection: AnchorDirection | null;
  icon: IconValue | null;
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

  /* ---- UX v1.2 (§3.6, R42) ---- */
  kind: FixtureKind;
  icon: IconValue;

  /* ---- UX v1.3 (§3.14, R51, TD-27; 0009, DAY-5) — a place and travel. ---- */
  /** Free text, ≤ 80; a fact the sheet shows — nothing reads it. */
  location: string | null;
  /** Minutes there and back and whether the day plans them; never added to `durationMin`. */
  travel: { thereMin: number; backMin: number; planned: boolean };
}

/*
 * ---- UX v1.2 — new view models (§3.12, §3.13; TD-10, TD-13, TD-15) ----
 */

/** One saved piece of morning reading — v1.2 §3.12. The person's own or chosen. */
export interface PassageView {
  id: string;
  title: string | null;
  /** Markdown, the storage form (TD-15); rendered through the editor's read-only mode. */
  bodyMd: string;
  /** Bucket-qualified paths (`passages/{user_id}/{file}`); the caller resolves URLs. */
  images: ReadonlyArray<string>;
  tags: ReadonlyArray<string>;
  sortOrder: number;
}

/**
 * A thing to open from the morning — UX v1.3 R53, §3.17, TD-28: a title and
 * a URL; the kind is derived from the host and stored. Opened, never fetched.
 */
export interface LinkView {
  id: string;
  title: string;
  url: string;
  kind: LinkKind;
  sortOrder: number;
}

/** One quote from the bank — v1.2 §3.12. Attributed; never keyed to the person. */
export interface QuoteView {
  id: string;
  text: string;
  attribution: string;
  source: string | null;
}

/** A day plan as the list and the week screen read it — v1.2 §4.13, §4.14. */
export interface DayPlanSummaryView {
  id: string;
  name: string;
  icon: IconValue | null;
  /** Mon = 0. A weekday belongs to at most one plan. */
  weekdays: ReadonlyArray<Weekday>;
  state: DayPlanState;
  /** The work-day type's name and glyph, or null for *No work on this day*. */
  work: { templateId: string; name: string; icon: IconValue | null } | null;
  /** "7:00" — the plan's own or the inherited value, resolved. */
  wakeClock: string | null;
  workStartClock: string | null;
  workEndClock: string | null;
  lightsOutClock: string | null;
  /** Each placed workout with its glyph, for the summary line. */
  training: ReadonlyArray<{ habitId: string; title: string; icon: IconValue; placement: TrainingPlacement }>;
  /** The three named lists, each with its length, or null when the plan has none. */
  gettingReady: { templateId: string; name: string; totalMin: number } | null;
  morning: { templateId: string; name: string; totalMin: number } | null;
  windDown: { templateId: string; name: string; totalMin: number } | null;
  /*
   * UX v1.3 §3.13, §11.2 (TD-25, TD-26; 0009, DAY-5): the after-work list
   * (*After work A*) and the free-time pool (*Evenings A*).
   */
  afterWork: { templateId: string; name: string; totalMin: number } | null;
  evenings: { templateId: string; name: string; totalMin: number } | null;
}

/**
 * A plan with work, for *Working today · as Day A* on a *Rarely* day (UX v1.3
 * §3.8, TD-23) — the plan's name and its own work template's hours.
 */
export interface WorkPlanView {
  planId: string;
  name: string;
  icon: IconValue | null;
  /** The plan's work template — what `day.applyWorkType` takes. */
  templateId: string;
  /** "9:00" — the template's *working by* and *until about*, displayed. */
  startClock: string | null;
  endClock: string | null;
}

/** A day plan as the builder edits it — v1.2 §3.13, TD-10: references and times, never copies. */
export interface DayPlanView extends DayPlanSummaryView {
  /** Null = inherit from the profile / the type; the summary above carries the resolved value. */
  wakeTime: string | null;
  workStartTime: string | null;
  workEndTime: string | null;
  lightsOutTime: string | null;
  devicesOffTime: string | null;
  trainingPlan: ReadonlyArray<DayPlanTraining>;
  breaks: ReadonlyArray<DayPlanBreak>;
  excludedFixtureIds: ReadonlyArray<string>;
  sortOrder: number;
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
