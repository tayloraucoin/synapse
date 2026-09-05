import { eq } from "drizzle-orm";

import { userAvatars, type RlsClient } from "@syn/db";
import { ASSET_BUCKET_BY_KIND, parseAssetPath } from "@syn/constants";
import { createLogger } from "@syn/observability";

import { removeObject } from "../asset/storage";

/**
 * The account photo — official spec §9.8, set from ST-01 (SET-8).
 *
 * One row per person (`user_avatars.user_id` IS the primary key), so setting a
 * photo is an upsert and there is no "which avatar" to get wrong.
 *
 * THE PATH IS RE-CHECKED HERE. It was minted by `asset.createUploadUrl`, but
 * it made a round trip through a browser to get back, and a value that has
 * been outside the server is an untrusted value however it started life. A
 * path whose first segment is not the caller is refused.
 */

const log = createLogger("api/user/avatar");

export type UserAvatarRow = {
  storagePath: string;
  contentType: string;
  byteSize: number;
};

/**
 * Is this a path in the avatars bucket, owned by this person?
 *
 * Three things have to hold, and all three are cheap: the path parses as one
 * this pipeline produced, its bucket is `avatars` (not `icons`, and certainly
 * not `exports`), and its owner segment is the caller.
 */
export function isOwnedAssetPath(path: string, userId: string): boolean {
  const parsed = parseAssetPath(path);
  return (
    parsed !== null &&
    parsed.bucket === ASSET_BUCKET_BY_KIND.avatar &&
    parsed.userId === userId
  );
}

export async function readAvatar(
  rls: RlsClient,
  userId: string,
): Promise<UserAvatarRow | null> {
  const rows = await rls.execute((tx) =>
    tx
      .select({
        storagePath: userAvatars.storagePath,
        contentType: userAvatars.contentType,
        byteSize: userAvatars.byteSize,
      })
      .from(userAvatars)
      .where(eq(userAvatars.userId, userId))
      .limit(1),
  );
  return rows[0] ?? null;
}

/**
 * Point the account at a newly uploaded photo and drop the one it replaces.
 *
 * The delete is BEST EFFORT and happens after the row is written: the row is
 * the fact that matters, and orphaned bytes in a private bucket are a tidiness
 * problem, not a correctness or a privacy one. Failing the person's "change my
 * photo" because a delete 500'd would be the wrong trade.
 */
export async function setAvatar(
  rls: RlsClient,
  userId: string,
  input: { path: string; byteSize: number; contentType: string },
): Promise<UserAvatarRow> {
  const previous = await readAvatar(rls, userId);

  const rows = await rls.execute((tx) =>
    tx
      .insert(userAvatars)
      .values({
        userId,
        storagePath: input.path,
        contentType: input.contentType,
        byteSize: input.byteSize,
      })
      .onConflictDoUpdate({
        target: userAvatars.userId,
        set: {
          storagePath: input.path,
          contentType: input.contentType,
          byteSize: input.byteSize,
          updatedAt: new Date(),
        },
      })
      .returning({
        storagePath: userAvatars.storagePath,
        contentType: userAvatars.contentType,
        byteSize: userAvatars.byteSize,
      }),
  );

  const row = rows[0];
  if (!row) {
    throw new Error("user_avatars upsert returned no row");
  }

  if (previous && previous.storagePath !== input.path) {
    const removed = await removeObject(previous.storagePath);
    if (!removed) {
      // The path names a bucket and a uuid — no personal content in it.
      log.log("avatar replaced; old object not removed", {
        path: previous.storagePath,
      });
    }
  }

  return row;
}

/** Removing the photo removes both the row and the bytes; initials return. */
export async function removeAvatar(
  rls: RlsClient,
  userId: string,
): Promise<void> {
  const previous = await readAvatar(rls, userId);

  await rls.execute((tx) =>
    tx.delete(userAvatars).where(eq(userAvatars.userId, userId)),
  );

  if (previous) {
    const removed = await removeObject(previous.storagePath);
    if (!removed) {
      log.log("avatar row deleted; object not removed", {
        path: previous.storagePath,
      });
    }
  }
}
