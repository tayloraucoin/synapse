import { USER_IMAGE_MIME_TYPES } from "@syn/constants";
import { displayNameSchema } from "@syn/validators";
import { avatarImageUrl } from "@/lib/assets/icon-url";
import { AccountNameRefusal } from "@/lib/data/refusals";
import type { AccountView } from "@/lib/data/use-account";
import type { TrpcClient } from "@/lib/trpc/client";
import type { LiveDomain } from "./domains";
import { callLive } from "./errors";

/**
 * The account, live (USE-97): `AccountView` from `user.me` and `user.avatar`,
 * the name through `user.updatePreferences`, and the photo as the old app
 * sent it: `asset.createUploadUrl`, a PUT of the cropped bytes to the minted
 * URL, then `user.setAvatar` with the minted path. No bytes pass through tRPC.
 */

/** The photo upload failed at the storage PUT; the sheet shows not-saved. */
export class PhotoUploadError extends Error {
  constructor(status: number) {
    super(`The photo did not upload (${status}).`);
    this.name = "PhotoUploadError";
  }
}

const IMAGE_TYPES: readonly string[] = USER_IMAGE_MIME_TYPES;

/** The blob's own type when the bucket takes it; the cropper's JPEG otherwise. */
function photoType(photo: Blob): string {
  return IMAGE_TYPES.includes(photo.type) ? photo.type : "image/jpeg";
}

export async function readLiveAccount(
  client: TrpcClient,
): Promise<AccountView> {
  const [me, avatar] = await Promise.all([
    client.user.me.query(),
    client.user.avatar.query(),
  ]);
  return {
    name: me.displayName ?? "",
    email: me.email ?? "",
    photoUrl: avatarImageUrl(avatar?.storagePath),
  };
}

export const accountDomain = {
  name: "account",
  methods: (client) => ({
    readAccount: () => readLiveAccount(client),

    async writeAccountName(raw) {
      const parsed = displayNameSchema.safeParse(raw);
      if (!parsed.success) {
        throw new AccountNameRefusal(
          parsed.error.issues[0]?.message ?? "Invalid name.",
        );
      }
      await callLive("accountName", () =>
        client.user.updatePreferences.mutate({ displayName: parsed.data }),
      );
      return readLiveAccount(client);
    },

    async uploadAccountPhoto(photo) {
      const contentType = photoType(photo);
      const minted = await client.asset.createUploadUrl.mutate({
        kind: "avatar",
        contentType,
      });
      const put = await fetch(minted.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: photo,
      });
      if (!put.ok) throw new PhotoUploadError(put.status);
      await client.user.setAvatar.mutate({
        path: minted.path,
        byteSize: photo.size,
        contentType,
      });
      return readLiveAccount(client);
    },
  }),
} satisfies LiveDomain;
