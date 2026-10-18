/**
 * THE ONLY `process.env` READER IN `@syn/api` FOR WHAT IT ADDS (MIG-6's
 * seam). USE-100 starts it with the integrations; MIG-17 moves Web Push's
 * three reads here.
 *
 * Server-only: the web app imports `@syn/api` from server code, and its
 * client files import only types. Nothing here is `NEXT_PUBLIC_`.
 *
 * Read when used, not at import, so a type-check, a test or a build with no
 * secrets succeeds; the thing that needs a value throws naming it.
 */
import { z } from "zod";

const schema = z.object({
  /** 32 random bytes, base64: AES-256-GCM's key for every stored token (C5). */
  INTEGRATION_TOKEN_KEY: z.string().min(1).optional(),
  /** The Linear OAuth application's client id (public; PKCE, no secret). */
  LINEAR_CLIENT_ID: z.string().min(1).optional(),
  /**
   * Google Calendar's own OAuth client (USE-103): a Web application client
   * in its own Cloud project, never the sign-in's. Google's token endpoint
   * asks for the secret beside PKCE.
   */
  GOOGLE_CALENDAR_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CALENDAR_CLIENT_SECRET: z.string().min(1).optional(),
});

export type ApiEnv = z.infer<typeof schema>;

export function readApiEnv(): ApiEnv {
  return schema.parse({
    INTEGRATION_TOKEN_KEY: process.env.INTEGRATION_TOKEN_KEY || undefined,
    LINEAR_CLIENT_ID: process.env.LINEAR_CLIENT_ID || undefined,
    GOOGLE_CALENDAR_CLIENT_ID:
      process.env.GOOGLE_CALENDAR_CLIENT_ID || undefined,
    GOOGLE_CALENDAR_CLIENT_SECRET:
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET || undefined,
  });
}
