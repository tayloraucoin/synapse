import { z } from "zod";

import { DISPLAY_NAME_MAX, PASSWORD_MIN } from "@syn/constants";

import {
  clockTimeSchema,
  dayCloseTimeSchema,
  timezoneSchema,
} from "./preferences";

/**
 * ST-01 and ST-08's forms — Epic 1 §7.
 *
 * These are form schemas, not the mutation input. `updatePreferencesInput`
 * accepts any subset because three screens each write a different one; a form
 * has a fixed set of fields and a person expects every one of them to be
 * checked before anything is sent. The two shapes are deliberately different.
 */

/** ST-01. Email is validated but changed through Supabase, not this mutation. */
export const accountFormSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Add a name — it's just what the app calls you.")
    .max(DISPLAY_NAME_MAX, "Add a name — it's just what the app calls you."),
  email: z.string().trim().email("That doesn't look like an email address."),
});

export type AccountFormInput = z.infer<typeof accountFormSchema>;

/**
 * ST-01's password section.
 *
 * The current password is required because changing a password on an
 * unattended session is how an account is taken, not how one is maintained.
 * Supabase's `updateUser` alone would not ask; the screen re-authenticates
 * first, and *That's not your current password.* comes from that call rather
 * than from this schema — a client cannot check it.
 */
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z
      .string()
      .min(PASSWORD_MIN, `At least ${PASSWORD_MIN} characters.`),
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "These don't match.",
  });

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;

/**
 * ST-08. `dayCloseTime` and `timezone` are named for what the person sees;
 * the screen sends them as the PENDING half, because both take effect from
 * tomorrow (cross-cutting §7.3, §7.5).
 */
export const dayTimeFormSchema = z.object({
  usualWakeTime: clockTimeSchema,
  dayCloseTime: dayCloseTimeSchema,
  reviewReminderTime: clockTimeSchema,
  timezone: timezoneSchema,
});

export type DayTimeFormInput = z.infer<typeof dayTimeFormSchema>;

/** The word ST-10a asks for, in one place so the two gates cannot drift. */
export const DELETE_CONFIRMATION_WORD = "delete";

/**
 * ST-10a's typed gate, CHECKED AGAIN ON THE SERVER.
 *
 * The dialog already disables its confirm until the word matches, and that is
 * not the check that matters: a disabled button is a courtesy to the person,
 * not a control over the request. This schema is what actually stands between
 * a stray mutation call and an account, which is why the literal is required
 * rather than merely non-empty.
 *
 * CASE-INSENSITIVE, MATCHING THE COMPOSITE. `TypedConfirmDialog` compares
 * trimmed and lowercased — the gesture is deliberate intent, not exact
 * keystrokes — so a server that demanded lowercase would reject a confirmation
 * the screen had just accepted.
 *
 * THERE IS NO ID. The procedure deletes the caller, and an id parameter is how
 * one account ends up deleting another.
 */
export const deleteAccountInput = z.object({
  confirmation: z
    .string()
    .trim()
    .toLowerCase()
    .refine((value) => value === DELETE_CONFIRMATION_WORD, {
      message: "Type delete to confirm.",
    }),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountInput>;

/** Which export to mint a link for. The row is re-checked against the caller. */
export const exportDownloadInput = z.object({
  id: z.string().uuid(),
});

export type ExportDownloadInput = z.infer<typeof exportDownloadInput>;
