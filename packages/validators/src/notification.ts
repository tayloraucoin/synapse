import { z } from "zod";

/**
 * ST-07's one write.
 *
 * The kinds are spelled here rather than imported from `@syn/constants`
 * because a validator's job is to refuse anything that is not one of these
 * twelve, and a list derived from a catalogue would accept whatever the
 * catalogue happened to hold. The two are kept in step by `notification_kind`'s
 * pgEnum, which is checked against `@syn/types` at compile time.
 *
 * The last three are UX v1.1 §9.1's (DYN-1). ST-07 offers them once DYN-20
 * wires their senders; until then a toggle stored for one is a preference
 * whose sender does not exist yet, which is how Phase-2 rows already work.
 */
export const notificationKindSchema = z.enum([
  "item_start",
  "window_open",
  "window_closing",
  "review_reminder",
  "pending_review",
  "week_build",
  "week_ready",
  "timer_running",
  "calendar_item",
  "block_start",
  "fixture_start",
  "devices_off",
]);

export const setNotificationPrefInput = z.object({
  kind: notificationKindSchema,
  enabled: z.boolean(),
});

export type SetNotificationPrefInput = z.infer<
  typeof setNotificationPrefInput
>;
