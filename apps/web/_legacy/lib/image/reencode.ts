/**
 * The privacy-critical re-encode (v2 handoff §6.1, reuse CC).
 *
 * Every image a person uploads goes through here. Drawing through a canvas and
 * re-encoding drops every metadata block the original carried — EXIF, and with
 * it GPS coordinates and camera serials — because the output is built from
 * pixels alone. It also bounds the payload.
 *
 * This is the only place that transformation is implemented. A second copy
 * would be a second chance to forget why it exists.
 *
 * `imageOrientation: "from-image"` is explicit, because the default is
 * browser-dependent: stripping EXIF also strips the orientation flag, so the
 * rotation has to be baked into the pixels here or a phone photo arrives on
 * its side.
 *
 * Synapse's only image is a 256px item icon, so `maxDimension` is small and
 * the transform is cheap; the reason it exists is unchanged.
 */
"use client";

import { useSyncExternalStore } from "react";

const JPEG_QUALITY = 0.85;

export interface ReencodedImage {
  blob: Blob;
  width: number;
  height: number;
}

export async function reencodeToJpeg(
  file: File | Blob,
  maxDimension: number,
): Promise<ReencodedImage> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });

  const scale = Math.min(
    1,
    maxDimension / Math.max(bitmap.width, bitmap.height),
  );
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (context === null) {
    bitmap.close();
    throw new Error("canvas_unavailable");
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
  );
  if (blob === null) throw new Error("encode_failed");

  return { blob, width, height };
}

/** Feature probe — the affordance renders only where this transform works. */
export function isImageReencodeSupported(): boolean {
  return typeof createImageBitmap !== "undefined";
}

/**
 * Hydration-safe probe for UI gates. Server and the first client paint both
 * read false; after hydration the real capability applies, so the markup never
 * diverges.
 */
export function useImageReencodeSupported(): boolean {
  return useSyncExternalStore(
    () => () => {},
    isImageReencodeSupported,
    () => false,
  );
}
