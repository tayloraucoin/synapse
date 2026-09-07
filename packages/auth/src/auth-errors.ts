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
 *
 * IT STAYS PURE, AND THE CALLER LOGS. Swallowing the message on screen and
 * swallowing it everywhere are different things — the second makes a failed
 * sign-up undiagnosable — but this package may not import observability
 * (conventions §6.2), and widening that boundary for a `console.log` would be
 * the wrong trade. `apps/web/lib/auth/describe-auth-error.ts` wraps this and
 * does the dev logging, in one place, for all four auth screens.
 *
 * `isUnmappedAuthError` is what lets that wrapper know there was something
 * worth printing.
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
  /*
   * The project's OWN password policy, set in the Supabase dashboard, which
   * can be stricter than this app's eight-character floor. Without this case a
   * rejected password fell through to the generic sentence, and a person was
   * told nothing had gone right with no idea what to change.
   *
   * The message names the requirement rather than restating a rule the client
   * already enforces, because the whole point is that the server asked for
   * something more. `[COPY — needs Vesper sign-off; not in Epic 1 §9.]`
   */
  if (code === "weak_password" || message.includes("password should")) {
    return "That password doesn't meet the requirements. Try a longer one, or add a number or symbol.";
  }
  /*
   * `handle_new_user()` failing, a missing grant, or any other server fault
   * during sign-up. Supabase reports it as a database error; a person can only
   * try again, and someone needs to read the log.
   * `[COPY — needs Vesper sign-off; not in Epic 1 §9.]`
   */
  if (
    code === "unexpected_failure" ||
    message.includes("database error")
  ) {
    return "Couldn't create the account. Try again in a moment.";
  }

  return UNMAPPED_AUTH_ERROR;
}

/** The fallback sentence, named so a caller can tell it apart from a match. */
export const UNMAPPED_AUTH_ERROR = "Something went wrong. Try again.";

/** True when `mapAuthError` recognised nothing — the caller should log. */
export function isUnmappedAuthError(mapped: string): boolean {
  return mapped === UNMAPPED_AUTH_ERROR;
}
