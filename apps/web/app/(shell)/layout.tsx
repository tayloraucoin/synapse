import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getRequestUser } from "@/lib/auth/get-request-user";
import { requireVerifiedEmail } from "@/lib/auth/require-verified-email";
import { signInRoute } from "@/lib/routes";
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
 * NO CHROME (USE-1). The old rail and tab bar went to `_legacy/` with the app
 * they served; USE's shell ticket mounts the new ones here. The first-run and
 * orient redirects went with them.
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

  return <ShellProviders>{children}</ShellProviders>;
}
