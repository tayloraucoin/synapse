import { randomBytes } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  decryptToken,
  encryptToken,
  readTokenKey,
  TokenDecryptError,
} from "./token-crypto";

// USE-100 C3: AES-256-GCM, the envelope version byte, 12-byte IV,
// ciphertext and 16-byte tag.

const key = randomBytes(32);
const token = "lin_oauth_8f2c1d9e0a7b4c3d2e1f0a9b8c7d6e5f";

describe("C3: token-crypto", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("round-trips a token, with a fresh IV every time", () => {
    const one = encryptToken(token, key);
    const two = encryptToken(token, key);
    expect(decryptToken(one, key)).toBe(token);
    expect(decryptToken(two, key)).toBe(token);
    expect(one.equals(two)).toBe(false);
    expect(one[0]).toBe(1);
    expect(one.length).toBe(1 + 12 + Buffer.byteLength(token) + 16);
    expect(one.includes(Buffer.from(token))).toBe(false);
  });

  it("refuses a tampered ciphertext, tag, IV or version", () => {
    const envelope = encryptToken(token, key);
    for (const at of [0, 1, 13, envelope.length - 1]) {
      const tampered = Buffer.from(envelope);
      tampered[at] = tampered[at]! ^ 0x01;
      expect(() => decryptToken(tampered, key)).toThrow(TokenDecryptError);
    }
    expect(() => decryptToken(envelope.subarray(0, 20), key)).toThrow(
      TokenDecryptError,
    );
  });

  it("refuses the wrong key", () => {
    const envelope = encryptToken(token, key);
    expect(() => decryptToken(envelope, randomBytes(32))).toThrow(
      TokenDecryptError,
    );
  });

  it("never returns or names plaintext from a failed decrypt", () => {
    const envelope = Buffer.from(encryptToken(token, key));
    envelope[20] = envelope[20]! ^ 0xff;
    let caught: unknown;
    let returned: unknown;
    try {
      returned = decryptToken(envelope, key);
    } catch (error) {
      caught = error;
    }
    expect(returned).toBeUndefined();
    expect(caught).toBeInstanceOf(TokenDecryptError);
    const error = caught as Error;
    expect(error.message).not.toContain(token);
    expect(error.cause).toBeUndefined();
    expect(JSON.stringify(error)).not.toContain(token);
  });

  it("reads its key from INTEGRATION_TOKEN_KEY, 32 bytes, and names the variable when it is unset", () => {
    vi.stubEnv("INTEGRATION_TOKEN_KEY", key.toString("base64"));
    expect(readTokenKey().equals(key)).toBe(true);
    vi.stubEnv("INTEGRATION_TOKEN_KEY", randomBytes(16).toString("base64"));
    expect(() => readTokenKey()).toThrow(/32 bytes/);
    vi.stubEnv("INTEGRATION_TOKEN_KEY", "");
    expect(() => readTokenKey()).toThrow(/INTEGRATION_TOKEN_KEY/);
  });
});
