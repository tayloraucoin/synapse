import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getRequestUser } from "@/lib/auth/get-request-user";
import { requireVerifiedEmail } from "@/lib/auth/require-verified-email";
import { signInRoute } from "@/lib/routes";
import { AppShell, type ShellUser } from "./_components/app-shell";
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
 * session with an unverified email → `/verify`. Only then does the page render.
 *
 * THE CHROME (USE-4): `AppShell`, the rail from 1024 and the tabs below it.
 * The first-run and orient redirects went to `_legacy/` with the old app
 * (USE-1).
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

  return (
    <ShellProviders>
      <AppShell user={shellUser(user)}>{children}</AppShell>
    </ShellProviders>
  );
}

/**
 * The rail footer's name and avatar, from the session's user. The chrome never
 * blocks a page: anything odd in the metadata falls back to the email's name
 * and the initials.
 */
function shellUser(user: {
  email?: string;
  user_metadata?: Record<string, unknown>;
}): ShellUser {
  const fallback = user.email?.split("@")[0] ?? "";
  try {
    const meta = user.user_metadata ?? {};
    const name =
      typeof meta.display_name === "string" && meta.display_name.trim()
        ? meta.display_name.trim()
        : fallback;
    const imageUrl =
      typeof meta.avatar_url === "string" && meta.avatar_url
        ? meta.avatar_url
        : null;
    return { name, imageUrl };
  } catch {
    return { name: fallback, imageUrl: null };
  }
}
