"use client";

import * as React from "react";
import {
  AddIcon,
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  ExpandIcon,
} from "@syn/ui";
import { addChoices, type AddChoice } from "./choices";
import { ADD_COPY as COPY } from "./copy";

/**
 * AddMenu — "+ Add ⌄" at the desk (USE-51; add/index.md, D-USE-42): a
 * DropdownMenu under the button with the phone sheet's four in the same
 * order, a leading icon each, a rule before Event. Arrow keys, Enter and
 * Esc are Radix's; T, P, D and E pick a row inside it [PROPOSED, shipped].
 * Focus returns to "+ Add" on close.
 */
export interface AddMenuProps {
  personName: string;
  onChoose: (choice: AddChoice) => void;
  /** Open on load, for its `?state=` capture. */
  defaultOpen?: boolean;
  /** The button, so a sheet opened from a row can return focus to it. */
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

const ROW =
  "min-h-(--target) gap-(--space-3) px-(--space-3) text-(length:--fs-body) text-foreground";

export function AddMenu({
  personName,
  onChoose,
  defaultOpen = false,
  triggerRef,
}: AddMenuProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const choices = addChoices(personName);

  function choose(choice: AddChoice) {
    setOpen(false);
    onChoose(choice);
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button ref={triggerRef} variant="secondary" size="sm">
          <AddIcon aria-hidden="true" className="size-4" />
          {COPY.trigger}
          <ExpandIcon
            aria-hidden="true"
            className="text-muted-foreground size-4"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        // The letters win over Radix's typeahead, which would match "To-do" on T.
        onKeyDown={(event) => {
          if (event.metaKey || event.ctrlKey || event.altKey) return;
          const view = choices.find((c) => c.key === event.key.toUpperCase());
          if (view === undefined) return;
          event.preventDefault();
          choose(view.choice);
        }}
        className={cn(
          "w-(--menu-w) rounded-(--radius-sheet) bg-background p-(--space-1) shadow-menu",
          "motion-reduce:animate-none",
        )}
      >
        {choices.map((view) => (
          <React.Fragment key={view.choice}>
            {view.choice === "event" ? (
              <DropdownMenuSeparator className="mx-0" />
            ) : null}
            <DropdownMenuItem
              className={ROW}
              onSelect={() => onChoose(view.choice)}
            >
              <view.Icon
                aria-hidden="true"
                className="text-muted-foreground size-5"
              />
              {view.label}
              <DropdownMenuShortcut aria-hidden="true">
                {view.key}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
