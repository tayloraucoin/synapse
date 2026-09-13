/**
 * Root enums — pgEnum types shared across 2+ schema directories.
 *
 * Colocation rule (drizzle-orm-conventions §3):
 * - One table only → define in that table's file.
 * - 2+ tables in one directory → that directory's `enums.ts`.
 * - 2+ directories → this file.
 *
 * SPELLING IS `@syn/types`'. Every value below is checked against the schema
 * union in `packages/types/src/domain/domain.ts` by `enumValues<Union>()`, so a
 * typo or an omission is a type error rather than a value the database stores
 * and no component can ever match (SET-1 non-negotiable).
 */
import { pgEnum } from "drizzle-orm/pg-core";

import type {
  BlockKind,
  CategoryKey,
  ItemType,
  MissTier,
  Scheduling,
  TimeMode,
} from "@syn/types";

import { enumValues } from "./enum-values";

/**
 * Habit.type / DayItem.type — official spec §3.3. `habits`, `day_items`.
 *
 * `workout` is UX v1.1 §11.3 (TD-3). The TypeScript side moved in DYN-1 to
 * keep the workspace building; the `ALTER TYPE … ADD VALUE` ships in
 * migration `0004` (DYN-2). Nothing writes the value before then.
 */
export const itemTypeEnum = pgEnum(
  "item_type",
  enumValues<ItemType>()(["habit", "task_appointment", "deep_work", "workout"]),
);

/**
 * Block.kind — UX v1.1 §3.1, the eight kinds. `templates` and `habits` (0004),
 * then `fixtures`, `day_blocks`, `notification_prefs` (0005) — three
 * directories, so it lives here. The order is the default a day reads in;
 * `DEFAULT_BLOCK_ORDER` in `@syn/constants` is the person-editable subset.
 */
export const blockKindEnum = pgEnum(
  "block_kind",
  enumValues<BlockKind>()([
    "orient",
    "morning",
    "training",
    "prep",
    "work",
    "break",
    "activity",
    "wind_down",
  ]),
);

/** §3.5, §3.7. `template_slots`, `day_items`. */
export const timeModeEnum = pgEnum(
  "time_mode",
  enumValues<TimeMode>()(["fixed_time", "window", "unscheduled"]),
);

/** §3.5. Hard anchors never move under shift-forward (§5.6). */
export const schedulingEnum = pgEnum(
  "scheduling",
  enumValues<Scheduling>()(["hard", "soft"]),
);

/**
 * §3.8. The resolver (§7.3) reads exactly these three: `circumstance` is
 * excluded, `scoping` credits half, `chose_not_to` credits 0.
 * `reasons`, `misses`, `shifts`.
 */
export const missTierEnum = pgEnum(
  "miss_tier",
  enumValues<MissTier>()(["circumstance", "scoping", "chose_not_to"]),
);

/**
 * Category.color_key — the eight category hues of official spec §9.3. Never
 * the accent teal and never the violet, so the semantic layer stays
 * unambiguous.
 *
 * Only `categories` stores it as a column, but it is the same closed set an
 * `IconValue` of kind "curated" carries as `colorKey` in the `icon` jsonb on
 * both `habits` and `day_items` — two more directories. It lives here so the
 * hue vocabulary has one home rather than one home and two comments.
 */
export const categoryColorKeyEnum = pgEnum(
  "category_color_key",
  enumValues<CategoryKey>()([
    "leaf",
    "sky",
    "clay",
    "rose",
    "amber",
    "slate",
    "plum",
    "moss",
  ]),
);
