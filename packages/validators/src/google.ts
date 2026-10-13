import { z } from "zod";

/**
 * Google Calendar as Synapse reads it (USE-32): read-only, several accounts,
 * each calendar on or off. The refresh token's ciphertext has no field on
 * any view here; a test walks every export's keys.
 */

export const googleAccountView = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  label: z.string(),
});

export type GoogleAccountView = z.infer<typeof googleAccountView>;

export const googleCalendarView = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
  name: z.string(),
  color: z.string(),
  primary: z.boolean(),
  enabled: z.boolean(),
});

export type GoogleCalendarView = z.infer<typeof googleCalendarView>;

/** Settings' switch beside a calendar. */
export const googleCalendarToggleInput = z.object({
  calendarId: z.string().uuid(),
  enabled: z.boolean(),
});

export type GoogleCalendarToggleInput = z.infer<
  typeof googleCalendarToggleInput
>;
