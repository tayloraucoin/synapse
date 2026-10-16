import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  finishLinearConnect,
  handleLinearCallback,
  LINEAR_OAUTH_COOKIE,
  LINEAR_OAUTH_COOKIE_OPTIONS,
} from "@syn/api";
import { createLogger } from "@syn/observability";
import { env } from "@/env";
import { getRequestAuthContextFromRequest } from "@/lib/auth/get-request-context";
import { connectionsRoute, linearConnectCallbackRoute } from "@/lib/routes";

export const runtime = "nodejs";

const log = createLogger("web/integrations/linear/callback");

/**
 * Linear's redirect back (USE-100). `handleLinearCallback` refuses a missing
 * or mismatched state, a missing verifier or code, or a signed-out caller,
 * before anything is exchanged or stored; then the code is exchanged, the
 * workspace read and the connection upserted inside RLS. The cookie is
 * cleared every time. Connected or cancelled lands where the connect began;
 * anything else on Connections' "Not connected. Try again."
 */
export async function GET(request: Request) {
  const origin = env.siteUrl;
  const url = new URL(request.url);
  const cookieStore = await cookies();
  const auth = await getRequestAuthContextFromRequest(request);

  const outcome = await handleLinearCallback(
    {
      url,
      cookie: cookieStore.get(LINEAR_OAUTH_COOKIE)?.value,
      signedIn: auth !== null,
    },
    async (code, verifier) => {
      if (!auth) throw new Error("Signed out.");
      await finishLinearConnect(auth.rls, auth.authContext.userId, {
        code,
        verifier,
        redirectUri: new URL(linearConnectCallbackRoute(), origin).toString(),
      });
    },
  );

  if (outcome.kind === "failed") {
    log.log("connect refused", { reason: outcome.reason });
  }
  const landing =
    outcome.kind === "failed"
      ? connectionsRoute({ failed: "linear" })
      : outcome.returnTo;
  const response = NextResponse.redirect(new URL(landing, origin));
  response.cookies.set(LINEAR_OAUTH_COOKIE, "", {
    ...LINEAR_OAUTH_COOKIE_OPTIONS,
    maxAge: 0,
  });
  return response;
}
