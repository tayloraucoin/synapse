"use client";

import * as React from "react";
import {
  Button,
  Card,
  CloseIcon,
  cn,
  CollapseIcon,
  DoneIcon,
  ExpandIcon,
  Text,
  TextDisclosureButton,
} from "@syn/ui";
import { HUE_CHIP, HUE_DOT, HUE_TEXT, type BlockHue } from "./block-hue";

/**
 * CloseCard — a block closed with items left (USE-25; block-complete
 * not-done-closed, not-done-open, last-block; D-USE-28, D-USE-72): × on the
 * left to stay, the check tile in the block's colour, "<Block> complete",
 * Next as two rows, Start <next>, and the named disclosure. The last block
 * reads "Nothing after this today." with See the whole day instead. Names
 * and times only; the screen passes every word.
 */
export interface CloseCardProps {
  /** "Wellness complete": the heading, which takes focus on settle. */
  title: string;
  hue: BlockHue;
  close: { label: string; onPress: () => void };
  /** Next as rows; null on the day's last block. */
  next: React.ReactNode;
  /** "Nothing after this today.", when nothing follows. */
  nothingAfter?: string | null;
  /** Start <next> (ink), or See the whole day (outline) on the last block. */
  action: { label: string; onPress: () => void; quiet?: boolean };
  /** "Not done: Meditate, Cold bath" and its list; null with nothing left. */
  notDone?: {
    label: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    list: React.ReactNode;
  } | null;
  headingRef?: React.Ref<HTMLHeadingElement>;
  className?: string;
}

export function CloseCard({
  title,
  hue,
  close,
  next,
  nothingAfter = null,
  action,
  notDone = null,
  headingRef,
  className,
}: CloseCardProps) {
  const listId = React.useId();
  return (
    <Card
      data-close-card=""
      className={cn(
        "relative gap-(--space-4) rounded-(--radius-sheet)",
        className,
      )}
    >
      <button
        type="button"
        aria-label={close.label}
        onClick={close.onPress}
        className={cn(
          "text-text-muted absolute top-(--space-2) left-(--space-2) flex size-(--target) cursor-pointer items-center justify-center",
          "focus-visible:ring-ring rounded-(--radius-control) focus-visible:ring-2 focus-visible:outline-none",
        )}
      >
        <CloseIcon aria-hidden="true" className="size-[18px]" />
      </button>

      <div className="flex flex-col items-center gap-(--space-3) pt-(--space-2)">
        <span
          aria-hidden="true"
          className={cn(
            "flex size-12 items-center justify-center rounded-full",
            HUE_CHIP[hue],
          )}
        >
          <DoneIcon className={cn("size-5", HUE_TEXT[hue])} />
        </span>
        <Text
          as="h2"
          variant="heading"
          ref={headingRef}
          tabIndex={-1}
          className="text-center outline-none"
        >
          {title}
        </Text>
        {nothingAfter ? (
          <Text as="p" variant="body" tone="muted" className="text-center">
            {nothingAfter}
          </Text>
        ) : null}
      </div>

      {next}

      <Button
        size="lg"
        variant={action.quiet ? "secondary" : "default"}
        className="w-full font-semibold"
        onClick={action.onPress}
      >
        {action.label}
      </Button>

      {notDone ? (
        <div className="flex flex-col">
          <TextDisclosureButton
            expanded={notDone.open}
            aria-controls={listId}
            onClick={() => notDone.onOpenChange(!notDone.open)}
            className="text-text-muted mx-auto flex items-center gap-(--space-1) text-center"
            collapsedLabel={
              <>
                <span className="truncate">{notDone.label}</span>
                <ExpandIcon aria-hidden="true" className="size-4 shrink-0" />
              </>
            }
            expandedLabel={
              <>
                <span className="truncate">{notDone.label}</span>
                <CollapseIcon aria-hidden="true" className="size-4 shrink-0" />
              </>
            }
          />
          <div id={listId} hidden={!notDone.open}>
            {notDone.open ? notDone.list : null}
          </div>
        </div>
      ) : null}
    </Card>
  );
}

/**
 * NextRows — "Next", then the next block (a filled dot in its colour, its
 * name, its start) and the one after ("then Breakfast", a hollow ring).
 * Text, not buttons; each row names its block, so colour is never alone.
 */
export interface NextRowsProps {
  heading: string;
  rows: { key: string; name: string; startsAt: string; hue: BlockHue }[];
}

export function NextRows({ heading, rows }: NextRowsProps) {
  return (
    <div className="flex flex-col">
      <Text as="p" variant="caption" tone="muted">
        {heading}
      </Text>
      <ul className="flex flex-col">
        {rows.map((row, index) => (
          <li
            key={row.key}
            className={cn(
              "flex min-h-(--target) items-center gap-(--space-3)",
              index > 0 && "border-hairline border-t",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "size-2 shrink-0 rounded-full",
                index === 0
                  ? HUE_DOT[row.hue]
                  : "border-text-muted border bg-transparent",
              )}
            />
            <Text
              as="span"
              variant="body"
              weight={index === 0 ? 600 : undefined}
              tone={index === 0 ? "ink" : "muted"}
              className="min-w-0 flex-1"
              truncate
            >
              {row.name}
            </Text>
            <Text
              as="span"
              variant="secondary"
              tone="ink"
              className="shrink-0 tabular-nums"
            >
              {row.startsAt}
            </Text>
          </li>
        ))}
      </ul>
    </div>
  );
}
