/**
 * Integration tokens at rest (USE-100, C5): AES-256-GCM, Node's `crypto`.
 *
 * ENVELOPE: version byte (1), 12-byte random IV, ciphertext, 16-byte tag,
 * stored as one `bytea`. The version byte lets a later key or scheme read
 * the old rows; the tag makes any tampering, or the wrong key, fail.
 *
 * ONLY `services/linear/` AND `services/google/` IMPORT THIS FILE: the
 * boundaries config refuses any other importer (`tokenCryptoConfig`), so
 * plaintext tokens exist only inside the two services that talk to the
 * providers. Neither returns one past its own module.
 *
 * A failed decrypt throws `TokenDecryptError` with a fixed message and no
 * cause, so neither the plaintext nor the key can reach a log.
 */
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { readApiEnv } from "../../env";

const VERSION = 1;
const IV_BYTES = 12;
const TAG_BYTES = 16;
const KEY_BYTES = 32;
const ALGORITHM = "aes-256-gcm";

export class TokenDecryptError extends Error {
  constructor() {
    super("A stored token could not be decrypted.");
    this.name = "TokenDecryptError";
  }
}

/** The key from `INTEGRATION_TOKEN_KEY`; throws naming the variable when it is unset or not 32 bytes. */
export function readTokenKey(): Buffer {
  const encoded = readApiEnv().INTEGRATION_TOKEN_KEY;
  if (!encoded) {
    throw new Error(
      "Missing INTEGRATION_TOKEN_KEY: 32 random bytes, base64, set per tier.",
    );
  }
  const key = Buffer.from(encoded, "base64");
  if (key.length !== KEY_BYTES) {
    throw new Error("INTEGRATION_TOKEN_KEY must decode to exactly 32 bytes.");
  }
  return key;
}

function assertKey(key: Buffer): void {
  if (key.length !== KEY_BYTES) {
    throw new Error("A token key is exactly 32 bytes.");
  }
}

/** A token's envelope: version, IV, ciphertext, tag. A fresh IV every call. */
export function encryptToken(plaintext: string, key: Buffer): Buffer {
  assertKey(key);
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const body = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  return Buffer.concat([Buffer.from([VERSION]), iv, body, cipher.getAuthTag()]);
}

/** The token back; a tampered envelope, a wrong key or an unknown version throws `TokenDecryptError`. */
export function decryptToken(envelope: Uint8Array, key: Buffer): string {
  assertKey(key);
  const bytes = Buffer.from(envelope);
  if (bytes.length < 1 + IV_BYTES + TAG_BYTES || bytes[0] !== VERSION) {
    throw new TokenDecryptError();
  }
  const iv = bytes.subarray(1, 1 + IV_BYTES);
  const tag = bytes.subarray(bytes.length - TAG_BYTES);
  const body = bytes.subarray(1 + IV_BYTES, bytes.length - TAG_BYTES);
  try {
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    // Nothing is returned until final() has checked the tag.
    const plain = Buffer.concat([decipher.update(body), decipher.final()]);
    return plain.toString("utf8");
  } catch {
    throw new TokenDecryptError();
  }
}
