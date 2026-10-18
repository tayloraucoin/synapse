import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  linearDisconnectInput,
  linearDoneInput,
  linearIssueWriteInput,
  linearReadOutput,
  linearRetryInput,
  linearSyncInput,
  linearWriteView,
} from "@syn/validators";
import {
  disconnectLinearConnection,
  LinearConnectionMissing,
  readLinearFor,
  retryLinearWriteFor,
  syncLinearNow,
  writeLinearDoneFor,
  writeLinearIssueFor,
} from "../services/linear";
import { protectedProcedure, router } from "../trpc";

/**
 * Linear (USE-100): Disconnect. The connect itself is two route handlers
 * (`apps/web/app/api/integrations/linear/`), since only a route can take
 * the provider's redirect. USE-101 adds the read and Sync now: polling
 * only, each sync a full snapshot, a placed issue closed in Linear closing
 * its task and sessions. USE-102 adds the outbox: a status, Done, Reopen,
 * a priority, the description or an estimate written in Synapse first and
 * sent to Linear after the transaction, each returning its row's view.
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

  /** Status, priority, description or estimate on a linked item: one at a time. */
  write: protectedProcedure
    .input(linearIssueWriteInput)
    .output(linearWriteView)
    .mutation(({ ctx, input }) =>
      writeLinearIssueFor(ctx.rls, ctx.authContext.userId, input),
    ),

  /** The check: Done moves the issue to its team's Done; undone, back. */
  writeDone: protectedProcedure
    .input(linearDoneInput)
    .output(linearWriteView)
    .mutation(({ ctx, input }) =>
      writeLinearDoneFor(ctx.rls, ctx.authContext.userId, input),
    ),

  /** Try again: the same failed row, sent again. */
  retry: protectedProcedure
    .input(linearRetryInput)
    .output(linearWriteView)
    .mutation(({ ctx, input }) =>
      retryLinearWriteFor(ctx.rls, ctx.authContext.userId, input.id),
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
