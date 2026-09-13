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
  DayShape,
  SlotRole,
  TrainingPlacement,
} from "@syn/types";

import { enumValues } from "../enum-values";

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
