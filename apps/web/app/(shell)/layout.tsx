import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getRequestUser } from "@/lib/auth/get-request-user";
import { requireVerifiedEmail } from "@/lib/auth/require-verified-email";
import { resolveEntryForRequest } from "@/lib/entry/resolve-entry-for-request";
import { signInRoute } from "@/lib/routes";

/**
 * The signed-in frame. THIS IS THE AUTH GATE.
 *
 * Protection lives here rather than in `proxy.ts` because a layout knows
 * exactly which subtree it guards, while a proxy runs on every matched request
 * and has to be taught what an asset is. `proxy.ts` refreshes the session;
 * this decides who may see what.
 *
 * The order matters: no session → sign in (remembering where they were); a
 * session with an unverified email → `/verify`; setup owed → the sequence.
 * Only then does the page render.
 *
 * NO CHROME YET. The tab bar, the rail, the header, and the status line are
 * Epic 2's first ticket. What is here is the landmark and the skip link,
 * because those are accessibility structure, not decoration (cross-cutting
 * §11).
 */
export default async function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = await headers();
  // proxy.ts sets this so the sign-in redirect can remember the destination.
  const nextPath = requestHeaders.get("x-next-path");

  const { user } = await getRequestUser();
  if (!user) {
    redirect(signInRoute(nextPath ?? undefined));
  }
  requireVerifiedEmail(user, nextPath ?? undefined);

  const entry = await resolveEntryForRequest(nextPath);
  if (entry && nextPath && !nextPath.startsWith(entry)) {
    // The entry tree only redirects away from here when setup is owed; a
    // resolved "today" for someone already on a shell route is a no-op.
    if (entry.startsWith("/setup") || entry.startsWith("/verify")) {
      redirect(entry);
    }
  }

  return (
    <>
      <a
        href="#main"
        className="bg-paper text-ink sr-only rounded-(--radius) px-(--space-3) py-(--space-2) focus:not-sr-only focus:absolute focus:top-(--space-2) focus:left-(--space-2) focus:z-50"
      >
        Skip to today&apos;s list
      </a>
      <main id="main" className="min-h-screen-safe">
        {children}
      </main>
    </>
  );
}
