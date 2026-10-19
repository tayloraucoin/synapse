import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * The undo token's envelope (USE-92): the payload as base64url JSON, a dot,
 * then its HMAC-SHA256 under `UNDO_TOKEN_KEY`. A client holds the token and
 * sends it back; it cannot change a byte of it without the key, so a forged
 * or edited token is refused before any row is read (Vigil, 2026-10-16).
 */

function macOf(body: string, key: string): Buffer {
  return createHmac("sha256", key).update(body).digest();
}

export function signToken(payload: unknown, key: string): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  return `${body}.${macOf(body, key).toString("base64url")}`;
}

/** The payload, or null when the token is malformed or its signature fails. */
export function openToken(token: string, key: string): unknown {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sent = Buffer.from(token.slice(dot + 1), "base64url");
  const expected = macOf(body, key);
  if (sent.length !== expected.length || !timingSafeEqual(sent, expected)) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}
