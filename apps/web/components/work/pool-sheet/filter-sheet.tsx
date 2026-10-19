"use client";

import * as React from "react";
import {
  Button,
  CloseIcon,
  cn,
  DoneIcon,
  ResponsiveSheet,
  Text,
} from "@syn/ui";
import { POOL_SHEET_COPY as COPY } from "./copy";

/**
 * FilterSheet — one short list as a sheet over the pool sheet
 * (client-filter.md's shape): the title and ×, 52 px rows on hairlines, each
 * a lead slot, its word and a line at the right, the current one checked,
 * and a foot line. One pick at a time; a pick closes the sheet. Size and
 * Due date take the same shape [ASSUMPTION, not drawn].
 */
export interface FilterChoice<T> {
  value: T;
  label: string;
  /** The 16 px slot before the word: a client's tile, else empty. */
  lead?: React.ReactNode;
  /** "two Linear teams", muted at the right. */
  line?: string | null;
}

export interface FilterSheetProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  choices: FilterChoice<T>[];
  value: T;
  onPick: (value: T) => void;
  foot?: string;
}

export function FilterSheet<T extends string | null>({
  open,
  onOpenChange,
  title,
  choices,
  value,
  onPick,
  foot,
}: FilterSheetProps<T>) {
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const header = (
    <div className="flex min-w-0 flex-1 items-center justify-between">
      <Text
        ref={headingRef}
        as="h2"
        variant="row-title"
        tabIndex={-1}
        className="font-semibold outline-none"
      >
        {title}
      </Text>
      <Button
        variant="ghost"
        size="icon"
        aria-label={COPY.close}
        onClick={() => onOpenChange(false)}
        className="text-foreground -me-(--space-3)"
      >
        <CloseIcon aria-hidden="true" className="size-3" />
      </Button>
    </div>
  );
  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      header={header}
      headerAction={null}
      classes={{
        header: "px-5 pt-(--space-2)",
        body: "px-5 pt-0 pb-(--space-8)",
      }}
    >
      <div role="radiogroup" aria-label={title} className="flex flex-col">
        {choices.map((choice) => {
          const on = choice.value === value;
          return (
            <button
              key={choice.value ?? "any"}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => {
                onPick(choice.value);
                onOpenChange(false);
              }}
              className="border-hairline hover:bg-surface flex min-h-13 items-center gap-(--space-3) border-b text-start focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <span className="inline-flex size-4 shrink-0 items-center justify-center">
                {choice.lead}
              </span>
              <span
                className={cn(
                  "text-(length:--fs-body) text-foreground min-w-0 flex-1 truncate",
                  choice.value === null && "font-medium",
                )}
              >
                {choice.label}
              </span>
              {choice.line ? (
                <Text as="span" variant="caption" tone="muted">
                  {choice.line}
                </Text>
              ) : null}
              <span className="inline-flex size-4 shrink-0 items-center justify-center">
                {on ? (
                  <DoneIcon aria-hidden="true" className="size-3.5" />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
      {foot ? (
        <Text
          as="p"
          variant="secondary"
          tone="muted"
          className="pt-(--space-3)"
        >
          {foot}
        </Text>
      ) : null}
    </ResponsiveSheet>
  );
}
