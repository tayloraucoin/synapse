"use client";

import * as React from "react";
import {
  Button,
  LinkCallout,
  PassageCarousel,
  RegionRetry,
  Skeleton,
  Text,
  type PassageSlide,
} from "@syn/ui";
import type { LinkRecord } from "@syn/validators";
import type { ReadingRecords } from "@/lib/data/morning-records";
import { assetRoute } from "@/lib/routes";
import { ORIENT_COPY as COPY } from "./copy";

/**
 * The reading and its links (USE-12; D-USE-9, D-USE-49, D-USE-63): the one
 * region on Orient that waits or fails on its own. Loading is a still
 * skeleton that reserves the clamped reading's height, so nothing below
 * jumps; a failure is one muted row with Try again, never red and never the
 * page. With no passages, one quiet line sits in its place; links are their
 * own setting and stay.
 */

type ReadingState =
  | { status: "pending" }
  | { status: "error"; retry: () => void }
  | { status: "success"; data: ReadingRecords };

/** *open.spotify.com*: the callout's detail; the URL itself is never shown. */
function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}

function slidesOf(data: ReadingRecords): PassageSlide[] {
  return [
    ...data.passages.map((passage) => ({
      kind: "passage" as const,
      id: passage.id,
      title: passage.title ?? "",
      bodyMd: passage.bodyMd,
      images: passage.images,
    })),
    ...(data.quote === null
      ? []
      : [
          {
            kind: "quote" as const,
            id: data.quote.id,
            text: data.quote.text,
            attribution: data.quote.attribution,
          },
        ]),
  ];
}

/** Between two hairlines, where the reading sits: the quiet line and the retry. */
function InPlace({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-y border-border py-(--space-4)">{children}</div>
  );
}

function Links({ links }: { links: LinkRecord[] }) {
  // None set: nothing drawn and no gap.
  if (links.length === 0) return null;
  return (
    <div className="flex flex-col gap-(--space-2)">
      {links.map((link) => (
        <LinkCallout
          key={link.id}
          title={link.title}
          url={link.url}
          host={hostOf(link.url)}
          kind={link.kind}
        />
      ))}
    </div>
  );
}

/** The skeleton: bars over an invisible clamped passage, so the height is the reading's. */
function ReadingSkeleton() {
  return (
    <section
      aria-label={COPY.reading}
      aria-busy="true"
      className="flex flex-col gap-(--space-6)"
    >
      <div className="relative flex flex-col gap-(--space-3)">
        <div
          aria-hidden="true"
          className="invisible flex flex-col gap-(--space-3)"
        >
          <Text as="span" variant="caption">
            {COPY.reading}
          </Text>
          <Text as="p" variant="review-sentence" className="line-clamp-4">
            {" \n".repeat(4)}
          </Text>
          <div className="min-h-(--target)" />
        </div>
        <div className="absolute inset-0 flex flex-col gap-(--space-3)">
          <Skeleton className="h-3 w-1/3 rounded-(--radius-control)" />
          <Skeleton className="mt-(--space-2) h-3.5 w-full rounded-(--radius-control)" />
          <Skeleton className="h-3.5 w-full rounded-(--radius-control)" />
          <Skeleton className="h-3.5 w-3/5 rounded-(--radius-control)" />
        </div>
      </div>
      <div aria-hidden="true" className="flex flex-col gap-(--space-2)">
        <Skeleton className="h-(--row-min) w-full rounded-(--radius-control)" />
        <Skeleton className="h-(--row-min) w-full rounded-(--radius-control)" />
      </div>
    </section>
  );
}

export function OrientReading({
  state,
  onReadAll,
}: {
  state: ReadingState;
  onReadAll?: (slideId: string) => void;
}) {
  const [slide, setSlide] = React.useState(0);

  if (state.status === "pending") return <ReadingSkeleton />;

  if (state.status === "error") {
    // The links come with the reading and fail with it.
    return (
      <InPlace>
        <RegionRetry
          label={COPY.readingFailed}
          onRetry={state.retry}
          className="justify-between py-0"
        />
      </InPlace>
    );
  }

  const slides = slidesOf(state.data);
  const current = slides[Math.min(slide, slides.length - 1)];
  const currentTitle =
    current?.kind === "passage" && current.title !== ""
      ? current.title
      : COPY.reading;

  return (
    <div className="flex flex-col gap-(--space-6)">
      {slides.length === 0 ? (
        <InPlace>
          <Text as="p" variant="review-sentence" tone="muted">
            {COPY.nothingYet}
          </Text>
        </InPlace>
      ) : (
        <PassageCarousel
          slides={slides}
          index={slide}
          onIndexChange={setSlide}
          resolveImageUrl={(key) => assetRoute(key)}
          label={COPY.reading}
          clamp
          trailing={
            <Button
              variant="ghost"
              aria-label={COPY.readAllNamed(currentTitle)}
              onClick={() => current && onReadAll?.(current.id)}
              className="-me-(--space-4) text-link"
            >
              {COPY.readAll}
            </Button>
          }
        />
      )}
      <Links links={state.data.links} />
    </div>
  );
}
