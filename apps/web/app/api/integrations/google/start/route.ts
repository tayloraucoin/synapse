import { NextResponse } from "next/server";
import {
  GOOGLE_OAUTH_COOKIE,
  GOOGLE_OAUTH_COOKIE_OPTIONS,
  isLocalPath,
  startGoogleConnect,
} from "@syn/api";
import { createLogger } from "@syn/observability";
import { env } from "@/env";
import { getRequestAuthContextFromRequest } from "@/lib/auth/get-request-context";
import {
  connectionsRoute,
  googleConnectCallbackRoute,
  signInRoute,
} from "@/lib/routes";

export const runtime = "nodejs";

const log = createLogger("web/integrations/google/start");

/**
 * "+ Add a Google account" (USE-103): signed in only. Sets the connect
 * cookie (state, PKCE verifier, where to land; httpOnly, Secure,
 * SameSite=Lax, ten minutes) and redirects to Google's consent screen for
 * the read-only pair. Google Calendar's own client, never sign-in's.
 */
export async function GET(request: Request) {
  const auth = await getRequestAuthContextFromRequest(request);
  const origin = env.siteUrl;
  if (!auth) {
    return NextResponse.redirect(
      new URL(signInRoute(connectionsRoute()), origin),
    );
  }

  const asked = new URL(request.url).searchParams.get("return");
  const returnTo = asked && isLocalPath(asked) ? asked : connectionsRoute();

  try {
    const { authorizeUrl, cookie } = startGoogleConnect({
      redirectUri: new URL(googleConnectCallbackRoute(), origin).toString(),
      returnTo,
    });
    const response = NextResponse.redirect(authorizeUrl);
    response.cookies.set(
      GOOGLE_OAUTH_COOKIE,
      cookie,
      GOOGLE_OAUTH_COOKIE_OPTIONS,
    );
    return response;
  } catch (error) {
    // An unset client or key: the connect fails where it was asked for.
    log.log("start failed", {
      name: error instanceof Error ? error.name : typeof error,
    });
    return NextResponse.redirect(
      new URL(connectionsRoute({ failed: "google" }), origin),
    );
  }
}
