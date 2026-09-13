import { TRPCError } from "@trpc/server";

import {
  fixtureFormSchema,
  fixtureIdInput,
  listFixturesInput,
} from "@syn/validators";

import {
  archiveFixture,
  listFixtures,
  saveFixture,
} from "../services/plan/fixtures";
import { protectedProcedure, router } from "../trpc";

/**
 * Fixtures — UX v1.1 §3.6, §4.4. Owner-private CRUD; another person's id is
 * `NOT_FOUND`, never `FORBIDDEN`.
 */
const NOT_FOUND = { code: "NOT_FOUND" as const, message: "No such fixture." };

export const fixtureRouter = router({
  list: protectedProcedure
    .input(listFixturesInput)
    .query(async ({ ctx, input }) =>
      listFixtures(ctx.rls, ctx.authContext.userId, {
        includeArchived: input?.includeArchived ?? false,
      }),
    ),

  save: protectedProcedure
    .input(fixtureFormSchema)
    .mutation(async ({ ctx, input }) => {
      const saved = await saveFixture(ctx.rls, ctx.authContext.userId, input);
      if (!saved) throw new TRPCError(NOT_FOUND);
      return saved;
    }),

  archive: protectedProcedure
    .input(fixtureIdInput)
    .mutation(async ({ ctx, input }) => {
      const ok = await archiveFixture(ctx.rls, ctx.authContext.userId, input.id, true);
      if (!ok) throw new TRPCError(NOT_FOUND);
      return { archived: true };
    }),

  restore: protectedProcedure
    .input(fixtureIdInput)
    .mutation(async ({ ctx, input }) => {
      const ok = await archiveFixture(ctx.rls, ctx.authContext.userId, input.id, false);
      if (!ok) throw new TRPCError(NOT_FOUND);
      return { restored: true };
    }),
});
