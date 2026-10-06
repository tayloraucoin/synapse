/**
 * @syn/types — pure TypeScript types, interfaces, and type-level enums.
 *
 * Zero runtime. Zero deps. Platform-agnostic (no next/*, DOM, or Node-only imports).
 *
 * Membership test (conventions §4.7):
 * - Qualifies: shape used by 2+ packages/apps, not derivable from @syn/db $inferSelect
 *   or z.infer of a @syn/validators schema.
 * - Does not qualify: component prop types (inline in .tsx), single-feature view-models
 *   (*.types.ts), DB row types (@syn/db), z.infer types (export from @syn/validators).
 *
 * Naming: PascalCase, no I/T prefixes. Schema-shaped unions keep the schema's
 * spelling; presentational unions are kebab-case (v2 handoff §3.2 R8).
 */

export type { AuthContext, AuthContextRole } from "./auth-context";

export type {
  AnchorDirection,
  AssignmentState,
  BlockFlow,
  BlockKind,
  BlockStructure,
  CategoryKey,
  CompletionState,
  DayBlockState,
  DayCloseReason,
  DayPlanBreak,
  DayPlanState,
  DayPlanTraining,
  DayShape,
  ExportStatus,
  FixtureKind,
  HabitVersion,
  IconValue,
  ItemOrigin,
  ItemType,
  JournalPrompt,
  LinkKind,
  MissResolvedBy,
  MissTier,
  MorningMode,
  NotificationKind,
  OverflowMode,
  ScheduleShape,
  Scheduling,
  ShiftKind,
  SlotRole,
  TimeMode,
  TimerSessionSource,
  TrainingPlacement,
  WeekPlanStatus,
  WokeAtSource,
  WorkDayKind,
  WorkDayMode,
  WorkDays,
  WorkoutLocation,
} from "./domain/domain";

export type {
  AdjustEntry,
  AdjustStep,
  BudgetState,
  DayMode,
  DecisionState,
  DragState,
  ItemState,
  Layout,
  MultitaskPosition,
  PermissionState,
  QuickPickSectionKind,
  ReviewMode,
  SaveStatus,
  ShiftStep,
  StateWordKind,
  StatusLineVariant,
  StripState,
  StripWeek,
  TimerStatus,
} from "./domain/ui-state";

export type {
  CategoryView,
  DayBlockView,
  DayItemView,
  DayPlanSummaryView,
  DayPlanView,
  FixtureView,
  HabitSummaryView,
  JournalEntryView,
  LinkView,
  PassageView,
  QuickPickView,
  QuoteView,
  ReasonView,
  RemainingCount,
  SlotView,
  TemplateSummaryView,
  Weekday,
  WorkDayTypeView,
  WorkPlanView,
} from "./domain/view";
