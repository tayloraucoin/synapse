import { z } from "zod";

import { DISPLAY_NAME_MAX, PASSWORD_MIN } from "@syn/constants";

/**
 * Auth field rules — Epic 1 §9. The error strings are the copy, verbatim: one
 * definition shared by the form's resolver and the tRPC input, so the message
 * a person reads is written once.
 */

export const emailSchema = z
  .string()
  .trim()
  .email("That doesn't look like an email address.");

export type Email = z.infer<typeof emailSchema>;

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, "Passwords need at least 8 characters.");

export type Password = z.infer<typeof passwordSchema>;

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Add a name — it's just what the app calls you.")
  .max(DISPLAY_NAME_MAX, "Add a name — it's just what the app calls you.");

export type DisplayName = z.infer<typeof displayNameSchema>;

/** Sign-in never checks strength client-side — the password either matches or it doesn't. */
export const signInInput = z.object({
  email: emailSchema,
  password: z.string().min(1, "Passwords need at least 8 characters."),
});

export type SignInInput = z.infer<typeof signInInput>;

export const signUpInput = z.object({
  displayName: displayNameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export type SignUpInput = z.infer<typeof signUpInput>;

export const forgotPasswordInput = z.object({
  email: emailSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordInput>;

export const resetPasswordInput = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "These don't match.",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordInput>;
