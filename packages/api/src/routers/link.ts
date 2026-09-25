import { TRPCError } from "@trpc/server";

import { linkFormSchema, linkIdInput, listLinksInput, reorderLinksInput } from "@syn/validators";

import {
  LinkRuleError,
  archiveLink,
  listLinks,
  reorderLinks,
  saveLink,
} from "../services/library/links";
import { protectedProcedure, router } from "../trpc";

/**
 * Links — UX v1.3 R53, §3.17 (DAY-5). Owner-private CRUD as `passage.*`;
 * another person's id is `NOT_FOUND`, never `FORBIDDEN`. The kind is the
 * service's; a reorder that leaves a hole, or a `spotify:` URI with no item,
 * is a `BAD_REQUEST` with the rule's name.
 */
const NOT_FOUND = { code: "NOT_FOUND" as const, message: "No such link." };

function rethrow(error: unknown): never {
  if (error instanceof LinkRuleError) {
    throw new TRPCError({ code: "BAD_REQUEST", message: error.code, cause: error });
  }
  throw error;
}

export const linkRouter = router({
  list: protectedProcedure
    .input(listLinksInput)
    .query(async ({ ctx, input }) =>
      listLinks(ctx.rls, ctx.authContext.userId, { includeArchived: input?.includeArchived }),
    ),

  save: protectedProcedure.input(linkFormSchema).mutation(async ({ ctx, input }) => {
    try {
      const saved = await saveLink(ctx.rls, ctx.authContext.userId, input);
      if (!saved) throw new TRPCError(NOT_FOUND);
      return saved;
    } catch (error) {
      rethrow(error);
    }
  }),

  archive: protectedProcedure.input(linkIdInput).mutation(async ({ ctx, input }) => {
    const ok = await archiveLink(ctx.rls, ctx.authContext.userId, input.id, true);
    if (!ok) throw new TRPCError(NOT_FOUND);
    return { archived: true };
  }),

  restore: protectedProcedure.input(linkIdInput).mutation(async ({ ctx, input }) => {
    const ok = await archiveLink(ctx.rls, ctx.authContext.userId, input.id, false);
    if (!ok) throw new TRPCError(NOT_FOUND);
    return { restored: true };
  }),

  reorder: protectedProcedure.input(reorderLinksInput).mutation(async ({ ctx, input }) => {
    try {
      return await reorderLinks(ctx.rls, ctx.authContext.userId, input.ids);
    } catch (error) {
      rethrow(error);
    }
  }),
});
