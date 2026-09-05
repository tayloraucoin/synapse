/**
 * The private storage buckets, and the grammar of a path inside them.
 *
 * Every bucket is private (`SCHEMA_REFERENCE.md` §7). There is no public URL
 * for an icon or an avatar and there is not meant to be: the promise is that
 * only the person can see their data, and a public bucket is a URL anyone who
 * has seen it can fetch forever.
 *
 * A STORED PATH IS BUCKET-QUALIFIED — `icons/{user_id}/{uuid}.jpg`. That is
 * what `SCHEMA_REFERENCE.md` §7 documents, what `habits.icon` and
 * `user_avatars.storage_path` hold, and what the read route's URL is built
 * from, so one string fully identifies an object and no caller has to carry a
 * bucket beside it. Supabase's own storage key is the same path WITHOUT the
 * leading bucket segment, which is the one place the two differ; `toStorageKey`
 * is that conversion and the only place it happens.
 *
 * THE SECOND SEGMENT IS THE OWNER'S ID. That is what the storage policies
 * match on, what the read route checks against the session, and what makes
 * orphan reaping a prefix scan if it is ever needed. The server builds every
 * path from the session's user id — a client never names one.
 */

/** The kind of image a caller is uploading, and the bucket it lands in. */
export const ASSET_BUCKET_BY_KIND = {
  icon: "icons",
  avatar: "avatars",
} as const;

export type AssetKind = keyof typeof ASSET_BUCKET_BY_KIND;
export type AssetBucket = (typeof ASSET_BUCKET_BY_KIND)[AssetKind];

/**
 * The buckets the read route will serve. `exports` is deliberately absent: a
 * data export is served by a short-lived signed URL because it opens in the
 * system browser, which carries no session cookie (SET-10).
 */
export const READABLE_ASSET_BUCKETS: ReadonlyArray<AssetBucket> = [
  "icons",
  "avatars",
];

/**
 * A stored object's file name. Conservative on purpose: this string is
 * concatenated into a storage path and into a URL, so anything that could
 * climb out of the owner's prefix (`..`, a slash, a leading dot) must not
 * match.
 */
export const ASSET_FILE_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export function isSafeAssetFileName(fileName: string): boolean {
  return (
    ASSET_FILE_NAME_PATTERN.test(fileName) &&
    !fileName.includes("..") &&
    fileName.length <= 128
  );
}

export type ParsedAssetPath = {
  bucket: AssetBucket;
  userId: string;
  fileName: string;
};

/** `icons/{user_id}/{uuid}.jpg` — the stored, bucket-qualified form. */
export function buildAssetPath(
  bucket: AssetBucket,
  userId: string,
  fileName: string,
): string {
  return `${bucket}/${userId}/${fileName}`;
}

/**
 * Parse a stored path, or null when it is not one this pipeline produced.
 *
 * Returning null rather than throwing is deliberate: every caller's answer to
 * a malformed path is "404", not "500".
 */
export function parseAssetPath(path: string): ParsedAssetPath | null {
  const segments = path.split("/");
  if (segments.length !== 3) return null;

  const [bucket, userId, fileName] = segments;
  if (!bucket || !userId || !fileName) return null;
  if (!(READABLE_ASSET_BUCKETS as readonly string[]).includes(bucket)) {
    return null;
  }
  if (!isSafeAssetFileName(fileName)) return null;

  return { bucket: bucket as AssetBucket, userId, fileName };
}

/** Drop the bucket segment: Supabase keys objects relative to the bucket. */
export function toStorageKey(parsed: ParsedAssetPath): string {
  return `${parsed.userId}/${parsed.fileName}`;
}
