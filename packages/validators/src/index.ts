/**
 * @syn/validators — Zod schemas for forms and tRPC I/O.
 *
 * Pattern (conventions §4.6):
 * - Export both the schema and its z.infer type from the same module.
 * - One definition shared by the form (zodResolver) and the tRPC mutation.
 * - Platform-agnostic only (no next/*, DOM, or Node-only imports).
 * - Error messages are the UX documents' copy, verbatim — a message written
 *   twice is a message that drifts.
 */

export {
  displayNameSchema,
  emailSchema,
  forgotPasswordInput,
  passwordSchema,
  resetPasswordInput,
  signInInput,
  signUpInput,
  type DisplayName,
  type Email,
  type ForgotPasswordInput,
  type Password,
  type ResetPasswordInput,
  type SignInInput,
  type SignUpInput,
} from "./auth-credentials";

export {
  dateKeySchema,
  weekKeySchema,
  type DateKey,
  type WeekKey,
} from "./keys";

export {
  clockTimeSchema,
  themePreferenceSchema,
  timezoneSchema,
  type ClockTime,
  type ThemePreference,
  type Timezone,
} from "./preferences";

export {
  webPushSubscribeInput,
  type WebPushSubscribeInput,
} from "./push";

export {
  updatePreferencesInput,
  type UpdatePreferencesInput,
} from "./user";
