/**
 * The callback's decision (USE-100, C6), apart from Next so it is tested
 * with nothing but a stub: the route hands it the query, the cookie and
 * whether someone is signed in, and `complete` (the exchange and the write)
 * runs only when every check passes. Anything refused stores nothing.
 */
import { timingSafeEqual } from "node:crypto";
import { decodeLinearOAuthCookie } from "./oauth-cookie";

export type LinearCallbackOutcome =
  | { kind: "connected"; returnTo: string }
  /** Cancelled at Linear: back to where it started, nothing said (connecting.md). */
  | { kind: "cancelled"; returnTo: string }
  | {
      kind: "failed";
      reason:
        | "signed-out"
        | "no-cookie"
        | "state"
        | "no-code"
        | "provider"
        | "exchange";
    };

export interface LinearCallbackInput {
  /** The callback's own URL, with Linear's `code`, `state` or `error`. */
  url: URL;
  /** The connect cookie's raw value, if the browser sent one. */
  cookie: string | undefined;
  signedIn: boolean;
}

function sameState(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function handleLinearCallback(
  input: LinearCallbackInput,
  complete: (code: string, verifier: string) => Promise<void>,
): Promise<LinearCallbackOutcome> {
  if (!input.signedIn) return { kind: "failed", reason: "signed-out" };

  const saved = decodeLinearOAuthCookie(input.cookie);
  // No cookie, a malformed one, or one without its verifier: refused.
  if (!saved) return { kind: "failed", reason: "no-cookie" };

  const state = input.url.searchParams.get("state");
  if (!state || !sameState(state, saved.state)) {
    return { kind: "failed", reason: "state" };
  }

  const error = input.url.searchParams.get("error");
  if (error === "access_denied") {
    return { kind: "cancelled", returnTo: saved.return };
  }
  if (error) return { kind: "failed", reason: "provider" };

  const code = input.url.searchParams.get("code");
  if (!code) return { kind: "failed", reason: "no-code" };

  try {
    await complete(code, saved.verifier);
  } catch {
    return { kind: "failed", reason: "exchange" };
  }
  return { kind: "connected", returnTo: saved.return };
}
