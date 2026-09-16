import { z } from "zod";

import { USER_IMAGE_MAX_BYTES, USER_IMAGE_MIME_TYPES } from "@syn/constants";

/**
 * The upload rail's inputs — official spec §3.3 (a custom icon) and §9.8 (the
 * account photo), which share one pipeline and two buckets.
 *
 * THERE IS NO PATH INPUT ON `createUploadUrlInput`, and that is the point: the
 * server builds the path from the session's user id, so a caller cannot ask
 * for a URL that writes outside its own prefix. The only thing the client gets
 * to choose is which of the two kinds it is uploading.
 */

/** Plus `passage` — UX v1.2 §3.12 (TD-15): a passage's images, in their own bucket. */
export const assetKindSchema = z.enum(["icon", "avatar", "passage"]);

export type AssetKindInput = z.infer<typeof assetKindSchema>;

/** The allow-list is the bucket's own, so the two cannot drift. */
export const imageContentTypeSchema = z.enum(
  USER_IMAGE_MIME_TYPES as unknown as [string, ...string[]],
);

export const createUploadUrlInput = z.object({
  kind: assetKindSchema,
  contentType: imageContentTypeSchema,
});

export type CreateUploadUrlInput = z.infer<typeof createUploadUrlInput>;

/**
 * `setAvatar` takes the path the mint returned, not one the client composed.
 * The service checks the prefix again anyway — a value that made a round trip
 * through a browser is an untrusted value however it started life.
 */
export const setAvatarInput = z.object({
  path: z.string().min(1).max(512),
  byteSize: z.number().int().positive().max(USER_IMAGE_MAX_BYTES),
  contentType: imageContentTypeSchema,
});

export type SetAvatarInput = z.infer<typeof setAvatarInput>;
