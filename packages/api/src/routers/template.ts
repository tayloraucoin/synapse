import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  listTemplatesInput,
  moveSlotInput,
  restoreSlotInput,
  slotFormSchema,
  slotIdInput,
  templateIdInput,
  templatePatchSchema,
} from "@syn/validators";

import { SameStartError, saveSlot } from "../services/plan/save-slot";
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
import { readPreferences } from "../services/user/preferences";
import { protectedProcedure, router } from "../trpc";

/**
 * Templates and their slots.
 *
 * `saveSlot` is the only resolver here that is not boring, and it is not
 * boring in exactly one way: the same-start invariant surfaces as a `CONFLICT`
 * carrying the other slot's title and time, so the sheet can ask the person's
 * own question — *Another item starts at 7:00: Meditate. Do these happen at
 * the same time?* — rather than showing them an error code.
 */
const NOT_FOUND = { code: "NOT_FOUND" as const, message: "No such template." };

export const templateRouter = router({
  list: protectedProcedure
    .input(listTemplatesInput)
    .query(async ({ ctx, input }) =>
      listTemplates(
        ctx.rls,
        ctx.authContext.userId,
        input?.includeArchived ?? true,
      ),
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

  /** The anchor defaults to the person's usual wake time (Epic 1 TP-02). */
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const prefs = await readPreferences(ctx.rls, ctx.authContext.userId);
    return createTemplate(
      ctx.rls,
      ctx.authContext.userId,
      prefs?.usualWakeTime ?? "07:00",
    );
  }),

  update: protectedProcedure
    .input(templatePatchSchema)
    .mutation(async ({ ctx, input }) => {
      const saved = await updateTemplate(ctx.rls, ctx.authContext.userId, input);
      if (!saved) throw new TRPCError(NOT_FOUND);
      return saved;
    }),

  discardIfEmpty: protectedProcedure
    .input(templateIdInput)
    .mutation(async ({ ctx, input }) =>
      discardIfEmpty(ctx.rls, ctx.authContext.userId, input.id),
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
        if (error instanceof SameStartError) {
          throw new TRPCError({
            code: "CONFLICT",
            message: JSON.stringify(error.conflict),
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
