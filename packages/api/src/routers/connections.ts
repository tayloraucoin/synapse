import { connectionsView } from "@syn/validators";
import { readConnections } from "../services/integrations/read-connections";
import { protectedProcedure, router } from "../trpc";

/**
 * Settings › Connections (USE-100). `list` reads every connection as a view;
 * its output schema is strict and has no token field (C4), so a column
 * selected by mistake fails here rather than reaching the browser.
 */
export const connectionsRouter = router({
  list: protectedProcedure
    .output(connectionsView)
    .query(({ ctx }) => readConnections(ctx.rls, ctx.authContext.userId)),
});
