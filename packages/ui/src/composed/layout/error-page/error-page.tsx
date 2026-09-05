/**
 * ErrorPage — SY-05, both variants (v2 handoff §5.10).
 *
 * Used by `app/not-found.tsx` and `app/error.tsx`. A `ScreenFrame` with a
 * heading, a sentence, and one or two buttons — the same shape as any other
 * screen, because an error is still a screen a person is standing on.
 *
 * *Open today* is always offered and always last-resort-proof: whatever went
 * wrong, today's list is a route that exists.
 */
"use client";

import * as React from "react";

import { Button } from "../../../primitives/control/button";
import { Text } from "../../../primitives/typography/text";
import { ScreenFrame } from "../screen-frame";
import { ERROR_PAGE_COPY } from "./copy";

export interface ErrorPageProps {
  variant: "not-found" | "unrecoverable";
  onOpenToday: () => void;
  /** Offered on the unrecoverable variant only. */
  onReload?: () => void;
  className?: string;
}

export function ErrorPage({
  variant,
  onOpenToday,
  onReload,
  className,
}: ErrorPageProps) {
  const copy = ERROR_PAGE_COPY[variant];

  return (
    <ScreenFrame width="text" className={className}>
      <div className="flex flex-col gap-(--space-4)">
        <Text as="h1" variant="heading" weight={600}>
          {copy.heading}
        </Text>
        <Text as="p" variant="body" tone="body" className="max-w-(--measure)">
          {copy.body}
        </Text>
        <div className="flex flex-wrap gap-(--space-2)">
          {onReload === undefined ? null : (
            <Button onClick={onReload}>{ERROR_PAGE_COPY.reload}</Button>
          )}
          <Button
            variant={onReload === undefined ? "default" : "secondary"}
            onClick={onOpenToday}
          >
            {ERROR_PAGE_COPY.openToday}
          </Button>
        </div>
      </div>
    </ScreenFrame>
  );
}
