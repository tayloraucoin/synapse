import type { z } from "zod";
import {
  clientArchivedInput,
  clientOrderInput,
  clientsEnabledInput,
  clientWriteInput,
  linearProjectClientInput,
  workspaceClientInput,
} from "@syn/validators";
import { PlannerRefusal } from "@/lib/data/refusals";
import type { LiveDomain } from "./domains";
import { callLive } from "./errors";

/**
 * Clients, live (USE-104): `client.*`. Settings' client rows, the Clients
 * switch, the workspace and project mappings and the one order (Settings'
 * grip and the pool's client heads write the same `setClientOrder`). Each
 * input is parsed here first, so a bad one is refused "invalid" with the
 * schema's words, as the fixture refuses it. The order has no Undo live:
 * neither place that drags it offers one.
 */

function parsed<S extends z.ZodTypeAny>(schema: S, raw: unknown): z.output<S> {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new PlannerRefusal(
      "invalid",
      result.error.issues[0]?.message ?? "Invalid input.",
    );
  }
  return result.data;
}

export const clientsDomain: LiveDomain = {
  name: "clients",
  methods: (client) => ({
    writeClient: async (raw) =>
      callLive("planner", () =>
        client.client.write.mutate(parsed(clientWriteInput, raw)),
      ),

    async writeClientArchived(raw) {
      const input = parsed(clientArchivedInput, raw);
      await callLive("planner", () => client.client.setArchived.mutate(input));
    },

    async writeClientsEnabled(raw) {
      const input = parsed(clientsEnabledInput, raw);
      await callLive("planner", () => client.client.setEnabled.mutate(input));
    },

    async writeWorkspaceClient(raw) {
      const input = parsed(workspaceClientInput, raw);
      await callLive("planner", () => client.client.setWorkspace.mutate(input));
    },

    async writeProjectClient(raw) {
      const input = parsed(linearProjectClientInput, raw);
      await callLive("planner", () => client.client.setProject.mutate(input));
    },

    async setClientOrder(raw) {
      const input = parsed(clientOrderInput, raw);
      await callLive("planner", () => client.client.setOrder.mutate(input));
      return { undo: "" };
    },
  }),
};
