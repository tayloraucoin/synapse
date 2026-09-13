/**
 * User-directory enums — pgEnum types used only by `users` and its satellite
 * (drizzle-orm-conventions §3). The three below arrive with UX v1.1 migration
 * 0005 (DYN-3) and describe the shape of a person's week.
 *
 * SPELLING IS `@syn/types`'. Each is checked against its union by
 * `enumValues<Union>()`.
 */
import { pgEnum } from "drizzle-orm/pg-core";

import type { AnchorDirection, OverflowMode, ScheduleShape } from "@syn/types";

import { enumValues } from "../enum-values";

/** "When your morning runs long, what gives?" — UX v1.1 §3.3, §4.3. */
export const anchorDirectionEnum = pgEnum(
  "anchor_direction",
  enumValues<AnchorDirection>()(["work_waits", "routine_cut", "depends"]),
);

/** How the days that do not fit are handled — UX v1.1 §3.10. */
export const overflowModeEnum = pgEnum(
  "overflow_mode",
  enumValues<OverflowMode>()(["daily_menu", "variants", "auto_trim"]),
);

/** The archetype chosen on first run's first screen — UX v1.1 §4.1. */
export const scheduleShapeEnum = pgEnum(
  "schedule_shape",
  enumValues<ScheduleShape>()([
    "own_structure_dynamic",
    "consistent_shifts",
    "varying_shifts",
    "fluid",
  ]),
);
