/**
 * Plan-directory enums — pgEnum types used by two or more tables in `plan/`
 * and by no other directory (drizzle-orm-conventions §3).
 *
 * SPELLING IS `@syn/types`'. Each is checked against its union by
 * `enumValues<Union>()`, so a member added there and forgotten here is a type
 * error, not a value nobody can store.
 *
 * `block_flow`, `block_structure` and `slot_role` arrive with UX v1.1
 * migration `0004` (DYN-2); `day_shape`, `day_block_state` and
 * `training_placement` with `0005` (DYN-3).
 */
import { pgEnum } from "drizzle-orm/pg-core";

import type {
  BlockFlow,
  BlockStructure,
  DayBlockState,
  DayPlanState,
  DayShape,
  SlotRole,
  TrainingPlacement,
  WorkDayKind,
} from "@syn/types";

import { enumValues } from "../enum-values";

/*
 * UX v1.2 (RUN-1): the two below arrive with migration `0007` (RUN-2).
 * `work_day_kind` is on `templates` (TD-14); `day_plan_state` on `day_plans`
 * (TD-10). Nothing writes either before `0007`.
 */

/** A work-day type's kind — v1.2 §3.8. A label and a default glyph. `templates`. */
export const workDayKindEnum = pgEnum(
  "work_day_kind",
  enumValues<WorkDayKind>()(["remote", "coworking", "office", "other"]),
);

/** DayPlan.state — v1.2 §3.13. A plan left before the review stays a draft. `day_plans`. */
export const dayPlanStateEnum = pgEnum(
  "day_plan_state",
  enumValues<DayPlanState>()(["draft", "complete"]),
);

/** Day.shape — UX v1.1 §3.9. Unstructured is a first-class shape. `days`. */
export const dayShapeEnum = pgEnum(
  "day_shape",
  enumValues<DayShape>()(["structured", "unstructured"]),
);

/** DayBlock.state — UX v1.1 §11.7. `pooled` holds no items until the pick. `day_blocks`. */
export const dayBlockStateEnum = pgEnum(
  "day_block_state",
  enumValues<DayBlockState>()(["planned", "pooled", "set", "not_today"]),
);

/** DayBlock.placement — UX v1.1 §3.7; training and break only. `day_blocks`. */
export const trainingPlacementEnum = pgEnum(
  "training_placement",
  enumValues<TrainingPlacement>()([
    "before_morning",
    "after_morning",
    "inside_work",
    "after_work",
    "in_break",
  ]),
);

/**
 * Template.flow — UX v1.1 §3.3. Forward from wake (morning, work, activity);
 * backward to an anchor (prep to work start, wind-down to lights-out).
 * `templates`; read by `day_blocks`' materialiser.
 */
export const blockFlowEnum = pgEnum(
  "block_flow",
  enumValues<BlockFlow>()(["forward", "backward"]),
);

/** Template.structure — UX v1.1 §3.4. `templates`. */
export const blockStructureEnum = pgEnum(
  "block_structure",
  enumValues<BlockStructure>()(["stack", "opener_pool_closer"]),
);

/**
 * TemplateSlot.role — UX v1.1 §3.4. Meaningful only when the template's
 * `structure` is `opener_pool_closer`; `stack` otherwise. `template_slots`.
 */
export const slotRoleEnum = pgEnum(
  "slot_role",
  enumValues<SlotRole>()(["stack", "opener", "pool", "closer"]),
);
