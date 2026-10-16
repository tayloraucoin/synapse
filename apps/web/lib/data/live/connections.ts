import { linearConnectStartRoute } from "@/lib/routes";
import type { LiveDomain } from "./domains";

/**
 * Settings › Connections, live (USE-100): `connections.list` and
 * `linear.disconnect`. "+ Add a workspace" leaves for Linear's consent
 * through the start route, so its promise never settles here; the callback
 * lands back on Connections, or on `?failed=linear`. Google's connect and
 * the calendar, mapping and Clients writes are USE-103's and USE-104's, so
 * they stay unwired (the fixtures in development).
 */
export const connectionsDomain: LiveDomain = {
  name: "connections",
  methods: (client) => ({
    readConnections: () => client.connections.list.query(),

    async disconnect(connectionId) {
      await client.linear.disconnect.mutate({ connectionId });
    },

    connect(kind) {
      if (kind !== "linear") {
        return Promise.reject(new Error("Google connect is not live yet."));
      }
      window.location.assign(linearConnectStartRoute());
      return new Promise<void>(() => {});
    },
  }),
};
