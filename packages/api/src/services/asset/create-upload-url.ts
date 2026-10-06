import { randomUUID } from "node:crypto";

import {
  ASSET_BUCKET_BY_KIND,
  buildAssetPath,
  type AssetKind,
} from "@syn/constants";

import { createSignedUpload } from "./storage";

/**
 * Mint a place to put one image.
 *
 * THE SERVER NAMES THE PATH. The bucket comes from the kind and the owner
 * segment comes from the session's user id, so a caller cannot obtain a URL
 * that writes into someone else's folder — not by asking for one, and not by
 * tampering with the response. The file name is a fresh uuid, which is also
 * what makes the read route's `immutable` cache header safe: a replaced icon
 * is a new path, never the same path with new bytes.
 *
 * The extension is derived from the content type rather than trusted from a
 * file name, because the only file name in play is the one built here.
 */

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type CreatedUpload = {
  /** Bucket-qualified — store this on the row that owns the image. */
  path: string;
  /** Where the browser PUTs the bytes. */
  uploadUrl: string;
  /** Bearer token the signed URL expects. */
  token: string;
};

export async function createUploadUrl(
  userId: string,
  input: { kind: AssetKind; contentType: string },
): Promise<CreatedUpload> {
  const bucket = ASSET_BUCKET_BY_KIND[input.kind];
  const extension = EXTENSION_BY_CONTENT_TYPE[input.contentType] ?? "jpg";
  const fileName = `${randomUUID()}.${extension}`;

  const signed = await createSignedUpload(bucket, `${userId}/${fileName}`);

  return {
    // The row stores the bucket-qualified form; Supabase signed the key.
    path: buildAssetPath(bucket, userId, fileName),
    uploadUrl: signed.uploadUrl,
    token: signed.token,
  };
}
