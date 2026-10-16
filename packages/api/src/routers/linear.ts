import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { linearDisconnectInput } from "@syn/validators";
import {
  disconnectLinearConnection,
  LinearConnectionMissing,
} from "../services/linear";
import { protectedProcedure, router } from "../trpc";

/**
 * Linear (USE-100): Disconnect. The connect itself is two route handlers
 * (`apps/web/app/api/integrations/linear/`), since only a route can take
 * the provider's redirect. USE-101's sync and USE-102's outbox add here.
 */
export const linearRouter = router({
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
