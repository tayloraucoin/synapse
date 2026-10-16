"use client";

import {
  Button,
  cn,
  DoneIcon,
  ExpandIcon,
  LinearStatusShape,
  NoticeIcon,
  OpenInLinearIcon,
  Spinner,
  Text,
} from "@syn/ui";
import type {
  LinearLineView,
  StatusOption,
} from "@/lib/data/item-sheet-linear";
import { ITEM_SHEET_COPY } from "./copy";

const COPY = ITEM_SHEET_COPY.linear;

/**
 * LinearLine — a linked item's Linear line under its name (USE-66;
 * linear-linked.md): the status chip (Linear's shape in the workspace's
 * colour, its word and a chevron; D-USE-35, D-USE-78), the identifier, the
 * project muted and "Linear ↗" to the issue. The chip opens the status list.
 * Props only.
 */
export interface LinearLineProps {
  status: StatusOption;
  identifier: string;
  project: string | null;
  url: string;
  onStatus: () => void;
}

export function LinearLine({
  status,
  identifier,
  project,
  url,
  onStatus,
}: LinearLineProps) {
  return (
    <div className="flex min-w-0 items-center gap-(--space-3) pb-(--space-3)">
      <button
        type="button"
        aria-label={COPY.status(status.name)}
        onClick={onStatus}
        className={cn(
          "border-border inline-flex min-h-(--target) shrink-0 items-center gap-(--space-1) rounded-(--radius-control) border px-(--space-2)",
          "hover:bg-surface focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
        )}
      >
        <LinearStatusShape
          type={status.type}
          label={status.name}
          progress={status.fill}
          color={status.color}
          className="[&>span]:text-foreground [&>span]:font-semibold"
        />
        <ExpandIcon
          aria-hidden="true"
          className="text-muted-foreground size-3.5 shrink-0"
        />
      </button>
      <Text as="span" variant="secondary" className="shrink-0 font-semibold">
        {identifier}
      </Text>
      {project === null ? null : (
        <Text as="span" variant="secondary" tone="secondary" truncate>
          {project}
        </Text>
      )}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={COPY.open(identifier)}
        className={cn(
          "text-foreground ms-auto inline-flex min-h-(--target) shrink-0 items-center gap-(--space-1) text-(length:--fs-secondary) font-semibold",
          "focus-visible:ring-ring rounded-(--radius-control) focus-visible:ring-2 focus-visible:outline-none",
        )}
      >
        {COPY.linear}
        <OpenInLinearIcon aria-hidden="true" className="size-3.5 shrink-0" />
      </a>
    </div>
  );
}

/**
 * The line under the Linear line (linear-syncing, -failed, -done; the
 * offline words): in flight a small spinner and "Updating Linear"; failed
 * the info glyph, the kept value and Try again, in ink, never red; closed in
 * Linear a check and the time. Said politely (words-and-access.md).
 */
export function LinearLineStatus({
  line,
  onRetry,
}: {
  line: LinearLineView;
  onRetry: (writeId: string) => void;
}) {
  return (
    <div role="status" aria-live="polite" className="empty:hidden">
      {line === null ? null : line.kind === "failed" ? (
        <div
          data-linear-line="failed"
          className="text-foreground flex flex-wrap items-center gap-x-(--space-2) pb-(--space-3)"
        >
          <NoticeIcon aria-hidden="true" className="size-4 shrink-0" />
          <Text as="span" variant="secondary" tone="ink">
            {COPY.failed(line.kept)}
          </Text>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRetry(line.writeId)}
            className="text-foreground -ms-(--space-2) font-semibold underline"
          >
            {COPY.tryAgain}
          </Button>
        </div>
      ) : (
        <p
          data-linear-line={line.kind}
          className="text-muted-foreground m-0 flex items-center gap-(--space-2) pb-(--space-3) text-(length:--fs-secondary)"
        >
          {line.kind === "closed" ? (
            <DoneIcon aria-hidden="true" className="size-4 shrink-0" />
          ) : line.kind === "syncing" ? (
            <Spinner
              aria-hidden="true"
              role="presentation"
              className="size-3"
            />
          ) : null}
          {line.kind === "syncing"
            ? COPY.syncing
            : line.kind === "offline"
              ? COPY.offline
              : COPY.closed(line.at)}
        </p>
      )}
    </div>
  );
}
