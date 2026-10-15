/**
 * ImageCropper — the square crop step before an icon upload (v2 handoff §5.4).
 *
 * A 1:1 crop with pan and zoom, drawn to a canvas at `outputPx`. No library:
 * the whole job is one transform, one `drawImage`, and a pointer handler, and
 * a cropper package would be larger than the feature.
 *
 * WHY CROP AT ALL. Item icons are read at 24px in a column. An uncropped
 * landscape photo at 24px is a smear; letting a person choose which square
 * survives is the difference between an icon and a stain.
 *
 * The canvas output is a `Blob`, handed to `useIconUpload.commit`. EXIF is
 * dropped by construction — re-drawing through a canvas discards every tag,
 * which is also how the location a photo was taken stops travelling with it.
 *
 * `URL.revokeObjectURL` runs on unmount and on every new file; an object URL
 * that outlives its component pins the whole image in memory.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";
import { Text } from "../../../primitives/typography/text";

const VIEWPORT_PX = 256;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

export interface ImageCropperProps {
  file: File;
  outputPx?: 256;
  onCrop: (blob: Blob) => void;
  onCancel: () => void;
  className?: string;
}

export function ImageCropper({
  file,
  outputPx = 256,
  onCrop,
  onCancel,
  className,
}: ImageCropperProps) {
  const [url, setUrl] = React.useState<string | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [error, setError] = React.useState<string | null>(null);
  const imageRef = React.useRef<HTMLImageElement | null>(null);
  const dragFrom = React.useRef<{ x: number; y: number } | null>(null);

  React.useEffect(() => {
    const next = URL.createObjectURL(file);
    setUrl(next);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setError(null);
    return () => URL.revokeObjectURL(next);
  }, [file]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragFrom.current = {
      x: event.clientX - offset.x,
      y: event.clientY - offset.y,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragFrom.current === null) return;
    setOffset({
      x: event.clientX - dragFrom.current.x,
      y: event.clientY - dragFrom.current.y,
    });
  };

  const onPointerUp = () => {
    dragFrom.current = null;
  };

  const crop = () => {
    const image = imageRef.current;
    if (image === null) return;

    const canvas = document.createElement("canvas");
    canvas.width = outputPx;
    canvas.height = outputPx;
    const context = canvas.getContext("2d");
    if (context === null) {
      setError("Couldn't read that image — try a different one.");
      return;
    }

    /**
     * The preview is `object-cover` in a square viewport: the image is scaled
     * so its shorter side fills, then translated. The same two numbers scaled
     * from viewport to output reproduce it exactly.
     */
    const cover = Math.max(
      VIEWPORT_PX / image.naturalWidth,
      VIEWPORT_PX / image.naturalHeight,
    );
    const scale = cover * zoom * (outputPx / VIEWPORT_PX);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const ratio = outputPx / VIEWPORT_PX;

    context.drawImage(
      image,
      (outputPx - drawWidth) / 2 + offset.x * ratio,
      (outputPx - drawHeight) / 2 + offset.y * ratio,
      drawWidth,
      drawHeight,
    );

    canvas.toBlob((blob) => {
      if (blob === null) {
        setError("Couldn't read that image — try a different one.");
        return;
      }
      onCrop(blob);
    }, "image/jpeg", 0.9);
  };

  return (
    <div className={cn("flex flex-col gap-(--space-3)", className)}>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={cn(
          "relative size-64 touch-none overflow-hidden rounded-(--radius)",
          "bg-surface",
        )}
      >
        {url === null ? null : (
          // A plain <img>: the source is a local object URL, which next/image
          // cannot optimise anyway, and @syn/ui stays platform-agnostic.
          <img
            ref={imageRef}
            src={url}
            alt=""
            draggable={false}
            onError={() =>
              setError("Couldn't read that image — try a different one.")
            }
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            }}
            className="size-full object-cover select-none"
          />
        )}
      </div>

      {/*
        Zoom is two buttons, not a range input. Official spec §9.7 rules out
        sliders, and although that rule is about values a person records, a
        slider here would also be the hardest control on the screen to use
        one-handed — which is the hand holding the phone that took the photo.
      */}
      <div role="group" aria-label="Zoom" className="flex items-center gap-(--space-2)">
        <Button
          variant="secondary"
          size="icon"
          aria-label="Zoom out"
          disabled={zoom <= MIN_ZOOM}
          onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
        >
          −
        </Button>
        <Text as="span" variant="secondary" tone="secondary" className="tabular-nums">
          {zoom.toFixed(1)}×
        </Text>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Zoom in"
          disabled={zoom >= MAX_ZOOM}
          onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
        >
          +
        </Button>
      </div>

      {error === null ? null : (
        <Text as="p" variant="caption" role="alert">
          {error}
        </Text>
      )}

      <div className="flex gap-(--space-2)">
        <Button variant="secondary" onClick={onCancel}>
          Choose another
        </Button>
        <Button onClick={crop}>Use image</Button>
      </div>
    </div>
  );
}
