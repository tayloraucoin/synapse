/**
 * PassageCarousel — the orient frame's reading (UX v1.2 §5.2, §10.2, §10.4;
 * RUN-7).
 *
 * One slide at a time: a passage's images above if any (one at column width;
 * a strip if more), its title as a caption in muted sans, its body in
 * Newsreader at body size — the same `prose-passage` renderer the editor
 * uses, read-only — or, on a quote day, the quote in quotation marks with its
 * attribution under the chrome caption *A quote*. Beneath, a row of 8px dots,
 * the current one ink.
 *
 * SWIPE, OR THE ARROW KEYS. Pointer events with a 40px threshold — no
 * library — and the keys as the fallback on the region; the dots are a
 * `tablist` whose `tab`s the arrows also move between. A settle is 200ms of
 * translate; under reduced motion the slides crossfade instead.
 *
 * IMAGES ARE THE CALLER'S URLS. A passage holds storage keys; `resolveImageUrl`
 * turns one into a URL, so the composite knows no route and no bucket.
 *
 * `slides: []` renders the caller's `empty` — the frame decides what an
 * unread morning says.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { usePrefersReducedMotion } from "../../../hooks/use-prefers-reduced-motion";
import { Text } from "../../../primitives/typography/text";
import { RichTextEditor } from "../../control/rich-text-editor";
import { PASSAGE_CAROUSEL_COPY } from "./copy";

export type PassageSlide =
  | {
      kind: "passage";
      id: string;
      title: string;
      bodyMd: string;
      /** Storage keys, resolved through `resolveImageUrl`. */
      images: readonly string[];
    }
  | {
      kind: "quote";
      id: string;
      text: string;
      attribution: string | null;
    };

export interface PassageCarouselProps {
  slides: readonly PassageSlide[];
  index: number;
  onIndexChange: (index: number) => void;
  resolveImageUrl?: (key: string) => string | null;
  /** What an empty morning shows. */
  empty?: React.ReactNode;
  label?: string;
  className?: string;
}

const SWIPE_PX = 40;

export function PassageCarousel({
  slides,
  index,
  onIndexChange,
  resolveImageUrl,
  empty = null,
  label = PASSAGE_CAROUSEL_COPY.region,
  className,
}: PassageCarouselProps) {
  const reducedMotion = usePrefersReducedMotion();
  const regionId = React.useId();
  const count = slides.length;
  const current = Math.min(Math.max(0, index), Math.max(0, count - 1));
  const pointer = React.useRef<{ id: number; startX: number; startY: number } | null>(null);
  const [dragX, setDragX] = React.useState(0);

  const go = React.useCallback(
    (next: number) => {
      if (count === 0) return;
      const clamped = Math.min(Math.max(0, next), count - 1);
      if (clamped !== current) onIndexChange(clamped);
    },
    [count, current, onIndexChange],
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(current + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(current - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      go(0);
    } else if (event.key === "End") {
      event.preventDefault();
      go(count - 1);
    }
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointer.current = { id: event.pointerId, startX: event.clientX, startY: event.clientY };
  };
  const onPointerMove = (event: React.PointerEvent) => {
    const start = pointer.current;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.startX;
    const dy = event.clientY - start.startY;
    // A vertical gesture is the page's scroll, not ours.
    if (Math.abs(dy) > Math.abs(dx)) return;
    setDragX(reducedMotion ? 0 : dx);
  };
  const onPointerUp = (event: React.PointerEvent) => {
    const start = pointer.current;
    if (!start || start.id !== event.pointerId) return;
    pointer.current = null;
    const dx = event.clientX - start.startX;
    setDragX(0);
    if (dx <= -SWIPE_PX) go(current + 1);
    else if (dx >= SWIPE_PX) go(current - 1);
  };
  const onPointerCancel = () => {
    pointer.current = null;
    setDragX(0);
  };

  if (count === 0) {
    return (
      <section aria-label={label} className={cn("flex flex-col gap-(--space-4)", className)}>
        {empty}
      </section>
    );
  }

  return (
    <section
      id={regionId}
      aria-label={label}
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "flex flex-col gap-(--space-4) rounded-(--radius) outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      <div
        className="touch-pan-y overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        {reducedMotion ? (
          // Crossfade: only the current slide is in the flow; it fades in.
          <div key={slides[current]?.id} className="motion-safe:animate-in motion-safe:fade-in duration-200">
            <Slide slide={slides[current]} resolveImageUrl={resolveImageUrl} position={current + 1} count={count} />
          </div>
        ) : (
          <div
            className={cn("flex", dragX === 0 && "transition-transform duration-200 ease-(--ease-settle)")}
            style={{ transform: `translateX(calc(${-current * 100}% + ${dragX}px))` }}
          >
            {slides.map((slide, at) => (
              <div
                key={slide.id}
                aria-hidden={at !== current ? true : undefined}
                className="w-full shrink-0"
              >
                <Slide slide={slide} resolveImageUrl={resolveImageUrl} position={at + 1} count={count} />
              </div>
            ))}
          </div>
        )}
      </div>

      {count > 1 ? (
        <div role="tablist" aria-label={PASSAGE_CAROUSEL_COPY.dots} className="flex justify-center gap-(--space-2)">
          {slides.map((slide, at) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={at === current}
              aria-label={PASSAGE_CAROUSEL_COPY.dot(at + 1, count)}
              tabIndex={at === current ? 0 : -1}
              onClick={() => go(at)}
              onKeyDown={onKeyDown}
              className={cn(
                "inline-flex size-(--target) items-center justify-center rounded-(--radius)",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "block size-2 rounded-full transition-colors duration-(--dur-state)",
                  at === current ? "bg-ink" : "bg-edge",
                )}
              />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function Slide({
  slide,
  resolveImageUrl,
  position,
  count,
}: {
  slide: PassageSlide | undefined;
  resolveImageUrl: PassageCarouselProps["resolveImageUrl"];
  position: number;
  count: number;
}) {
  if (slide === undefined) return null;

  if (slide.kind === "quote") {
    return (
      <article
        aria-roledescription="slide"
        aria-label={`${position} of ${count}`}
        className="flex flex-col gap-(--space-3)"
      >
        <Text as="span" variant="caption" tone="secondary">
          {PASSAGE_CAROUSEL_COPY.quoteCaption}
        </Text>
        <blockquote className="tabular-off m-0 font-serif text-(length:--fs-row-title) leading-(--lh-row-title)">
          “{slide.text}”
        </blockquote>
        {slide.attribution === null ? null : (
          <Text as="span" variant="caption" tone="secondary">
            {slide.attribution}
          </Text>
        )}
      </article>
    );
  }

  const urls = slide.images
    .map((key) => resolveImageUrl?.(key) ?? null)
    .filter((url): url is string => url !== null);

  return (
    <article
      aria-roledescription="slide"
      aria-label={`${position} of ${count}`}
      className="flex flex-col gap-(--space-3)"
    >
      {urls.length === 1 ? (
        <img src={urls[0]} alt="" className="w-full rounded-(--radius) object-cover" />
      ) : urls.length > 1 ? (
        <div className="flex gap-(--space-2) overflow-x-auto">
          {urls.map((url) => (
            <img key={url} src={url} alt="" className="h-32 w-auto shrink-0 rounded-(--radius) object-cover" />
          ))}
        </div>
      ) : null}
      <Text as="span" variant="caption" tone="secondary">
        {slide.title}
      </Text>
      <RichTextEditor valueMd={slide.bodyMd} readOnly />
    </article>
  );
}
