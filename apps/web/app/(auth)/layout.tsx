import { redirect } from "next/navigation";

import { getRequestUser } from "@/lib/auth/get-request-user";
import { homeRoute } from "@/lib/routes";

/**
 * The auth group — no shell, one centred column (Epic 1 §0.4).
 *
 * A signed-in person never sees these screens (Epic 1 AU-01: "already signed
 * in: never shown"), so the gate here is the inverse of the shell's.
 *
 * WHICH SCREENS ARE NOT HERE. `/verify` and `/reset` live in `(auth-pending)`,
 * because both are auth screens a person may hold a session on: a recovery
 * link signs someone in and then needs the reset form, and an unverified
 * session is what `/verify` exists to resolve. Under this gate both would
 * bounce to `/` — the reset form would be unreachable and `/verify` would
 * ping-pong with the entry tree. Same frame, different gate.
 *
 * THIS WRAPPER DOES NOT SET THE COLUMN. `AuthFrame` owns `max-w-sm`, the gap,
 * and the padding; setting them here as well nested one column inside another
 * and doubled the horizontal padding. What is left is the landmark and the
 * vertical centring, which are the frame's job to sit inside, not to know.
 */
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getRequestUser();
  if (user) {
    redirect(homeRoute());
  }

  return (
    <main
      id="main"
      className="flex min-h-screen-safe w-full flex-col justify-center"
    >
      {children}
    </main>
  );
}
