"use client";

import * as React from "react";
import {
  AddIcon,
  CloseIcon,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  HomeScreenOfferIcon,
  MoreIcon,
  NewBlockIcon,
  NewTransitionIcon,
  SavedBlockIcon,
  StatusLine,
  Text,
  type LucideIcon,
} from "@syn/ui";
import { clockWords } from "@/lib/data/set-up-view";
import { DAYS_COPY as COPY } from "./copy";

/**
 * The day's own parts (USE-39; layout.md 4 and 5): the chips, the bounds
 * fields, the ··· button, the + and its menu, and the install offer.
 */

/* ---------------------------------------------------------------- chips -- */

export interface DayChip {
  weekday: number;
  /** "M", or dated "M 12". */
  label: string;
  /** "Monday", or dated "Monday 12 October". */
  name: string;
  set: boolean;
}

/**
 * WeekdayChips as Set my days draws them: seven 44 × 48 chips, a radio group
 * "Day" (arrows move between them), the open one ink, a dot under a built
 * day. Below 356 px they scroll sideways, the open chip kept in view
 * (D-USE-87).
 */
export function DayChips({
  chips,
  value,
  onChange,
}: {
  chips: readonly DayChip[];
  value: number;
  onChange: (weekday: number) => void;
}) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  React.useEffect(() => {
    refs.current[value]?.scrollIntoView?.({
      block: "nearest",
      inline: "nearest",
    });
  }, [value]);

  const move = (event: React.KeyboardEvent, from: number) => {
    const by =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (by === 0) return;
    event.preventDefault();
    const next = (from + by + chips.length) % chips.length;
    onChange(next);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={COPY.day}
      className="flex gap-(--space-1) overflow-x-auto px-(--space-4) [scrollbar-width:none]"
    >
      {chips.map((chip) => {
        const open = chip.weekday === value;
        return (
          <button
            key={chip.weekday}
            ref={(node) => {
              refs.current[chip.weekday] = node;
            }}
            type="button"
            role="radio"
            aria-checked={open}
            aria-label={COPY.chip(chip.name, chip.set)}
            tabIndex={open ? 0 : -1}
            onClick={() => onChange(chip.weekday)}
            onKeyDown={(event) => move(event, chip.weekday)}
            className={cn(
              "flex h-12 min-w-11 flex-1 shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-(--radius-control) border",
              "text-(length:--fs-body) font-medium tabular-nums",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
              open
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-foreground hover:bg-surface",
            )}
          >
            <span>{chip.label}</span>
            <span
              aria-hidden="true"
              className={cn(
                "size-1 rounded-full",
                chip.set ? (open ? "bg-background" : "bg-foreground") : null,
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------------- bounds -- */

/**
 * A compact bounds field ("Up at 7:00"): the word and a native time input in
 * one outlined control. A grey suggestion shows in muted until a time is
 * picked, and is never saved (empty-first-day.md). A change is kept as a
 * draft until it lands, so a failed save leaves it on screen (saved.md).
 */
export function BoundsField({
  label,
  value,
  suggestion,
  onCommit,
  stacked = false,
}: {
  label: string;
  /** The saved time, or the draft, "HH:MM"; null shows the suggestion. */
  value: string | null;
  suggestion?: string;
  onCommit: (value: string) => void;
  /** Labelled above (the empty first day), not inline. */
  stacked?: boolean;
}) {
  const id = React.useId();
  const [typed, setTyped] = React.useState<string | null>(null);
  const shown = typed ?? value ?? suggestion ?? "";
  const suggested = typed === null && value === null;

  const commit = () => {
    if (typed !== null && typed !== "" && typed !== value) onCommit(typed);
    setTyped(null);
  };

  // The time reads in the house's words ("7:00", 24-hour) whatever the
  // browser's locale; the native input lies over it, see-through, for the
  // platform's own picker and typing.
  const input = (
    <span className="relative inline-flex min-w-0 items-center">
      <span
        aria-hidden="true"
        className={cn(
          "font-semibold tabular-nums",
          suggested ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {shown === "" ? "" : clockWords(shown)}
      </span>
      <input
        id={id}
        type="time"
        value={shown}
        onChange={(event) => setTyped(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
        }}
        onClick={(event) => {
          try {
            event.currentTarget.showPicker();
          } catch {
            // Not every browser opens it from a click; focus still types.
          }
        }}
        className="absolute inset-0 w-full cursor-pointer opacity-0"
      />
    </span>
  );

  if (stacked) {
    return (
      <div className="flex flex-1 flex-col gap-(--space-1)">
        <label htmlFor={id}>
          <Text as="span" variant="secondary" weight={500}>
            {label}
          </Text>
        </label>
        <div className="relative flex h-(--target) items-center rounded-(--radius-control) border border-input px-(--space-3) focus-within:border-foreground focus-within:ring-1 focus-within:ring-foreground">
          {input}
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-9 shrink-0 items-center gap-(--space-2) rounded-(--radius-control) border border-border px-(--space-3) text-(length:--fs-body) whitespace-nowrap focus-within:border-foreground focus-within:ring-1 focus-within:ring-foreground">
      <label htmlFor={id}>
        <Text as="span" variant="secondary" tone="muted">
          {label}
        </Text>
      </label>
      {input}
    </div>
  );
}

/**
 * The day's ··· (layout.md 4). Its menu, Copy from…, Reset to usual and
 * Clear this day, is Set my days part 2's (USE-42); until then the button
 * holds its place and takes no tap [ASSUMPTION].
 */
export function DayMenuButton({ day }: { day: string }) {
  return (
    <button
      type="button"
      aria-label={COPY.dayMenu(day)}
      disabled
      className="inline-flex size-(--target) shrink-0 items-center justify-center rounded-full disabled:cursor-default"
    >
      <span
        aria-hidden="true"
        className="flex size-8 items-center justify-center rounded-full bg-surface text-foreground"
      >
        <MoreIcon className="size-4" />
      </span>
    </button>
  );
}

/* -------------------------------------------------------------- the + -- */

interface PlusRow {
  label: string;
  line: string;
  icon: LucideIcon;
  onSelect?: () => void;
  separated?: boolean;
  disabled?: boolean;
}

/**
 * The + (plus-menu.md): a round 56 px ink button that turns to × while its
 * menu is open, a dropdown above it (D-USE-28) titled "Add to <weekday>":
 * Block, Transition, a separator, From a saved block. Event is This week's
 * (USE-42). From a saved block's picker is the Copy from ticket's; until
 * then the row shows and takes no tap [ASSUMPTION].
 */
export function PlusMenu({
  day,
  disabled,
  defaultOpen = false,
  onBlock,
  onTransition,
}: {
  day: string;
  disabled: boolean;
  defaultOpen?: boolean;
  onBlock: () => void;
  onTransition: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  // Seeded after mount, so the server and the first paint agree.
  React.useEffect(() => {
    if (defaultOpen && !disabled) setOpen(true);
  }, [defaultOpen, disabled]);

  const rows: PlusRow[] = [
    {
      label: COPY.block,
      line: COPY.blockLine,
      icon: NewBlockIcon,
      onSelect: onBlock,
    },
    {
      label: COPY.transition,
      line: COPY.transitionLine,
      icon: NewTransitionIcon,
      onSelect: onTransition,
    },
    {
      label: COPY.fromSaved,
      line: COPY.fromSavedLine,
      icon: SavedBlockIcon,
      separated: true,
      disabled: true,
    },
  ];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger
        disabled={disabled}
        aria-label={open ? COPY.closeAdd : COPY.addTo(day)}
        className={cn(
          "flex size-14 items-center justify-center rounded-full bg-foreground text-background",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
          "disabled:bg-fill-muted disabled:text-muted-foreground",
        )}
      >
        {open ? (
          <CloseIcon aria-hidden="true" className="size-6" />
        ) : (
          <AddIcon aria-hidden="true" className="size-6" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="end"
        sideOffset={8}
        className="w-72 rounded-(--radius-sheet) bg-background p-0 py-(--space-1) shadow-menu motion-reduce:animate-none"
      >
        <DropdownMenuLabel className="px-(--space-4) pt-(--space-2) pb-(--space-1) text-(length:--fs-caption) font-medium text-muted-foreground">
          {COPY.addTo(day)}
        </DropdownMenuLabel>
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <React.Fragment key={row.label}>
              {row.separated ? (
                <DropdownMenuSeparator className="mx-(--space-4) my-(--space-1)" />
              ) : null}
              <DropdownMenuItem
                disabled={row.disabled}
                onSelect={row.onSelect}
                className="flex min-h-(--target) items-start gap-(--space-3) px-(--space-4) py-(--space-2)"
              >
                <Icon
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
                <span className="flex flex-col gap-0.5">
                  <Text as="span" variant="body" weight={500}>
                    {row.label}
                  </Text>
                  <Text as="span" variant="caption" tone="muted">
                    {row.line}
                  </Text>
                </span>
              </DropdownMenuItem>
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------------------------------- install offer -- */

/**
 * The install offer, once (install-offer.md): a StatusLine, inline, bottom
 * left beside the +, with the phone glyph and How. It takes no tap to
 * dismiss; How or leaving Set my days ends it for good.
 */
export function InstallOffer({ onHow }: { onHow: () => void }) {
  return (
    <StatusLine
      variant="install"
      placement="inline"
      text={
        <span className="flex items-center gap-(--space-2)">
          <HomeScreenOfferIcon aria-hidden="true" className="size-4 shrink-0" />
          {COPY.installOffer}
        </span>
      }
      action={{ label: COPY.how, onClick: onHow }}
      className="min-h-(--target) underline-offset-2 [&_button]:underline"
    />
  );
}
