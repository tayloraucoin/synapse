"use client";

import { AddIcon, Button, cn, CompleteBlockIcon, Text } from "@syn/ui";

/**
 * BlockDoneFooter — a block with every item done (USE-20; D-USE-28,
 * D-USE-25): the rows stay above, faded; this floats on the fade above the
 * tabs: the filled check and "<Block> complete", "Next: <Block>, <time>" at
 * the trailing edge, the ahead line when it came before the end, the primary
 * full width, and "Or a to-do until <end>" under it.
 *
 * `addRow` is the add row under the rows while the block has time
 * (D-USE-30), in the flow, not on the fade. One part draws both all-done
 * frames. Names and times only; the screen passes the words.
 */
export interface BlockDoneFooterProps {
  /** "Wellness complete". */
  title: string;
  /** "Next: Training, 8:00"; null when nothing follows. */
  nextLabel: string | null;
  /** "Done before 8:00. Starting early is fine: …"; null when not ahead. */
  aheadLine?: string | null;
  /** Start <Block>, or See the whole day when nothing follows. */
  action: { label: string; onPress: () => void };
  /** "Or a to-do until 8:00": opens the tray. */
  todoLink?: { label: string; onPress: () => void } | null;
  /** "Add to Wellness" with "Free until 8:00", while the block has time. */
  addRow?: { label: string; freeUntil: string; onPress: () => void } | null;
  className?: string;
}

export function BlockDoneFooter({
  title,
  nextLabel,
  aheadLine = null,
  action,
  todoLink = null,
  addRow = null,
  className,
}: BlockDoneFooterProps) {
  return (
    <>
      {addRow ? (
        <div className="border-hairline mt-(--space-2) border-t">
          <button
            type="button"
            onClick={addRow.onPress}
            data-block-add-row=""
            className={cn(
              "flex min-h-(--target) w-full cursor-pointer items-center gap-(--space-3) text-left",
              "focus-visible:ring-ring rounded-(--radius-control) focus-visible:ring-2 focus-visible:outline-none",
            )}
          >
            <AddIcon aria-hidden="true" className="text-text-muted size-4" />
            <Text as="span" variant="body" className="min-w-0 flex-1" truncate>
              {addRow.label}
            </Text>
            <Text
              as="span"
              variant="secondary"
              tone="muted"
              className="shrink-0 tabular-nums"
            >
              {addRow.freeUntil}
            </Text>
          </button>
        </div>
      ) : null}

      {/* D-USE-25: on a fade to the background, above the tabs. */}
      <div
        data-block-done-footer=""
        className={cn(
          "to-background sticky bottom-[calc(var(--tabbar-h)+env(safe-area-inset-bottom))] mt-auto flex flex-col gap-(--space-3) bg-linear-to-b from-transparent pt-(--space-8) pb-(--space-3)",
          className,
        )}
      >
        <div className="flex items-center gap-(--space-2)">
          <CompleteBlockIcon
            aria-hidden="true"
            className="fill-foreground text-background size-5 shrink-0"
          />
          <Text as="p" variant="body" weight={600} className="min-w-0 flex-1">
            {title}
          </Text>
          {nextLabel ? (
            <Text
              as="p"
              variant="secondary"
              tone="ink"
              className="shrink-0 tabular-nums"
            >
              {nextLabel}
            </Text>
          ) : null}
        </div>
        {aheadLine ? (
          <Text as="p" variant="secondary" tone="muted">
            {aheadLine}
          </Text>
        ) : null}
        <Button
          size="lg"
          className="w-full font-semibold"
          onClick={action.onPress}
        >
          {action.label}
        </Button>
        {todoLink ? (
          <button
            type="button"
            onClick={todoLink.onPress}
            className={cn(
              "text-foreground mx-auto min-h-(--target) cursor-pointer px-(--space-2) text-(length:--fs-secondary) leading-(--lh-secondary) font-medium underline underline-offset-4",
              "focus-visible:ring-ring rounded-(--radius-control) focus-visible:ring-2 focus-visible:outline-none",
            )}
          >
            {todoLink.label}
          </button>
        ) : null}
      </div>
    </>
  );
}
