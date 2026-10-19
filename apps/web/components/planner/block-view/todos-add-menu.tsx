"use client";

import * as React from "react";
import {
  AddIcon,
  ChecklistIcon,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  MeetingIcon,
  Text,
} from "@syn/ui";
import { HUE_CHIP, HUE_DOT } from "../block-hue";

/**
 * TodosAddMenu — a To-dos block's add row in editing (USE-50; block-view/
 * states/todos-add-open.md, D-USE-28): "+ Add to Errands", pressed, takes a
 * muted fill and opens a dropdown under it titled "Add to Errands": From
 * To-dos (the list glyph) and New to-do ("+"), a separator, then the footer
 * line "A new one lands here and in To-dos." Tapping outside closes it with
 * nothing changed. Props only.
 */
export interface TodosAddMenuProps {
  /** "Add to Errands": the row's words and the menu's title. */
  label: string;
  words: { fromTodos: string; newTodo: string; footer: string };
  onFromTodos: () => void;
  onNewTodo: () => void;
  /** Open on load (`?state=todos-add-open`). */
  defaultOpen?: boolean;
}

const ITEM =
  "min-h-(--target) gap-(--space-3) px-(--space-4) text-(length:--fs-body) text-foreground";
const GLYPH = "size-4 text-muted-foreground";

export function TodosAddMenu({
  label,
  words,
  onFromTodos,
  onNewTodo,
  defaultOpen = false,
}: TodosAddMenuProps) {
  const [open, setOpen] = React.useState(false);
  // Seeded after mount, so the server and the first paint agree.
  React.useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger
        data-todos-add
        className={cn(
          "text-text-muted flex min-h-(--row-min) w-full items-center gap-(--space-3) rounded-(--radius-control) px-(--space-1) text-start text-(length:--fs-body) outline-none",
          "focus-visible:ring-ring focus-visible:ring-2",
          open && "bg-fill-muted",
        )}
      >
        <AddIcon aria-hidden="true" className="size-4 shrink-0" />
        {label}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={4}
        className={cn(
          "w-60 rounded-(--radius-sheet) bg-background p-0 py-(--space-1) shadow-menu",
          "motion-reduce:animate-none",
        )}
      >
        <DropdownMenuLabel className="px-(--space-4) pt-(--space-2) pb-(--space-1) text-(length:--fs-caption) font-medium text-muted-foreground">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuItem className={ITEM} onSelect={onFromTodos}>
          <ChecklistIcon aria-hidden="true" className={GLYPH} />
          {words.fromTodos}
        </DropdownMenuItem>
        <DropdownMenuItem className={ITEM} onSelect={onNewTodo}>
          <AddIcon aria-hidden="true" className={GLYPH} />
          {words.newTodo}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="mx-(--space-4) my-(--space-1)" />
        <Text
          as="p"
          variant="caption"
          tone="muted"
          className="px-(--space-4) pt-(--space-1) pb-(--space-2)"
        >
          {words.footer}
        </Text>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * EventBandRow — a dated plan inside a block in editing (USE-50;
 * todos-dated-plan.md, D-USE-31, D-USE-79): a plum fill with a darker plum
 * edge at the leading side, the calendar icon, its name strong, and
 * "Personal · 11:00 to 11:30" trailing, muted; no grip, no length. It is
 * pinned: the rows re-flow around it. Events stay plum, told from violet by
 * form (a fill with the calendar icon). With `onOpen` the band is a button
 * that opens its event (USE-111, "Tap the band: the event"). Props only.
 */
export function EventBandRow({
  title,
  words,
  onOpen,
}: {
  title: string;
  /** "Personal · 11:00 to 11:30". */
  words: string;
  onOpen?: () => void;
}) {
  const className = cn(
    "flex min-h-(--row-min) w-full items-stretch overflow-hidden rounded-(--radius-control) text-start",
    HUE_CHIP.plum,
    onOpen !== undefined &&
      "outline-none focus-visible:ring-2 focus-visible:ring-ring",
  );
  const body = (
    <>
      <span
        aria-hidden="true"
        className={cn("w-0.75 shrink-0", HUE_DOT.plum)}
      />
      <span className="flex min-w-0 flex-1 items-center gap-(--space-2) px-(--space-3)">
        <MeetingIcon aria-hidden="true" className="size-4 shrink-0" />
        <Text as="span" variant="body" weight={600} truncate>
          {title}
        </Text>
        <Text
          as="span"
          variant="caption"
          tone="muted"
          className="ms-auto shrink-0 tabular-nums"
        >
          {words}
        </Text>
      </span>
    </>
  );
  return onOpen === undefined ? (
    <div data-event-band className={className}>
      {body}
    </div>
  ) : (
    <button
      type="button"
      data-event-band
      data-row-open
      onClick={onOpen}
      className={className}
    >
      {body}
    </button>
  );
}
