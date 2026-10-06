import { createUploadUrlInput } from "@syn/validators";

import { createUploadUrl } from "../services/asset/create-upload-url";
import { protectedProcedure, router } from "../trpc";

/**
 * The upload rail. One procedure, and it is boring on purpose: validate, call
 * the service, return.
 *
 * There is no `deleteObject` procedure and no `listObjects`. The only things
 * that remove an object are replacing an avatar and removing one, both on the
 * `user` router where the row that owns the path lives.
 */
export const assetRouter = router({
  /**
   * Mint a signed URL for one image. The caller PUTs the bytes to `uploadUrl`
   * and then stores the returned `path` on whichever row owns it — a habit's
   * `icon`, or `user_avatars` via `user.setAvatar`.
   */
  createUploadUrl: protectedProcedure
    .input(createUploadUrlInput)
    .mutation(async ({ ctx, input }) =>
      createUploadUrl(ctx.authContext.userId, input),
    ),
});
