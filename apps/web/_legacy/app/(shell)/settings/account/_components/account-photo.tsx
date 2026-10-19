"use client";

import * as React from "react";

import { Avatar, Button, HelperText, ImageCropper, ResponsiveSheet } from "@syn/ui";

import { ICON_ACCEPT, useIconUpload } from "@/lib/hooks/use-icon-upload";
import { trpc } from "@/lib/trpc/client";

import { SETTINGS_COPY as COPY } from "../../_components/copy";

/**
 * ST-01's photo — the second and last place an avatar appears (official spec
 * §9.8; the other is the 32px header).
 *
 * IT IS THE SAME PIPELINE AS A HABIT ICON: pick, crop square, re-encode to
 * 256px JPEG, PUT to a server-minted URL, then name the stored path on the
 * account. Nothing here knows a bucket name or holds a key.
 *
 * *CHANGE PHOTO* IS A LABELLED BUTTON, NOT A CLICK ON THE IMAGE. An avatar
 * that silently opens a file picker is a control nobody can find and a screen
 * reader cannot describe.
 *
 * A FAILED UPLOAD KEEPS THE OLD PHOTO. The image is the optional half of an
 * account; losing the one that was already there because a new one failed
 * would be a worse outcome than not changing it.
 */
export function AccountPhoto({ name }: { name: string }) {
  const utils = trpc.useUtils();
  const avatar = trpc.user.avatar.useQuery();
  const createUploadUrl = trpc.asset.createUploadUrl.useMutation();
  const setAvatar = trpc.user.setAvatar.useMutation();
  const removeAvatar = trpc.user.removeAvatar.useMutation();

  const [picked, setPicked] = React.useState<File | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const upload = useIconUpload({
    upload: async (blob) => {
      try {
        const minted = await createUploadUrl.mutateAsync({
          kind: "avatar",
          contentType: "image/jpeg",
        });
        const put = await fetch(minted.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": "image/jpeg" },
          body: blob,
        });
        if (!put.ok) return null;
        await setAvatar.mutateAsync({
          path: minted.path,
          byteSize: blob.size,
          contentType: "image/jpeg",
        });
        return minted.path;
      } catch {
        return null;
      }
    },
  });

  const storedUrl = avatar.data ? `/api/assets/${avatar.data}` : null;

  return (
    <div className="flex items-center gap-(--space-4)">
      <Avatar size={64} name={name} src={upload.previewUrl ?? storedUrl} />

      <div className="flex flex-col items-start gap-(--space-2)">
        <input
          ref={inputRef}
          type="file"
          accept={ICON_ACCEPT}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) setPicked(file);
            // Reset so picking the same file twice fires a change again.
            event.target.value = "";
          }}
        />
        <Button
          variant="secondary"
          busy={upload.busy}
          onClick={() => inputRef.current?.click()}
        >
          {COPY.changePhoto}
        </Button>

        {storedUrl === null ? null : (
          <Button
            variant="ghost"
            busy={removeAvatar.isPending}
            onClick={() => {
              void removeAvatar.mutateAsync().then(async () => {
                upload.discard();
                await utils.user.avatar.invalidate();
                await utils.shell.status.invalidate();
              });
            }}
          >
            {COPY.removePhoto}
          </Button>
        )}

        {upload.error === null ? null : (
          <HelperText error>{upload.error}</HelperText>
        )}
      </div>

      <ResponsiveSheet
        open={picked !== null}
        onOpenChange={(next) => {
          if (!next) setPicked(null);
        }}
        title={COPY.changePhoto}
      >
        {picked === null ? null : (
          <ImageCropper
            file={picked}
            onCancel={() => setPicked(null)}
            onCrop={(blob) => {
              setPicked(null);
              void upload.pick(blob).then(async (ok) => {
                if (!ok) return;
                const stored = await upload.commit();
                if (stored === null) return;
                await utils.user.avatar.invalidate();
                await utils.shell.status.invalidate();
              });
            }}
          />
        )}
      </ResponsiveSheet>
    </div>
  );
}
