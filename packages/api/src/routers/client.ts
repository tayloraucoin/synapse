import { z } from "zod";
import {
  clientArchivedInput,
  clientOrderInput,
  clientRecord,
  clientsEnabledInput,
  clientWriteInput,
  linearProjectClientInput,
  workspaceClientInput,
} from "@syn/validators";
import { clientStore } from "../services/clients/client-store";
import {
  setClientOrder,
  writeClient,
  writeClientArchived,
  writeClientsEnabled,
  writeProjectClient,
  writeWorkspaceClient,
} from "../services/clients/clients";
import { protectedProcedure, router } from "../trpc";

/**
 * Clients (USE-104): Settings › Connections' clients, the Clients switch,
 * the one order (the whole order, top first) and the workspace and project
 * mappings. Each runs in one RLS transaction; nothing is written to Linear.
 */

const saved = z.object({ saved: z.literal(true) });
const SAVED = { saved: true as const };

export const clientRouter = router({
  write: protectedProcedure
    .input(clientWriteInput)
    .output(clientRecord.strict())
    .mutation(({ ctx, input }) =>
      ctx.rls.execute((tx) =>
        writeClient(clientStore(tx, ctx.authContext.userId), input),
      ),
    ),

  setArchived: protectedProcedure
    .input(clientArchivedInput)
    .output(saved)
    .mutation(async ({ ctx, input }) => {
      await ctx.rls.execute((tx) =>
        writeClientArchived(clientStore(tx, ctx.authContext.userId), input),
      );
      return SAVED;
    }),

  setEnabled: protectedProcedure
    .input(clientsEnabledInput)
    .output(saved)
    .mutation(async ({ ctx, input }) => {
      await ctx.rls.execute((tx) =>
        writeClientsEnabled(clientStore(tx, ctx.authContext.userId), input),
      );
      return SAVED;
    }),

  setOrder: protectedProcedure
    .input(clientOrderInput)
    .output(saved)
    .mutation(async ({ ctx, input }) => {
      await ctx.rls.execute((tx) =>
        setClientOrder(clientStore(tx, ctx.authContext.userId), input.ids),
      );
      return SAVED;
    }),

  setWorkspace: protectedProcedure
    .input(workspaceClientInput)
    .output(saved)
    .mutation(async ({ ctx, input }) => {
      await ctx.rls.execute((tx) =>
        writeWorkspaceClient(clientStore(tx, ctx.authContext.userId), input),
      );
      return SAVED;
    }),

  setProject: protectedProcedure
    .input(linearProjectClientInput)
    .output(saved)
    .mutation(async ({ ctx, input }) => {
      await ctx.rls.execute((tx) =>
        writeProjectClient(clientStore(tx, ctx.authContext.userId), input),
      );
      return SAVED;
    }),
});
