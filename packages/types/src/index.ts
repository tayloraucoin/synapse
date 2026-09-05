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
  AssignmentState,
  CategoryKey,
  CompletionState,
  DayCloseReason,
  IconKind,
  IconValue,
  ItemOrigin,
  ItemType,
  MissResolvedBy,
  MissTier,
  Scheduling,
  TimeMode,
  TimerSessionSource,
  WeekPlanStatus,
} from "./domain/domain";

export type {
  DayMode,
  DecisionState,
  ItemState,
  Layout,
  MultitaskPosition,
  PermissionState,
  ReviewMode,
  SaveStatus,
  ShiftStep,
  StateWordKind,
  StatusLineVariant,
  StripState,
  TimerStatus,
} from "./domain/ui-state";

export type {
  CategoryView,
  DayItemView,
  HabitSummaryView,
  ReasonView,
  SlotView,
  TemplateSummaryView,
} from "./domain/view";
