/**
 * PassageReader — the morning reading, full screen (USE-13; D-USE-9;
 * orient/states/passage-open.md).
 *
 * A dialog over Orient at every width: the reader bar (× on the left, named
 * "Close", then the caption), the passage's title in sans at the review
 * title size and its body in Newsreader at reading size, the text capped at
 * the reading measure and centred; the dots at the foot. No button in it.
 *
 * PRESENTATIONAL. It is open while it is mounted; the caller owns the index
 * (shared with `PassageCarousel`, so the reader opens on the carousel's
 * passage and closes back to the one it was left on) and unmounts it on
 * `onClose`. Focus goes to × on open and, on close, to `returnFocusRef`
 * ("Read all"), else the control that opened it.
 *
 * SWIPE, OR THE ARROW KEYS, through the carousel's `useSwipe`; the same
 * `PassageSlide`, so a quote day reads as a quote, attributed. Each passage
 * scrolls on its own. Under reduced motion only the current passage is in
 * the flow and a swipe snaps.
 */
"use client";

import * as React from "react";
import { XIcon } from "lucide-react";
import { usePrefersReducedMotion } from "../../../hooks/use-prefers-reduced-motion";
import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../../../primitives/feedback/dialog";
import { Text } from "../../../primitives/typography/text";
import { RichTextEditor } from "../../control/rich-text-editor";
import { PASSAGE_CAROUSEL_COPY, type PassageSlide } from "../passage-carousel";
import { useSwipe } from "../passage-carousel/use-swipe";
import { PASSAGE_READER_COPY } from "./copy";

export interface PassageReaderProps {
  passages: readonly PassageSlide[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  /** The reader bar's words, and the dialog's name: "Morning reading". */
  caption: string;
  resolveImageUrl?: (key: string) => string | null;
  /**
   * Where focus goes on close: "Read all". Absent, the control focused when
   * the reader opened.
   */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

export function PassageReader({
  passages,
  index,
  onIndexChange,
  onClose,
  caption,
  resolveImageUrl,
  returnFocusRef,
}: PassageReaderProps) {
  const reducedMotion = usePrefersReducedMotion();
  const count = passages.length;

  // Unmounted rather than closed, so the dialog's own return never runs:
  // focus goes back here, to "Read all" or whatever opened the reader.
  const [opener] = React.useState(() =>
    typeof document === "undefined"
      ? null
      : (document.activeElement as HTMLElement | null),
  );
  const returnRef = React.useRef(returnFocusRef);
  returnRef.current = returnFocusRef;
  React.useEffect(
    () => () => {
      const target = returnRef.current?.current ?? opener;
      window.setTimeout(() => target?.focus(), 0);
    },
    [opener],
  );
  const current = Math.min(Math.max(0, index), Math.max(0, count - 1));

  const go = React.useCallback(
    (next: number) => {
      if (count === 0) return;
      const clamped = Math.min(Math.max(0, next), count - 1);
      if (clamped !== current) onIndexChange(clamped);
    },
    [count, current, onIndexChange],
  );

  const { dragX, handlers } = useSwipe({
    onNext: () => go(current + 1),
    onPrevious: () => go(current - 1),
    reducedMotion,
  });

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(current + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(current - 1);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        onKeyDown={onKeyDown}
        // The return is ours (above); the dialog's own would land on the body.
        onCloseAutoFocus={(event) => event.preventDefault()}
        className={cn(
          "inset-0 top-0 left-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0",
          "rounded-none border-0 bg-background p-0 wide:max-w-none",
          "data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100",
        )}
      >
        <div className="border-hairline flex min-h-(--target) shrink-0 items-center gap-(--space-3) border-b px-(--space-4) pt-[env(safe-area-inset-top)]">
          <Button
            variant="ghost"
            size="icon"
            aria-label={PASSAGE_READER_COPY.close}
            onClick={onClose}
            className="-ms-(--space-3)"
          >
            <XIcon aria-hidden="true" />
          </Button>
          <DialogTitle asChild>
            <Text as="h2" variant="secondary" weight={500} tone="muted">
              {caption}
            </Text>
          </DialogTitle>
        </div>

        <div
          aria-roledescription="carousel"
          aria-label={caption}
          className="min-h-0 flex-1 touch-pan-y overflow-hidden"
          {...handlers}
        >
          {reducedMotion ? (
            <ReaderSlide
              slide={passages[current]}
              position={current + 1}
              count={count}
              resolveImageUrl={resolveImageUrl}
            />
          ) : (
            <div
              className={cn(
                "flex h-full",
                dragX === 0 &&
                  "transition-transform duration-200 ease-(--ease-settle)",
              )}
              style={{
                transform: `translateX(calc(${-current * 100}% + ${dragX}px))`,
              }}
            >
              {passages.map((slide, at) => (
                <div
                  key={slide.id}
                  aria-hidden={at !== current ? true : undefined}
                  inert={at !== current}
                  className="h-full w-full shrink-0"
                >
                  <ReaderSlide
                    slide={slide}
                    position={at + 1}
                    count={count}
                    resolveImageUrl={resolveImageUrl}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {count > 1 ? (
          // Where the passage sits; the slide's own name says "2 of 3".
          <div
            aria-hidden="true"
            className="flex shrink-0 justify-center gap-(--space-2) pt-(--space-4) pb-[max(env(safe-area-inset-bottom),var(--space-4))]"
          >
            {passages.map((slide, at) => (
              <span
                key={slide.id}
                className={cn(
                  "block size-2 rounded-full",
                  at === current ? "bg-foreground" : "bg-fill-muted",
                )}
              />
            ))}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ReaderSlide({
  slide,
  position,
  count,
  resolveImageUrl,
}: {
  slide: PassageSlide | undefined;
  position: number;
  count: number;
  resolveImageUrl: PassageReaderProps["resolveImageUrl"];
}) {
  if (slide === undefined) return null;

  const urls =
    slide.kind === "passage"
      ? slide.images
          .map((key) => resolveImageUrl?.(key) ?? null)
          .filter((url): url is string => url !== null)
      : [];

  return (
    <article
      aria-roledescription="slide"
      aria-label={PASSAGE_READER_COPY.slide(position, count)}
      className="h-full overflow-y-auto"
    >
      <div className="mx-auto flex max-w-(--measure) flex-col gap-(--space-4) px-(--space-6) py-(--space-6)">
        {slide.kind === "quote" ? (
          <>
            <Text as="span" variant="caption" tone="muted">
              {PASSAGE_CAROUSEL_COPY.quoteCaption}
            </Text>
            <blockquote className="m-0 font-serif text-(length:--fs-review-body) leading-(--lh-review-body)">
              “{slide.text}”
            </blockquote>
            {slide.attribution === null ? null : (
              <Text as="span" variant="caption" tone="muted">
                {slide.attribution}
              </Text>
            )}
          </>
        ) : (
          <>
            {urls.map((url) => (
              <img
                key={url}
                src={url}
                alt=""
                className="w-full rounded-(--radius) object-cover"
              />
            ))}
            {slide.title === "" ? null : (
              <Text as="h3" variant="review-headline" className="font-sans">
                {slide.title}
              </Text>
            )}
            <RichTextEditor
              valueMd={slide.bodyMd}
              readOnly
              className={cn(
                "[&_.prose-passage]:max-w-none [&_.prose-passage]:font-serif",
                "[&_.prose-passage]:text-(length:--fs-review-body) [&_.prose-passage]:leading-(--lh-review-body)",
                "[&_.prose-passage_p+p]:mt-(--space-4)",
              )}
            />
          </>
        )}
      </div>
    </article>
  );
}
