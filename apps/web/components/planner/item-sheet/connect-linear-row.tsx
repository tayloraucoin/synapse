"use client";

import { cn, DisclosureIcon, Text } from "@syn/ui";
import { ITEM_SHEET_COPY } from "./copy";

const COPY = ITEM_SHEET_COPY.link;

/**
 * ConnectLinearRow — the row under an unlinked work item's name (USE-68;
 * linear-search.md, linear-off.md): "Link a Linear issue" with a chevron,
 * opening the step; with Linear not connected, "Connect Linear" and, muted
 * on the right, "In Settings, Connections", so the jump out is named
 * (D-USE-56). Between hairlines, as drawn. Props only.
 */
export interface ConnectLinearRowProps {
  connected: boolean;
  onLink: () => void;
  onConnect: () => void;
}

export function ConnectLinearRow({
  connected,
  onLink,
  onConnect,
}: ConnectLinearRowProps) {
  return (
    <button
      type="button"
      onClick={connected ? onLink : onConnect}
      aria-label={
        connected ? COPY.row : `${COPY.connect}. ${COPY.connectWhere}`
      }
      className={cn(
        "border-hairline flex min-h-14 w-full items-center gap-(--space-2) border-t text-start",
        "hover:bg-surface focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
      )}
    >
      <Text as="span" variant="body" className="flex-1">
        {connected ? COPY.row : COPY.connect}
      </Text>
      {connected ? null : (
        <Text as="span" variant="secondary" tone="secondary" truncate>
          {COPY.connectWhere}
        </Text>
      )}
      <DisclosureIcon
        aria-hidden="true"
        className="text-muted-foreground size-4 shrink-0"
      />
    </button>
  );
}
