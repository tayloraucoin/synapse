"use client";

import { Button, cn, NoticeIcon, Spinner, Text } from "@syn/ui";
import type { LinearRowLineView } from "./view";

/**
 * LinearRowLine — Linear's line under a work row's meta (USE-63;
 * linear-updating.md, linear-failed.md). Updating is a quiet inline spinner
 * naming the status it moves to, muted; failed is the info glyph, "Not
 * updated in Linear." and a small Try again, in ink, never red and never a
 * miss (D-USE-56). The row above keeps its Synapse state either way. Closed
 * in Linear is the done row's own meta and Reopen, drawn by WorkRow.
 */
export interface LinearRowLineProps {
  line: Exclude<LinearRowLineView, { kind: "closed" }>;
  onRetry?: () => void;
  className?: string;
}

export function LinearRowLine({
  line,
  onRetry,
  className,
}: LinearRowLineProps) {
  if (line.kind === "updating")
    return (
      <p
        data-linear-row-line="updating"
        className={cn(
          "text-muted-foreground m-0 flex items-center gap-(--space-2) pt-(--space-1) text-(length:--fs-caption) leading-(--lh-caption)",
          className,
        )}
      >
        <Spinner aria-hidden="true" role="presentation" className="size-3" />
        {line.text}
      </p>
    );

  return (
    <div
      data-linear-row-line="failed"
      className={cn(
        "text-foreground flex flex-wrap items-center gap-(--space-2) pt-(--space-2)",
        className,
      )}
    >
      <NoticeIcon aria-hidden="true" className="size-4 shrink-0" />
      <Text as="span" variant="caption" tone="ink">
        {line.text}
      </Text>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onRetry}
        disabled={onRetry === undefined}
      >
        {line.retry}
      </Button>
    </div>
  );
}
