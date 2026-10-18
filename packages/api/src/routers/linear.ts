import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  linearDisconnectInput,
  linearReadOutput,
  linearSyncInput,
} from "@syn/validators";
import {
  disconnectLinearConnection,
  LinearConnectionMissing,
  readLinearFor,
  syncLinearNow,
} from "../services/linear";
import { protectedProcedure, router } from "../trpc";

/**
 * Linear (USE-100): Disconnect. The connect itself is two route handlers
 * (`apps/web/app/api/integrations/linear/`), since only a route can take
 * the provider's redirect. USE-101 adds the read and Sync now: polling
 * only, each sync a full snapshot, a placed issue closed in Linear closing
 * its task and sessions. USE-102's outbox adds here.
 */
export const linearRouter = router({
  /** Each workspace's latest snapshot; a stale one is synced first. */
  read: protectedProcedure
    .output(linearReadOutput)
    .query(({ ctx }) => readLinearFor(ctx.rls, ctx.authContext.userId)),

  /** Sync now: one workspace, or every one; within 30 s it returns the last snapshot. */
  sync: protectedProcedure
    .input(linearSyncInput)
    .output(linearReadOutput)
    .mutation(({ ctx, input }) =>
      syncLinearNow(ctx.rls, ctx.authContext.userId, input?.connectionId),
    ),

  disconnect: protectedProcedure
    .input(linearDisconnectInput)
    .output(z.object({ disconnected: z.literal(true) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await disconnectLinearConnection(ctx.rls, input.connectionId);
      } catch (error) {
        // Another person's connection reads as absent, never forbidden.
        if (error instanceof LinearConnectionMissing) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        throw error;
      }
      return { disconnected: true as const };
    }),
});
