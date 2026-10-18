import { googleConnectStartRoute, linearConnectStartRoute } from "@/lib/routes";
import type { LiveDomain } from "./domains";

/**
 * Settings › Connections, live (USE-100, USE-103): `connections.list`,
 * `linear.disconnect` and `google.toggleCalendar`. "+ Add a workspace" and
 * "+ Add a Google account" leave for the provider's consent through their
 * start routes, so the promise never settles here; the callback lands back
 * on Connections, or on `?failed=linear` / `?failed=google`. The mapping and
 * Clients writes are USE-104's, so they stay unwired (the fixtures in
 * development).
 */
export const connectionsDomain = {
  name: "connections",
  methods: (client) => ({
    readConnections: () => client.connections.list.query(),

    async readGoogleCalendars() {
      const view = await client.connections.list.query();
      return { accounts: view.googleAccounts, calendars: view.googleCalendars };
    },

    async writeCalendar(input) {
      await client.google.toggleCalendar.mutate(input);
    },

    async disconnect(connectionId) {
      await client.linear.disconnect.mutate({ connectionId });
    },

    connect(kind) {
      window.location.assign(
        kind === "google"
          ? googleConnectStartRoute()
          : linearConnectStartRoute(),
      );
      return new Promise<void>(() => {});
    },
  }),
} satisfies LiveDomain;
