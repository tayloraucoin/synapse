"use client";

import * as React from "react";
import { Button, CloseIcon, cn, ResponsiveSheet, Text } from "@syn/ui";
import { addChoices, choiceName, type AddChoice } from "./choices";
import { ADD_COPY as COPY } from "./copy";

/**
 * AddSheet — + Add on the phone (USE-51; add/states/add-sheet.md, D-USE-51,
 * D-USE-54, D-USE-108 (1)): "Add" over the day and block, × on the right
 * (this sheet has no back and no ···), then the desk menu's four as rows
 * with a muted leading icon and a muted line. A row opens its step; × or a
 * swipe down adds nothing. The sheet traps focus and returns it to + on
 * close.
 */
export interface AddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "Mon 12 · Work, 9:30 to 12:00". */
  blockLine: string;
  /** The signed-in person, for "Linear issues assigned to <name>". */
  personName: string;
  onChoose: (choice: AddChoice) => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

export function AddSheet({
  open,
  onOpenChange,
  blockLine,
  personName,
  onChoose,
  returnFocusRef,
}: AddSheetProps) {
  const choices = addChoices(personName);

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={COPY.title}
      subtitle={blockLine}
      headerAction={
        <Button
          variant="ghost"
          size="icon"
          aria-label={COPY.close}
          onClick={() => onOpenChange(false)}
          className="-me-(--space-2) text-foreground"
        >
          <CloseIcon aria-hidden="true" />
        </Button>
      }
      returnFocusRef={returnFocusRef}
      classes={{
        subtitle: "text-(length:--fs-caption)",
        body: "pt-(--space-2) pb-[calc(var(--space-8)+env(safe-area-inset-bottom))]",
      }}
    >
      <ul className="flex flex-col" data-add-choices="">
        {choices.map((view, index) => (
          <li
            key={view.choice}
            className={cn(
              index < choices.length - 1 && "border-hairline border-b",
            )}
          >
            <button
              type="button"
              aria-label={choiceName(view)}
              onClick={() => onChoose(view.choice)}
              className={cn(
                "flex min-h-16 w-full items-center gap-(--space-3) py-(--space-3) text-start",
                "hover:bg-surface focus-visible:ring-ring rounded-(--radius-control) focus-visible:ring-2 focus-visible:outline-none",
              )}
            >
              <view.Icon
                aria-hidden="true"
                className="text-muted-foreground size-5 shrink-0"
              />
              <span className="flex min-w-0 flex-col">
                <Text as="span" variant="body" weight={500}>
                  {view.label}
                </Text>
                <Text as="span" variant="secondary" tone="muted">
                  {view.line}
                </Text>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </ResponsiveSheet>
  );
}
