/**
 * Every string the auth screens show — Epic 1 §1 (AU-01…05), verbatim.
 *
 * ONE FILE FOR ALL THE AUTH SCREENS, including the two that live in the
 * `(auth-pending)` group (`/verify`, `/reset`). The group split is a gating
 * concern; the copy is one voice and belongs in one place.
 *
 * Two strings are marked for Vesper. Everything else is quoted from the
 * document and cited by screen. A string the documents do not contain is a
 * marker, never an improvisation.
 *
 * REGISTER (official spec §10.1): a statement and a next step. No exclamation
 * marks, no scolding, and never a hint about which half of a credential was
 * wrong — that is an account-enumeration oracle as well as unkind.
 */

export const AUTH_COPY = {
  /** Shown on AU-01 and AU-02 only (Epic 1 §12). `TrustLine` owns the string. */
  signIn: {
    heading: "Sign in",
    google: "Continue with Google",
    divider: "or",
    email: "Email",
    password: "Password",
    forgot: "Forgot your password?",
    submit: "Sign in",
    footerLead: "New here?",
    footerLink: "Create an account",
    /** AU-01, deliberately not field-specific. */
    wrongCredentials: "That email and password don't match.",
    unverified: "This email isn't verified yet.",
    unverifiedAction: "Resend the link",
    rateLimited: "Too many attempts. Try again in a few minutes.",
    offline: "You're offline — sign-in needs a connection.",
    /** AU-05's exit line, shown here after a successful reset. */
    passwordChanged: "Password changed. Sign in with the new one.",
    /** AU-05's expired-link line, shown here when a link fails at /auth/confirm. */
    linkExpired: "That link has expired. Request a new one.",
    /**
     * [COPY — needs Vesper sign-off; not in the document.] Shown when
     * `/auth/callback` returns `auth=error` or `auth=missing_code`.
     */
    oauthFailed: "Couldn't sign in with Google. Try again.",
  },

  signUp: {
    heading: "Create an account",
    /** AU-02, shown only when arrived from the shared link (`notice=invite`). */
    inviteLine:
      "Someone shared Synapse with you. It's free, and your list is private to you.",
    google: "Continue with Google",
    divider: "or",
    name: "Your name",
    email: "Email",
    password: "Password",
    passwordHelper: "At least 8 characters.",
    submit: "Create account",
    footerLead: "Already have an account?",
    footerLink: "Sign in",
    existingAccount: "There's already an account with this email.",
    existingAccountAction: "Sign in instead",
    offline: "You're offline — sign-in needs a connection.",
  },

  verify: {
    heading: "Check your email",
    /** AU-03. The address is bold in the rendered line. */
    bodyLead: "We sent a sign-in link to",
    bodyTail: "Open it on this device to continue.",
    /** When no address is known — neither a session nor a pending email. */
    bodyFallbackAddress: "your email",
    resend: "Resend the link",
    /** Two seconds after a successful send, before the countdown. */
    resent: "Sent",
    /** AU-03: "Resend in 24s". */
    resendCooldown: (seconds: number) => `Resend in ${seconds}s`,
    thirdSend:
      "Sent again. If it still doesn't arrive, try a different email.",
    differentEmail: "Use a different email",
    signIn: "Sign in",
    note: "Didn't get it? Check spam, or wait a minute — they sometimes take a moment.",
    offline: "You're offline — sign-in needs a connection.",
  },

  forgot: {
    heading: "Reset your password",
    body: "Enter your email and we'll send a reset link.",
    email: "Email",
    submit: "Send reset link",
    backToSignIn: "Back to sign in",
    /** The sent state is a different screen, not a message on this one. */
    sentHeading: "Check your email",
    sentBodyLead: "If there's an account for",
    sentBodyTail: "a reset link is on its way.",
    resend: "Resend",
    resendCooldown: (seconds: number) => `Resend in ${seconds}s`,
    /** AU-05's expired link sends the person here. */
    expired: "That link has expired. Request a new one.",
    offline: "You're offline — sign-in needs a connection.",
  },

  reset: {
    heading: "Choose a new password",
    password: "New password",
    passwordHelper: "At least 8 characters.",
    confirmPassword: "Confirm password",
    submit: "Save password",
    offline: "You're offline — sign-in needs a connection.",
  },
} as const;

/**
 * Query flags the auth screens read. They are not sensitive — a notice says
 * what happened, never who it happened to — so they travel in the URL rather
 * than in storage (SET-2's dev call).
 */
export const AUTH_NOTICE = {
  invite: "invite",
  passwordChanged: "password-changed",
  expired: "expired",
} as const;
