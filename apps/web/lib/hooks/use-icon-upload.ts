/**
 * useIconUpload — pick, crop, park, commit (adapt CC `useAvatarUpload`).
 *
 * CC's pick/commit/discard grammar, kept whole because the reason for it is
 * Synapse's reason too: an icon can only be stored against a row, and on
 * LB-02's create path the habit does not exist yet. So `pick` re-encodes and
 * parks the image with a local preview, and the caller decides when to
 * `commit` — immediately when editing, after the create mutation lands when
 * creating. Nothing touches the bucket early.
 *
 * SYNAPSE'S CHANGES:
 *  - 256px, not 1024. An item icon is drawn at 24px in a list and at 48px in
 *    a picker well; 256 covers a 3× display with room to spare, and the
 *    smaller bound makes the upload finish inside the sheet.
 *  - `pick` takes an already-cropped `Blob` from `ImageCropper` as well as a
 *    raw `File`, because Synapse crops square before encoding.
 *
 * NOTHING HERE THROWS. The icon is optional on every surface, and losing it
 * must never cost a person their place in a flow.
 *
 * A pick still encoding when the caller commits is still the person's intent:
 * `commit` awaits the in-flight encode before reading what is parked, so a
 * fast Save on a large photo cannot silently drop it.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { reencodeToJpeg, useImageReencodeSupported } from "../image/reencode";

const MAX_DIMENSION = 256;
/** Sanity bound on the raw picked file, pre-encode. */
const MAX_PICKED_BYTES = 25 * 1024 * 1024;

export const ICON_ACCEPT = "image/png,image/jpeg,image/webp,image/heic";

export type IconUploadStatus = "idle" | "processing" | "uploading";

export interface UseIconUploadOptions {
  /** Sends the parked blob. Returns the stored key, or null on failure. */
  upload: (blob: Blob) => Promise<string | null>;
}

export function useIconUpload({ upload }: UseIconUploadOptions) {
  const supported = useImageReencodeSupported();
  const [status, setStatus] = useState<IconUploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const pendingRef = useRef<Blob | null>(null);
  const encodingRef = useRef<Promise<unknown> | null>(null);
  /** Mirrors previewUrl so unmount cleanup does not re-subscribe the effect. */
  const previewRef = useRef<string | null>(null);
  previewRef.current = previewUrl;

  useEffect(
    () => () => {
      if (previewRef.current !== null) URL.revokeObjectURL(previewRef.current);
    },
    [],
  );

  /** Re-encode and park one image, replacing any previously parked one. */
  const pick = useCallback(async (file: File | Blob): Promise<boolean> => {
    if (file.size > MAX_PICKED_BYTES) {
      setError("That image is too large.");
      return false;
    }
    setError(null);
    setStatus("processing");

    const encoding = (async () => {
      try {
        const { blob } = await reencodeToJpeg(file, MAX_DIMENSION);
        pendingRef.current = blob;
        setPreviewUrl((current) => {
          if (current !== null) URL.revokeObjectURL(current);
          return URL.createObjectURL(blob);
        });
        return true;
      } catch {
        setError("Couldn't read that image — try a different one.");
        return false;
      } finally {
        setStatus("idle");
      }
    })();

    encodingRef.current = encoding;
    return encoding;
  }, []);

  /** Sends the parked image. Resolves to null when nothing is parked. */
  const commit = useCallback(async (): Promise<string | null> => {
    await encodingRef.current;
    const blob = pendingRef.current;
    if (blob === null) return null;

    setStatus("uploading");
    setError(null);
    try {
      const key = await upload(blob);
      if (key === null) throw new Error("upload_failed");
      pendingRef.current = null;
      return key;
    } catch {
      setError("Couldn't save that image — you can add it in Settings.");
      return null;
    } finally {
      setStatus("idle");
    }
  }, [upload]);

  const discard = useCallback(() => {
    pendingRef.current = null;
    setPreviewUrl((current) => {
      if (current !== null) URL.revokeObjectURL(current);
      return null;
    });
    setError(null);
  }, []);

  return {
    status,
    busy: status !== "idle",
    error,
    /** Local object URL for a parked image — the optimistic preview. */
    previewUrl,
    hasPending: previewUrl !== null,
    pick,
    commit,
    discard,
    supported,
  };
}
