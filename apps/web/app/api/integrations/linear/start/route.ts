import { NextResponse } from "next/server";
import {
  isLocalPath,
  LINEAR_OAUTH_COOKIE,
  LINEAR_OAUTH_COOKIE_OPTIONS,
  startLinearConnect,
} from "@syn/api";
import { createLogger } from "@syn/observability";
import { env } from "@/env";
import { getRequestAuthContextFromRequest } from "@/lib/auth/get-request-context";
import {
  connectionsRoute,
  linearConnectCallbackRoute,
  signInRoute,
} from "@/lib/routes";

export const runtime = "nodejs";

const log = createLogger("web/integrations/linear/start");

/**
 * "+ Add a workspace" (USE-100): signed in only. Sets the connect cookie
 * (state, PKCE verifier, where to land; httpOnly, Secure, SameSite=Lax, ten
 * minutes) and redirects to Linear's consent screen. A route handler, since
 * the provider's redirect back can only reach a route.
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
    const { authorizeUrl, cookie } = startLinearConnect({
      redirectUri: new URL(linearConnectCallbackRoute(), origin).toString(),
      returnTo,
    });
    const response = NextResponse.redirect(authorizeUrl);
    response.cookies.set(
      LINEAR_OAUTH_COOKIE,
      cookie,
      LINEAR_OAUTH_COOKIE_OPTIONS,
    );
    return response;
  } catch (error) {
    // An unset client id or key: the connect fails where it was asked for.
    log.log("start failed", {
      name: error instanceof Error ? error.name : typeof error,
    });
    return NextResponse.redirect(
      new URL(connectionsRoute({ failed: "linear" }), origin),
    );
  }
}
