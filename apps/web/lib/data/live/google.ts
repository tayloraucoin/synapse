import type { TrpcClient } from "@/lib/trpc/client";
import type { LiveDomain } from "./domains";

/**
 * Google events on the day, live (USE-103): `google.events` for a date, the
 * calendars that are on, its week synced first when stale. Read-only, and
 * it refuses nothing, so no refusal is mapped.
 */
export const googleEventsDomain: LiveDomain = {
  name: "google-events",
  methods: (client: TrpcClient) => ({
    readGoogleEvents: (date) => client.google.events.query({ date }),
  }),
};
