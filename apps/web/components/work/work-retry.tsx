"use client";

import { Button, Text } from "@syn/ui";

/**
 * Today's tiers failing (USE-57; error.md, D-USE-57): the label bold on its
 * own line, the reassurance muted under it, then Try again on
 * `fill-muted`, in the tiers' place under the header. Never an error colour or
 * icon: a failed read loses no time, since the timers are events. Props only.
 */
export interface WorkRetryProps {
  /** "Today didn't load." */
  label: string;
  /** "Timers that were running keep their time; nothing is lost." */
  detail: string;
  /** "Try again". */
  retry: string;
  onRetry: () => void;
}

export function WorkRetry({ label, detail, retry, onRetry }: WorkRetryProps) {
  return (
    <div
      role="status"
      data-work-retry
      className="flex flex-col items-start gap-(--space-1) py-(--space-4)"
    >
      <Text as="p" variant="body" weight={600}>
        {label}
      </Text>
      <Text as="p" variant="secondary" tone="muted">
        {detail}
      </Text>
      <Button
        variant="ghost"
        onClick={onRetry}
        className="bg-fill-muted hover:bg-fill-muted mt-(--space-3)"
      >
        {retry}
      </Button>
    </div>
  );
}
