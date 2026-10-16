"use client";

import * as React from "react";
import type { StoredBlockKind } from "@syn/types";
import { cn, DisclosureIcon, Text } from "@syn/ui";
import { BLOCK_HUE, HUE_DOT } from "../block-hue";

/**
 * One Move to row (USE-69): a 3 px bar in the target block's kind colour
 * beside its name, so colour is never alone (plain-item.md keeps it as
 * drawn); a glyph in its place for Pick a day and Back to the pool; a dashed
 * edge for a day with no block of its kind. The consequence sits muted
 * under the target, before the tap. Props only.
 */
export interface MoveTargetRowProps {
  label: string;
  line?: string;
  /** The target block's kind: its colour bar. */
  kind?: StoredBlockKind;
  /** A glyph in the bar's place. */
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  /** A day with no block of its kind (no-block-of-its-kind.md). */
  dashed?: boolean;
  /** Pick a day's chevron. */
  disclosure?: boolean;
  /** A row that only shows (Pick a day's consequence). */
  onSelect?: () => void;
}

export function MoveTargetRow({
  label,
  line,
  kind,
  icon: Icon,
  dashed = false,
  disclosure = false,
  onSelect,
}: MoveTargetRowProps) {
  const edge = dashed ? (
    <span
      aria-hidden="true"
      className="border-text-muted w-0 shrink-0 self-stretch border-s-2 border-dashed"
    />
  ) : Icon ? (
    <Icon aria-hidden className="text-text-muted size-4 shrink-0" />
  ) : kind ? (
    <span
      aria-hidden="true"
      className={cn("w-0.75 shrink-0 self-stretch", HUE_DOT[BLOCK_HUE[kind]])}
    />
  ) : null;

  const body = (
    <>
      {edge}
      <span className="flex min-w-0 flex-1 flex-col">
        <Text as="span" variant="body">
          {label}
        </Text>
        {line === undefined ? null : (
          <Text as="span" variant="secondary" tone="secondary">
            {line}
          </Text>
        )}
      </span>
      {disclosure ? (
        <DisclosureIcon aria-hidden className="size-4 shrink-0" />
      ) : null}
    </>
  );

  const row =
    "flex min-h-14 w-full items-center gap-(--space-3) py-(--space-2) text-start";
  return onSelect === undefined ? (
    <div className={row}>{body}</div>
  ) : (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        row,
        "hover:bg-surface focus-visible:ring-ring outline-none focus-visible:ring-2",
      )}
    >
      {body}
    </button>
  );
}
