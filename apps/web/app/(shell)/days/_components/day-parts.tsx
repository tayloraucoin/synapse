"use client";

import * as React from "react";
import {
  AddEventIcon,
  AddIcon,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  CloseIcon,
  cn,
  CopyFromIcon,
  DeleteIcon,
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
  ResetToUsualIcon,
  SavedBlockIcon,
  StatusLine,
  Text,
  type LucideIcon,
} from "@syn/ui";
import { clockWords } from "@/lib/data/set-up-view";
import { DAYS_COPY as COPY } from "./copy";

/**
 * The day's own parts (USE-39; layout.md 4 and 5): the chips, the bounds
 * fields, the ··· and its menu, the + and its menu, the install offer, and
 * Clear's one ask (USE-42).
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
  disabled = false,
}: {
  label: string;
  /** The saved time, or the draft, "HH:MM"; null shows the suggestion. */
  value: string | null;
  suggestion?: string;
  onCommit: (value: string) => void;
  /** Labelled above (the empty first day), not inline. */
  stacked?: boolean;
  /** Offline (D-USE-82): faded and inert. */
  disabled?: boolean;
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
        disabled={disabled}
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
        className="absolute inset-0 w-full cursor-pointer opacity-0 disabled:cursor-default"
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
    <div
      data-disabled={disabled || undefined}
      className="flex h-9 shrink-0 items-center gap-(--space-2) rounded-(--radius-control) border border-border px-(--space-3) text-(length:--fs-body) whitespace-nowrap focus-within:border-foreground focus-within:ring-1 focus-within:ring-foreground data-disabled:opacity-45"
    >
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
 * The day's ··· (day-menu.md, D-USE-87): a dropdown under the round button,
 * right-aligned, titled with the day ("Monday, 12 October", or "Every
 * Monday"): Copy from…, Reset to usual <weekday> (This week only, once the
 * day differs from its usual), a separator, then Clear this day in ink,
 * never red, disabled with no blocks. Event is the +'s. The button takes an
 * ink ring while open. Copy from's picker is its own ticket's; until then
 * the row shows and takes no tap [ASSUMPTION]. Offline the button is faded
 * and inert (D-USE-82).
 */
export function DayMenu({
  title,
  day,
  resetTo,
  canClear,
  disabled,
  defaultOpen = false,
  onReset,
  onClear,
}: {
  title: string;
  /** The weekday's name, for the button's name. */
  day: string;
  /** "Monday" when Reset to usual shows; null hides it. */
  resetTo: string | null;
  canClear: boolean;
  disabled: boolean;
  defaultOpen?: boolean;
  onReset: () => void;
  onClear: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  // Seeded after mount, so the server and the first paint agree.
  React.useEffect(() => {
    if (defaultOpen && !disabled) setOpen(true);
  }, [defaultOpen, disabled]);

  const row =
    "flex min-h-(--target) items-center gap-(--space-3) px-(--space-4) py-(--space-2)";
  const icon = "size-4 shrink-0 text-muted-foreground";
  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger
        aria-label={COPY.dayMenu(day)}
        disabled={disabled}
        className="group inline-flex size-(--target) shrink-0 items-center justify-center rounded-full focus-visible:outline-none disabled:cursor-default"
      >
        <span
          aria-hidden="true"
          className={cn(
            "flex size-8 items-center justify-center rounded-full bg-surface text-foreground",
            "group-focus-visible:ring-2 group-focus-visible:ring-ring",
            "group-data-[state=open]:ring-2 group-data-[state=open]:ring-foreground",
            "group-disabled:opacity-45",
          )}
        >
          <MoreIcon className="size-4" />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={4}
        className="w-64 rounded-(--radius-sheet) bg-background p-0 py-(--space-1) shadow-menu motion-reduce:animate-none"
      >
        <DropdownMenuLabel className="px-(--space-4) pt-(--space-2) pb-(--space-1) text-(length:--fs-caption) font-medium text-muted-foreground">
          {title}
        </DropdownMenuLabel>
        <DropdownMenuItem disabled className={row}>
          <CopyFromIcon aria-hidden="true" className={icon} />
          <Text as="span" variant="body" weight={500}>
            {COPY.copyFrom}
          </Text>
        </DropdownMenuItem>
        {resetTo !== null ? (
          <DropdownMenuItem onSelect={onReset} className={row}>
            <ResetToUsualIcon aria-hidden="true" className={icon} />
            <Text as="span" variant="body" weight={500}>
              {COPY.resetTo(resetTo)}
            </Text>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator className="mx-(--space-4) my-(--space-1)" />
        <DropdownMenuItem
          disabled={!canClear}
          onSelect={onClear}
          className={row}
        >
          <DeleteIcon
            aria-hidden="true"
            className="size-4 shrink-0 text-foreground"
          />
          <Text as="span" variant="body" weight={500} tone="ink">
            {COPY.clearDay}
          </Text>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Clear's one ask (day-menu.md, D-USE-87): Replace's form (D-USE-32), an
 * AlertDialog "Clear Monday, 12 October?" naming what goes, Clear in ink
 * and Cancel. A Toaster with Undo follows.
 */
export function ClearDialog({
  open,
  words,
  onOpenChange,
  onClear,
}: {
  open: boolean;
  words: { title: string; body: string };
  onOpenChange: (open: boolean) => void;
  onClear: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="motion-reduce:animate-none">
        <AlertDialogHeader>
          <AlertDialogTitle>{words.title}</AlertDialogTitle>
          <AlertDialogDescription>{words.body}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{COPY.cancel}</AlertDialogCancel>
          <AlertDialogAction onClick={onClear}>{COPY.clear}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
 * Block, Transition, in This week Event (USE-42), a separator, From a
 * saved block. Event's sheet is the Add event ticket's and From a saved
 * block's picker the Copy from ticket's; until then each row shows and
 * takes no tap [ASSUMPTION].
 */
export function PlusMenu({
  day,
  disabled,
  defaultOpen = false,
  event = false,
  onBlock,
  onTransition,
}: {
  day: string;
  disabled: boolean;
  defaultOpen?: boolean;
  /** This week: Event, at a set time on this date only. */
  event?: boolean;
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
    ...(event
      ? [
          {
            label: COPY.event,
            line: COPY.eventLine,
            icon: AddEventIcon,
            disabled: true,
          },
        ]
      : []),
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
