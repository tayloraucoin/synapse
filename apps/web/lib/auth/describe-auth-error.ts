import { isUnmappedAuthError, mapAuthError } from "@syn/auth/errors";
import { createLogger } from "@syn/observability";

/**
 * The sentence an auth screen shows, and — in development — the reason behind
 * it in the console.
 *
 * WHY THIS EXISTS. `mapAuthError` deliberately never surfaces Supabase's own
 * message: those are written for a developer reading a log, and one of them
 * reaching a person is the failure that function exists to prevent. But
 * discarding it ON SCREEN and discarding it EVERYWHERE are different things,
 * and the second makes a failed sign-up undiagnosable without opening the
 * Network tab. Found the first time an account could not be created.
 *
 * IT LIVES IN THE APP, NOT IN `@syn/auth`. That package may not import
 * observability (conventions §6.2), and widening a package boundary for a
 * `console.log` would be the wrong trade — so the mapping stays pure and the
 * logging happens here, once, for all four auth screens.
 *
 * ONLY THE UNMAPPED CASE IS LOGGED. A recognised error already has a sentence
 * that says what happened; printing it again would be noise that trains
 * everyone to ignore the console. The fallback is the one that means "nobody
 * knows why", which is exactly when the raw cause is worth having.
 *
 * NOTHING A PERSON TYPED PASSES THROUGH HERE — Supabase's code and its own
 * words about the request, never the email, never the password.
 */

const log = createLogger("auth");

export function describeAuthError(error: {
  message?: string;
  code?: string;
}): string {
  const sentence = mapAuthError(error);

  if (isUnmappedAuthError(sentence)) {
    log.debugLog("unmapped auth error", {
      code: error.code ?? null,
      message: error.message ?? null,
    });
  }

  return sentence;
}
