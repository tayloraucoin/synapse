/**
 * The connect's cookie (USE-100): the state, the PKCE verifier and where to
 * land, for ten minutes, between the start route and the callback.
 * httpOnly, Secure, SameSite=Lax (the provider's redirect back is a
 * top-level GET), scoped to the Linear integration's routes. Base64url JSON;
 * the verifier is never in a URL.
 */
import { z } from "zod";

export const LINEAR_OAUTH_COOKIE = "syn_linear_oauth";
export const LINEAR_OAUTH_COOKIE_PATH = "/api/integrations/linear";
export const LINEAR_OAUTH_COOKIE_MAX_AGE_S = 600;

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

export type LinearOAuthCookie = z.infer<typeof cookieValue>;

export const LINEAR_OAUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: LINEAR_OAUTH_COOKIE_PATH,
  maxAge: LINEAR_OAUTH_COOKIE_MAX_AGE_S,
} as const;

/** Whether a requested landing path is one of this site's. */
export function isLocalPath(value: string): boolean {
  return localPath.safeParse(value).success;
}

export function encodeLinearOAuthCookie(value: LinearOAuthCookie): string {
  return Buffer.from(JSON.stringify(cookieValue.parse(value))).toString(
    "base64url",
  );
}

/** The cookie's value, or null for anything missing, malformed or partial. */
export function decodeLinearOAuthCookie(
  raw: string | undefined | null,
): LinearOAuthCookie | null {
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
