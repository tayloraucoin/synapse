import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTemplateInput,
  discardTemplateInput,
  listTemplatesInput,
  moveSlotInput,
  restoreSlotInput,
  slotFormSchema,
  slotIdInput,
  templateIdInput,
  templatePatchSchema,
} from "@syn/validators";

import { planFit } from "../services/plan/fit";
import {
  SamePositionError,
  SlotRuleError,
  saveSlot,
} from "../services/plan/save-slot";
import {
  archiveTemplate,
  createTemplate,
  discardIfEmpty,
  duplicateTemplate,
  getTemplate,
  listTemplates,
  moveSlot,
  removeSlot,
  restoreSlot,
  updateTemplate,
} from "../services/plan/templates";
import { protectedProcedure, router } from "../trpc";

/**
 * Block templates and their slots (UX v1.1 §3.11, §11.4, §11.5).
 *
 * `saveSlot` is the only resolver here that is not boring, and it is not
 * boring in exactly one way: the same-position invariant surfaces as a
 * `CONFLICT` carrying the other slot's title and position, so the sheet can
 * ask the person's own question — *Do these happen at the same time?* with
 * three answers (v1.1 §3.5) — rather than showing them an error code. A
 * `SlotRuleError` (joining a bracket member as a one-of, or the reverse) is a
 * `BAD_REQUEST` the sheet phrases.
 */
const NOT_FOUND = { code: "NOT_FOUND" as const, message: "No such template." };

export const templateRouter = router({
  list: protectedProcedure
    .input(listTemplatesInput)
    .query(async ({ ctx, input }) =>
      listTemplates(ctx.rls, ctx.authContext.userId, {
        includeArchived: input?.includeArchived ?? true,
        kind: input?.kind,
      }),
    ),

  get: protectedProcedure
    .input(templateIdInput)
    .query(async ({ ctx, input }) => {
      const detail = await getTemplate(
        ctx.rls,
        ctx.authContext.userId,
        input.id,
      );
      if (!detail) throw new TRPCError(NOT_FOUND);
      return detail;
    }),

  /** The fit at planning time — first run's last screen (v1.1 §3.10, §4.12). */
  fit: protectedProcedure.query(async ({ ctx }) => planFit(ctx.rls, ctx.authContext.userId)),

  /** A block of the given kind; the anchor comes from the profile (v1.1 §11.4). */
  create: protectedProcedure
    .input(createTemplateInput)
    .mutation(async ({ ctx, input }) =>
      createTemplate(ctx.rls, ctx.authContext.userId, input.kind),
    ),

  update: protectedProcedure
    .input(templatePatchSchema)
    .mutation(async ({ ctx, input }) => {
      const saved = await updateTemplate(ctx.rls, ctx.authContext.userId, input);
      if (!saved) throw new TRPCError(NOT_FOUND);
      return saved;
    }),

  discardIfEmpty: protectedProcedure
    .input(discardTemplateInput)
    .mutation(async ({ ctx, input }) =>
      discardIfEmpty(ctx.rls, ctx.authContext.userId, input.id, {
        requireUnnamed: input.requireUnnamed,
      }),
    ),

  archive: protectedProcedure
    .input(templateIdInput)
    .mutation(async ({ ctx, input }) => {
      const ok = await archiveTemplate(
        ctx.rls,
        ctx.authContext.userId,
        input.id,
        true,
      );
      if (!ok) throw new TRPCError(NOT_FOUND);
      return { archived: true };
    }),

  restore: protectedProcedure
    .input(templateIdInput)
    .mutation(async ({ ctx, input }) => {
      const ok = await archiveTemplate(
        ctx.rls,
        ctx.authContext.userId,
        input.id,
        false,
      );
      if (!ok) throw new TRPCError(NOT_FOUND);
      return { restored: true };
    }),

  duplicate: protectedProcedure
    .input(templateIdInput)
    .mutation(async ({ ctx, input }) => {
      const copy = await duplicateTemplate(
        ctx.rls,
        ctx.authContext.userId,
        input.id,
      );
      if (!copy) throw new TRPCError(NOT_FOUND);
      return copy;
    }),

  /**
   * The invariant's one door. A `CONFLICT` here is not a failure — it is the
   * product asking a question it cannot answer on the person's behalf.
   */
  saveSlot: protectedProcedure
    .input(slotFormSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const saved = await saveSlot(ctx.rls, ctx.authContext.userId, input);
        if (!saved) throw new TRPCError(NOT_FOUND);
        return saved;
      } catch (error) {
        if (error instanceof SamePositionError) {
          throw new TRPCError({
            code: "CONFLICT",
            message: JSON.stringify(error.conflict),
            cause: error,
          });
        }
        if (error instanceof SlotRuleError) {
          throw new TRPCError({
            code: error.code === "not_found" ? "NOT_FOUND" : "BAD_REQUEST",
            message: error.code,
            cause: error,
          });
        }
        throw error;
      }
    }),

  removeSlot: protectedProcedure
    .input(slotIdInput)
    .mutation(async ({ ctx, input }) => {
      const removed = await removeSlot(
        ctx.rls,
        ctx.authContext.userId,
        input.id,
      );
      if (!removed) throw new TRPCError({ code: "NOT_FOUND", message: "No such slot." });
      return removed;
    }),

  restoreSlot: protectedProcedure
    .input(z.object({ payload: restoreSlotInput }))
    .mutation(async ({ ctx, input }) => {
      const restored = await restoreSlot(
        ctx.rls,
        ctx.authContext.userId,
        input.payload,
      );
      if (!restored) throw new TRPCError(NOT_FOUND);
      return restored;
    }),

  moveSlot: protectedProcedure
    .input(moveSlotInput)
    .mutation(async ({ ctx, input }) => {
      const ok = await moveSlot(
        ctx.rls,
        ctx.authContext.userId,
        input.id,
        input.direction,
      );
      return { moved: ok };
    }),
});
