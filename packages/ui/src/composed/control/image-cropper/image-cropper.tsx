/**
 * ImageCropper — the round crop of a profile photo (USE's profile sheet,
 * D-USE-37; first drawn as the square icon crop of v2 handoff §5.4).
 *
 * A 280px square crop area under a 240px circle mask, a zoom slider between
 * zoom glyphs, and the hint. Drag moves, two fingers pinch, the wheel zooms at
 * the desk; as one focusable region, the arrows move and + and − zoom. The
 * photo always covers the mask: zoom never goes below cover and a drag stops
 * at the mask's edge.
 *
 * NO BUTTONS OF ITS OWN. The step's one primary ("Use photo") belongs to the
 * sheet's foot, so the caller holds a ref and calls `crop()`; going back is
 * the caller's header. The slider stands by D-USE-37 (drawn and approved),
 * over the older two-button zoom.
 *
 * The output is a square `Blob` of the mask's square at `outputPx`, shown
 * round by `Avatar`. EXIF is dropped by construction — re-drawing through a
 * canvas discards every tag, which is also how the location a photo was taken
 * stops travelling with it. No library: one transform, one `drawImage`.
 *
 * `URL.revokeObjectURL` runs on unmount and on every new file.
 */
"use client";

import * as React from "react";
import { ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { Slider as SliderPrimitive } from "radix-ui";
import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";

/** The crop area and the mask, as drawn (profile-sheet/states/crop.md). */
const AREA_PX = 280;
const MASK_PX = 240;
const INSET = (AREA_PX - MASK_PX) / 2;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const KEY_MOVE_PX = 8;
const KEY_ZOOM = 0.25;

export interface ImageCropperCopy {
  /** The region's name. */
  region: string;
  /** The slider's name. */
  zoom: string;
  /** Shown under the slider; the region's description. */
  hint: string;
}

const DEFAULT_COPY: ImageCropperCopy = {
  region: "Photo crop",
  zoom: "Zoom",
  hint: "Drag to move, pinch or slide to zoom.",
};

export interface ImageCropperHandle {
  /** The mask's square, drawn at `outputPx`; rejects when the image cannot be read. */
  crop: () => Promise<Blob>;
}

export interface ImageCropperProps {
  file: Blob;
  /** The output square's side. */
  outputPx?: number;
  copy?: Partial<ImageCropperCopy>;
  className?: string;
  ref?: React.Ref<ImageCropperHandle>;
}

interface Point {
  x: number;
  y: number;
}

export function ImageCropper({
  file,
  outputPx = 512,
  copy,
  className,
  ref,
}: ImageCropperProps) {
  const words = { ...DEFAULT_COPY, ...copy };
  const [url, setUrl] = React.useState<string | null>(null);
  const [natural, setNatural] = React.useState<{ w: number; h: number } | null>(
    null,
  );
  const [zoom, setZoom] = React.useState(MIN_ZOOM);
  const [offset, setOffset] = React.useState<Point>({ x: 0, y: 0 });
  const imageRef = React.useRef<HTMLImageElement | null>(null);
  const pointers = React.useRef(new Map<number, Point>());
  const gesture = React.useRef<{
    from: Point;
    offset: Point;
    spread: number | null;
    zoom: number;
  } | null>(null);
  const hintId = React.useId();

  React.useEffect(() => {
    const next = URL.createObjectURL(file);
    setUrl(next);
    setNatural(null);
    setZoom(MIN_ZOOM);
    setOffset({ x: 0, y: 0 });
    return () => URL.revokeObjectURL(next);
  }, [file]);

  /** The image's drawn size in the crop area at a zoom: cover, then zoom. */
  const drawnSize = React.useCallback(
    (at: number) => {
      if (natural === null) return { w: AREA_PX * at, h: AREA_PX * at };
      const cover = Math.max(AREA_PX / natural.w, AREA_PX / natural.h);
      return { w: natural.w * cover * at, h: natural.h * cover * at };
    },
    [natural],
  );

  /** Keeps the mask covered: the image's edge never comes inside it. */
  const clamp = React.useCallback(
    (point: Point, at: number): Point => {
      const size = drawnSize(at);
      const maxX = Math.max(0, (size.w - MASK_PX) / 2);
      const maxY = Math.max(0, (size.h - MASK_PX) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, point.x)),
        y: Math.min(maxY, Math.max(-maxY, point.y)),
      };
    },
    [drawnSize],
  );

  const zoomTo = React.useCallback(
    (next: number) => {
      const at = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
      setZoom(at);
      setOffset((current) => clamp(current, at));
    },
    [clamp],
  );

  function spreadOf(): number | null {
    const [a, b] = [...pointers.current.values()];
    if (a === undefined || b === undefined) return null;
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function startGesture() {
    const first = [...pointers.current.values()][0];
    gesture.current =
      first === undefined
        ? null
        : { from: first, offset, spread: spreadOf(), zoom };
  }

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    startGesture();
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    const start = gesture.current;
    if (start === null) return;
    const spread = spreadOf();
    if (start.spread !== null && spread !== null) {
      zoomTo(start.zoom * (spread / start.spread));
      return;
    }
    const first = [...pointers.current.values()][0];
    if (first === undefined) return;
    setOffset(
      clamp(
        {
          x: start.offset.x + first.x - start.from.x,
          y: start.offset.y + first.y - start.from.y,
        },
        zoom,
      ),
    );
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    startGesture();
  };

  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    zoomTo(zoom * (event.deltaY < 0 ? 1.08 : 1 / 1.08));
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const move: Record<string, Point> = {
      ArrowLeft: { x: -KEY_MOVE_PX, y: 0 },
      ArrowRight: { x: KEY_MOVE_PX, y: 0 },
      ArrowUp: { x: 0, y: -KEY_MOVE_PX },
      ArrowDown: { x: 0, y: KEY_MOVE_PX },
    };
    const step = move[event.key];
    if (step !== undefined) {
      event.preventDefault();
      setOffset((current) =>
        clamp({ x: current.x + step.x, y: current.y + step.y }, zoom),
      );
      return;
    }
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      zoomTo(zoom + KEY_ZOOM);
    } else if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      zoomTo(zoom - KEY_ZOOM);
    }
  };

  React.useImperativeHandle(
    ref,
    () => ({
      crop: () =>
        new Promise<Blob>((resolve, reject) => {
          const image = imageRef.current;
          if (image === null || natural === null) {
            reject(new Error("The photo has not loaded."));
            return;
          }
          const canvas = document.createElement("canvas");
          canvas.width = outputPx;
          canvas.height = outputPx;
          const context = canvas.getContext("2d");
          if (context === null) {
            reject(new Error("The photo could not be drawn."));
            return;
          }
          // The area's coordinates, scaled from the mask's square to the output.
          const ratio = outputPx / MASK_PX;
          const size = drawnSize(zoom);
          context.drawImage(
            image,
            (AREA_PX / 2 + offset.x - size.w / 2 - INSET) * ratio,
            (AREA_PX / 2 + offset.y - size.h / 2 - INSET) * ratio,
            size.w * ratio,
            size.h * ratio,
          );
          canvas.toBlob(
            (blob) =>
              blob === null
                ? reject(new Error("The photo could not be drawn."))
                : resolve(blob),
            "image/jpeg",
            0.9,
          );
        }),
    }),
    [drawnSize, natural, offset, outputPx, zoom],
  );

  const size = drawnSize(zoom);
  const percent = Math.round(((zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100);

  return (
    <div
      className={cn("flex flex-col items-center gap-(--space-4)", className)}
    >
      <div
        role="group"
        tabIndex={0}
        aria-label={words.region}
        aria-describedby={hintId}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onKeyDown={onKeyDown}
        className={cn(
          "relative size-70 cursor-grab touch-none overflow-hidden rounded-(--radius-control)",
          "bg-surface outline-none active:cursor-grabbing",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2",
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
            onLoad={(event) =>
              setNatural({
                w: event.currentTarget.naturalWidth || AREA_PX,
                h: event.currentTarget.naturalHeight || AREA_PX,
              })
            }
            style={{
              width: size.w,
              height: size.h,
              transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
            }}
            className="absolute top-1/2 left-1/2 max-w-none select-none"
          />
        )}
        {/* Outside the mask dimmed, and the mask drawn as a thin paper ring. */}
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${AREA_PX} ${AREA_PX}`}
          className="pointer-events-none absolute inset-0 size-full"
        >
          <path
            fillRule="evenodd"
            className="fill-(--scrim)"
            d={`M0 0H${AREA_PX}V${AREA_PX}H0Z M${AREA_PX / 2} ${INSET}a${MASK_PX / 2} ${MASK_PX / 2} 0 1 0 0.01 0Z`}
          />
          <circle
            cx={AREA_PX / 2}
            cy={AREA_PX / 2}
            r={MASK_PX / 2}
            fill="none"
            strokeWidth={2}
            className="stroke-background"
          />
        </svg>
      </div>

      <div className="text-muted-foreground flex h-(--target) w-70 items-center gap-(--space-3)">
        <ZoomOutIcon aria-hidden="true" className="size-4 shrink-0" />
        <SliderPrimitive.Root
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.01}
          value={[zoom]}
          onValueChange={([next]) => {
            if (next !== undefined) zoomTo(next);
          }}
          className="relative flex h-(--target) flex-1 touch-none items-center select-none"
        >
          <SliderPrimitive.Track className="bg-border relative h-0.5 flex-1 rounded-full">
            <SliderPrimitive.Range className="bg-foreground absolute h-full rounded-full" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            aria-label={words.zoom}
            aria-valuetext={`${percent}%`}
            className={cn(
              "bg-background border-border block size-5 rounded-full border",
              "focus-visible:ring-ring outline-none focus-visible:ring-2",
            )}
          />
        </SliderPrimitive.Root>
        <ZoomInIcon aria-hidden="true" className="size-4 shrink-0" />
      </div>

      <Text
        id={hintId}
        as="p"
        variant="secondary"
        tone="muted"
        className="text-center"
      >
        {words.hint}
      </Text>
    </div>
  );
}
