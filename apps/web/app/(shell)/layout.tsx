import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getRequestUser } from "@/lib/auth/get-request-user";
import { requireVerifiedEmail } from "@/lib/auth/require-verified-email";
import { resolveEntryForRequest } from "@/lib/entry/resolve-entry-for-request";
import { getServerApi } from "@/lib/trpc/server";
import { orientRoute, signInRoute } from "@/lib/routes";

import { ShellProviders } from "./_components/shell-providers";

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
 * THE CHROME IS MOUNTED (SYS-1). The rail, the tab bar and the skip link are
 * in `AppShell`; the header, the status line and `main` belong to each page's
 * `PageFrame`. `shell.status` is read here on the server so the first paint
 * carries the person's name and the Review dot, rather than filling in a beat
 * later — and its failure is not fatal, because a chrome that cannot describe
 * itself must still let the page render.
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
    // The entry tree redirects away from here when setup is owed, or when
    // the orient frame is (UX v1.1 §5.1 — before any tab, once per day); a
    // resolved "today" for someone already on a shell route is a no-op.
    if (
      entry.startsWith("/setup") ||
      entry.startsWith("/verify") ||
      entry === orientRoute()
    ) {
      redirect(entry);
    }
  }

  const status = await readShellStatus();

  return (
    <ShellProviders
      user={{
        name: status?.displayName || user.email || "",
        // SET-3's route resolves a stored path; until an avatar exists the
        // initials show, which is the designed default rather than a fallback.
        imageUrl: status?.avatarPath ? `/api/assets/${status.avatarPath}` : null,
      }}
      reviewHasPending={(status?.pendingReviewCount ?? 0) > 0}
    >
      {children}
    </ShellProviders>
  );
}

/** The chrome is never load-bearing: a failure here renders a plain frame. */
async function readShellStatus() {
  try {
    const api = await getServerApi();
    return await api.shell.status();
  } catch {
    return null;
  }
}
