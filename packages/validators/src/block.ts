import { z } from "zod";

/**
 * The block model's enums, as Zod — UX v1.1 §1.4, §3.1, §3.4, §3.7, §11.
 *
 * Spelled here rather than derived from `@syn/constants`, for the same reason
 * `notificationKindSchema` is: a validator's job is to refuse anything that is
 * not one of these. The pgEnums in `@syn/db` are checked against `@syn/types`
 * at compile time, and these lists are kept in step with them by review; a
 * value added to the union and forgotten here is refused at the boundary,
 * which is the failure that is easy to see.
 */

export const blockKindSchema = z.enum([
  "orient",
  "morning",
  "training",
  "prep",
  "work",
  "break",
  "activity",
  "wind_down",
]);

export type BlockKindInput = z.infer<typeof blockKindSchema>;

export const blockFlowSchema = z.enum(["forward", "backward"]);
export const blockStructureSchema = z.enum(["stack", "opener_pool_closer"]);
export const slotRoleSchema = z.enum(["stack", "opener", "pool", "closer"]);
export const trainingPlacementSchema = z.enum([
  "before_morning",
  "after_morning",
  "inside_work",
  "after_work",
  "in_break",
]);
export const dayShapeSchema = z.enum(["structured", "unstructured"]);
export const anchorDirectionSchema = z.enum([
  "work_waits",
  "routine_cut",
  "depends",
]);
export const overflowModeSchema = z.enum(["daily_menu", "variants", "auto_trim"]);
export const scheduleShapeSchema = z.enum([
  "own_structure_dynamic",
  "consistent_shifts",
  "varying_shifts",
  "fluid",
]);
export const workDayModeSchema = z.enum(["always", "sometimes", "never"]);

/** Mon = "0" … Sun = "6" — the shape `users.work_days` stores (v1.1 §4.2). */
export const workDaysSchema = z.object({
  "0": workDayModeSchema,
  "1": workDayModeSchema,
  "2": workDayModeSchema,
  "3": workDayModeSchema,
  "4": workDayModeSchema,
  "5": workDayModeSchema,
  "6": workDayModeSchema,
});

export type WorkDaysInput = z.infer<typeof workDaysSchema>;

/**
 * The kinds a person orders in Settings → Block order (v1.1 §3.1). Every
 * non-placeable kind exactly once; the two placeable kinds never — they are
 * placed each morning, not ordered.
 */
export const blockOrderSchema = z
  .array(blockKindSchema)
  .refine(
    (order) => {
      const required = [
        "orient",
        "morning",
        "prep",
        "work",
        "activity",
        "wind_down",
      ];
      if (order.length !== required.length) return false;
      if (order.some((kind) => kind === "training" || kind === "break")) {
        return false;
      }
      return required.every((kind) => order.includes(kind as never));
    },
    // [COPY — needs Vesper sign-off: v1.1 gives no sentence for a bad order.]
    { message: "Every block once." },
  );

/**
 * `template.create({ kind })` — v1.1 §11.4. The v1.0 editor's callers create
 * morning blocks (TD-1) and are replaced by DYN-8, so the kind defaults until
 * then; DYN-8's callers always pass it.
 */
export const createTemplateInput = z
  .object({ kind: blockKindSchema.default("morning") })
  .default({ kind: "morning" });

export type CreateTemplateInput = z.infer<typeof createTemplateInput>;
