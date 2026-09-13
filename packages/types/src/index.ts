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
  DayShape,
  ExportStatus,
  IconValue,
  ItemOrigin,
  ItemType,
  JournalPrompt,
  MissResolvedBy,
  MissTier,
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
  WorkDayMode,
  WorkDays,
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
  FixtureView,
  HabitSummaryView,
  JournalEntryView,
  QuickPickView,
  ReasonView,
  RemainingCount,
  SlotView,
  TemplateSummaryView,
  Weekday,
} from "./domain/view";
