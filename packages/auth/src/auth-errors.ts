/**
 * Maps Supabase Auth errors to the product's own copy.
 *
 * The strings are Epic 1 §9's, verbatim. They live in the package rather than
 * in a `copy.ts` beside a component because five screens (AU-01…05) show the
 * same five messages, and a message written five times is a message that
 * drifts four ways.
 *
 * REGISTER: a statement and a next step, never a scold and never an
 * exclamation. "That email and password don't match." — not "Invalid
 * credentials!", and not a hint about which half was wrong, which would be an
 * account-enumeration oracle as well as unkind.
 *
 * The fallback deliberately does NOT surface Supabase's own message: those are
 * written for a developer reading a log, and one of them reaching a person is
 * the failure this function exists to prevent.
 */
export function mapAuthError(error: {
  message?: string;
  code?: string;
}): string {
  const message = error.message?.toLowerCase() ?? "";
  const code = error.code?.toLowerCase() ?? "";

  if (code === "user_already_exists" || message.includes("already registered")) {
    return "There's already an account with this email.";
  }
  if (
    code === "invalid_credentials" ||
    message.includes("invalid login credentials")
  ) {
    return "That email and password don't match.";
  }
  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return "This email isn't verified yet.";
  }
  if (
    code === "over_request_rate_limit" ||
    code === "over_email_send_rate_limit" ||
    message.includes("rate limit")
  ) {
    return "Too many attempts. Try again in a few minutes.";
  }
  if (
    code === "otp_expired" ||
    message.includes("expired") ||
    message.includes("invalid token")
  ) {
    return "That link has expired. Request a new one.";
  }

  return "Something went wrong. Try again.";
}
