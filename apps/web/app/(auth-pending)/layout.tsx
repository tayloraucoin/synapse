/**
 * The auth screens a person may hold a session on — `/verify` and `/reset`.
 *
 * WHY THIS GROUP EXISTS. `(auth)` redirects anyone signed in to `/`, which is
 * right for sign in, create account, and forgot: a person with a session has
 * no business on them. It is wrong for these two, and in opposite directions:
 *
 * - `/reset` REQUIRES a session. A recovery link is verified at
 *   `/auth/confirm`, which signs the person in and sends them here;
 *   `updateUser({ password })` has nothing to update without it. Under the
 *   `(auth)` gate the reset form could never render at all.
 * - `/verify` TOLERATES one. It is where an unverified session is sent, so
 *   bouncing it to `/` would hand it back to the entry tree, which would send
 *   it here again.
 *
 * The gates are per screen and live in each screen's own layout, because the
 * two rules are different. This wrapper is the shared frame and nothing else —
 * it deliberately makes no session decision.
 */
export default function AuthPendingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      id="main"
      className="flex min-h-screen-safe w-full flex-col justify-center"
    >
      {children}
    </main>
  );
}
