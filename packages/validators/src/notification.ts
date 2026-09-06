import { z } from "zod";

/**
 * ST-07's one write.
 *
 * The kinds are spelled here rather than imported from `@syn/constants`
 * because a validator's job is to refuse anything that is not one of these
 * nine, and a list derived from a catalogue would accept whatever the
 * catalogue happened to hold. The two are kept in step by `notification_kind`'s
 * pgEnum, which is checked against `@syn/types` at compile time.
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
]);

export const setNotificationPrefInput = z.object({
  kind: notificationKindSchema,
  enabled: z.boolean(),
});

export type SetNotificationPrefInput = z.infer<
  typeof setNotificationPrefInput
>;
