/**
 * Email-link confirmation (the `token_hash` flow).
 *
 * Supabase's email templates link to
 * `<origin>/auth/confirm?next=…&token_hash=…&type=…`. Verifying server-side
 * sets the session cookies on the redirect response, so the person lands on
 * `next` already signed in — from any browser, including one that never had
 * the sign-up tab open.
 *
 * `magiclink` is in the accepted type list even though Synapse has no
 * magic-link sign-in (official spec §4.1). Supabase's recovery and confirm
 * flows share this endpoint and can present that type; accepting it is not
 * offering it.
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

/** Presence only — never the token itself. */
const log = createLogger("web/auth/confirm");

const EMAIL_OTP_TYPES = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
] as const;

type EmailOtpLinkType = (typeof EMAIL_OTP_TYPES)[number];

function parseOtpType(raw: string | null): EmailOtpLinkType {
  return EMAIL_OTP_TYPES.find((candidate) => candidate === raw) ?? "email";
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = parseOtpType(searchParams.get("type"));
  const next = sanitizeNextPath(searchParams.get("next"), "/");

  log.debugLog("auth confirm", {
    tokenPresent: Boolean(tokenHash),
    type,
    next,
  });

  if (!tokenHash) {
    return NextResponse.redirect(
      `${origin}${appendAuthQuery(signInRoute(next), "auth", "missing_code")}`,
    );
  }

  const successResponse = NextResponse.redirect(`${origin}${next}`);
  const supabase = createSupabaseForResponse(request, successResponse);

  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (error) {
    log.log("verifyOtp failed", {
      message: error.message,
      code: error.code ?? null,
    });
    // An expired or already-used link. Deliberately no signOut and no
    // cookie-clear: on a double-click the first click already established a
    // valid session, and clearing here would sign the person out of the
    // session the link just gave them.
    return NextResponse.redirect(
      `${origin}${appendAuthQuery(signInRoute(next), "auth", "link_expired")}`,
    );
  }

  log.debugLog("otp verified → redirect", { next });
  await provisionUserFromSession(supabase);

  return successResponse;
}
