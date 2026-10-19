import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  finishGoogleConnect,
  GOOGLE_OAUTH_COOKIE,
  GOOGLE_OAUTH_COOKIE_OPTIONS,
  handleGoogleCallback,
} from "@syn/api";
import { createLogger } from "@syn/observability";
import { env } from "@/env";
import { getRequestAuthContextFromRequest } from "@/lib/auth/get-request-context";
import { connectionsRoute, googleConnectCallbackRoute } from "@/lib/routes";

export const runtime = "nodejs";

const log = createLogger("web/integrations/google/callback");

/**
 * Google's redirect back (USE-103). `handleGoogleCallback` refuses a missing
 * or mismatched state, a missing verifier or code, or a signed-out caller,
 * before anything is exchanged or stored; then the code is exchanged, the
 * calendar list read, the account and its calendars written inside RLS, and
 * this week synced once. The cookie is cleared every time. Connected or
 * cancelled lands where the connect began; anything else on Connections'
 * "Not connected. Try again."
 */
export async function GET(request: Request) {
  const origin = env.siteUrl;
  const url = new URL(request.url);
  const cookieStore = await cookies();
  const auth = await getRequestAuthContextFromRequest(request);

  const outcome = await handleGoogleCallback(
    {
      url,
      cookie: cookieStore.get(GOOGLE_OAUTH_COOKIE)?.value,
      signedIn: auth !== null,
    },
    async (code, verifier) => {
      if (!auth) throw new Error("Signed out.");
      await finishGoogleConnect(auth.rls, auth.authContext.userId, {
        code,
        verifier,
        redirectUri: new URL(googleConnectCallbackRoute(), origin).toString(),
      });
    },
  );

  if (outcome.kind === "failed") {
    log.log("connect refused", { reason: outcome.reason });
  }
  const landing =
    outcome.kind === "failed"
      ? connectionsRoute({ failed: "google" })
      : outcome.returnTo;
  const response = NextResponse.redirect(new URL(landing, origin));
  response.cookies.set(GOOGLE_OAUTH_COOKIE, "", {
    ...GOOGLE_OAUTH_COOKIE_OPTIONS,
    maxAge: 0,
  });
  return response;
}
