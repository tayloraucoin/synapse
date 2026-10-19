/**
 * The Google connect's cookie (USE-103), as Linear's (USE-100): the state,
 * the PKCE verifier and where to land, for ten minutes, between the start
 * route and the callback. httpOnly, Secure, SameSite=Lax, scoped to the
 * Google integration's routes. Base64url JSON; the verifier is never in a URL.
 */
import { z } from "zod";

export const GOOGLE_OAUTH_COOKIE = "syn_google_oauth";
export const GOOGLE_OAUTH_COOKIE_PATH = "/api/integrations/google";
export const GOOGLE_OAUTH_COOKIE_MAX_AGE_S = 600;

/** A path on this site, never another origin (`//host`, `/\host`). */
const localPath = z
  .string()
  .max(512)
  .regex(/^\/(?![/\\])[^\s\\]*$/);

const cookieValue = z.object({
  state: z.string().min(32),
  verifier: z.string().min(43).max(128),
  return: localPath,
});

export type GoogleOAuthCookie = z.infer<typeof cookieValue>;

export const GOOGLE_OAUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: GOOGLE_OAUTH_COOKIE_PATH,
  maxAge: GOOGLE_OAUTH_COOKIE_MAX_AGE_S,
} as const;

export function encodeGoogleOAuthCookie(value: GoogleOAuthCookie): string {
  return Buffer.from(JSON.stringify(cookieValue.parse(value))).toString(
    "base64url",
  );
}

/** The cookie's value, or null for anything missing, malformed or partial. */
export function decodeGoogleOAuthCookie(
  raw: string | undefined | null,
): GoogleOAuthCookie | null {
  if (!raw) return null;
  try {
    const parsed = cookieValue.safeParse(
      JSON.parse(Buffer.from(raw, "base64url").toString("utf8")),
    );
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
