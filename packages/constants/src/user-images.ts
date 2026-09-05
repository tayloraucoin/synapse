/**
 * Limits for the user-contributed images the product stores: the account
 * avatar (official spec §9.8) and custom habit icons (§3.3, §9.9).
 *
 * They live here, below the data layer, because both ends of every one of
 * these rules need them: the service that enforces the cap and the MIME
 * allowlist, and the client leaf that renders the file picker.
 */

/** Server-side allowlist; also the client picker's `accept` string. */
export const USER_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const USER_IMAGE_ACCEPT_ATTRIBUTE = USER_IMAGE_MIME_TYPES.join(",");

/** Matches the declared bucket limit in the storage-buckets SQL. */
export const USER_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
