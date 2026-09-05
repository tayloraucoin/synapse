/**
 * The Supabase OAuth / PKCE-code callback — where Google sign-in lands.
 *
 * Email links do NOT come here; they carry a `token_hash` and land on
 * `../confirm`. Two endpoints because they verify two different things.
 */

import { type NextRequest, NextResponse } from "next/server";

import { createLogger } from "@syn/observability";
import { sanitizeNextPath } from "@syn/utils";

import {
  appendAuthQuery,
  createSupabaseForResponse,
  provisionUserFromSession,
} from "@/lib/auth/auth-redirect-response";
import { signInRoute } from "@/lib/routes";

/** Presence only — never the code itself, which is a credential. */
const log = createLogger("web/auth/callback");

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // `next` arrives from a URL, so it is untrusted: sanitize before it can
  // become an open redirect.
  const next = sanitizeNextPath(searchParams.get("next"), "/");

  log.debugLog("auth callback", { codePresent: Boolean(code), next });

  if (!code) {
    return NextResponse.redirect(
      `${origin}${appendAuthQuery(signInRoute(next), "auth", "missing_code")}`,
    );
  }

  const response = NextResponse.redirect(`${origin}${next}`);
  const supabase = createSupabaseForResponse(request, response);

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    log.log("exchangeCodeForSession failed", {
      message: error.message,
      code: error.code ?? null,
    });
    return NextResponse.redirect(
      `${origin}${appendAuthQuery(signInRoute(next), "auth", "error")}`,
    );
  }

  log.debugLog("session exchanged → redirect", { next });
  await provisionUserFromSession(supabase);

  return response;
}
