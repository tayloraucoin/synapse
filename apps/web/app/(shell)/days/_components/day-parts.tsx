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
  TimePicker,
} from "@syn/ui";
import { parseTypedClock } from "@syn/utils";
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
 * A bounds field ("Up at 7:00"): the time, typeable, and the clock beside it
 * opening the house's 24-hour picker (USE-141; time-picker.md), never the
 * browser's own. A grey suggestion shows in muted until a time is set, and
 * is never saved on its own (empty-first-day.md). Typing reads on blur or
 * Enter ("630" is 6:30; any minute is kept); a picker's pick reads in the
 * field as the lists move, and Done commits it. A change is kept as a draft
 * until it lands, so a failed save leaves it on screen (saved.md).
 */
export function BoundsField({
  label,
  value,
  suggestion,
  onCommit,
  stacked = false,
  disabled = false,
  pickerOpen = false,
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
  /** The picker open on load (`?state=time-picker`). */
  pickerOpen?: boolean;
}) {
  const id = React.useId();
  // What the field shows while it is being changed: typed words, or a pick.
  const [typed, setTyped] = React.useState<string | null>(null);
  const suggested = typed === null && value === null;
  const base = value ?? suggestion ?? null;
  const shown = typed ?? (base === null ? "" : clockWords(base));

  const commitTyped = () => {
    if (typed === null) return;
    const next = parseTypedClock(typed);
    setTyped(null);
    if (next !== null && next !== value) onCommit(next);
  };

  const input = (
    <input
      id={id}
      type="text"
      size={5}
      inputMode="numeric"
      autoComplete="off"
      value={shown}
      disabled={disabled}
      onChange={(event) => setTyped(event.target.value)}
      onBlur={commitTyped}
      onKeyDown={(event) => {
        if (event.key === "Enter") commitTyped();
        if (event.key === "Escape") setTyped(null);
      }}
      className={cn(
        "min-w-0 flex-1 bg-transparent tabular-nums outline-none disabled:cursor-default",
        // A suggestion reads light and regular; a set time in ink, semibold.
        suggested ? "text-muted-foreground" : "font-semibold text-foreground",
      )}
    />
  );
  const picker = (field: (trigger: React.ReactNode) => React.ReactElement) => (
    <TimePicker
      label={label}
      value={value}
      fallback={suggestion}
      disabled={disabled}
      defaultOpen={pickerOpen}
      renderField={field}
      onPreview={(next) =>
        setTyped(next === null || next === value ? null : clockWords(next))
      }
      onCommit={(next) => {
        setTyped(null);
        if (next !== value) onCommit(next);
      }}
    />
  );

  if (stacked) {
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-(--space-1)">
        <label htmlFor={id}>
          <Text as="span" variant="secondary" weight={500}>
            {label}
          </Text>
        </label>
        {picker((trigger) => (
          <div className="flex h-(--target) min-w-0 items-center rounded-(--radius-control) border border-input ps-(--space-3) pe-(--space-1) focus-within:border-foreground focus-within:ring-1 focus-within:ring-foreground">
            {input}
            {trigger}
          </div>
        ))}
      </div>
    );
  }
  return picker((trigger) => (
    <div
      data-disabled={disabled || undefined}
      className="flex h-9 shrink-0 items-center gap-(--space-1) rounded-(--radius-control) border border-border ps-(--space-3) text-(length:--fs-body) whitespace-nowrap focus-within:border-foreground focus-within:ring-1 focus-within:ring-foreground data-disabled:opacity-45"
    >
      <label htmlFor={id}>
        <Text as="span" variant="secondary" tone="muted">
          {label}
        </Text>
      </label>
      <span className="flex w-12">{input}</span>
      {/* In the 36 px day line the clock keeps its 44 px width. */}
      <span className="flex h-9 items-center overflow-hidden">{trigger}</span>
    </div>
  ));
}

/**
 * The day's ··· (day-menu.md, D-USE-87): a dropdown under the round button,
 * right-aligned, titled with the day ("Monday, 12 October", or "Every
 * Monday"): Copy from…, Reset to usual <weekday> (This week only, once the
 * day differs from its usual), a separator, then Clear this day in ink,
 * never red, disabled with no blocks. Event is the +'s. The button takes an
 * ink ring while open. Copy from… opens USE-45's picker; with no other
 * day built it does not show [ASSUMPTION]. Offline the button is faded and
 * inert (D-USE-82).
 */
export function DayMenu({
  title,
  day,
  resetTo,
  canClear,
  canCopy,
  disabled,
  defaultOpen = false,
  triggerRef,
  onCopyFrom,
  onReset,
  onClear,
}: {
  title: string;
  /** The weekday's name, for the button's name. */
  day: string;
  /** "Monday" when Reset to usual shows; null hides it. */
  resetTo: string | null;
  canClear: boolean;
  /** Another day is built: Copy from… shows. */
  canCopy: boolean;
  disabled: boolean;
  defaultOpen?: boolean;
  /** Where focus returns when the picker or the ask closes. */
  triggerRef?: React.Ref<HTMLButtonElement>;
  onCopyFrom: () => void;
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
        ref={triggerRef}
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
        {canCopy ? (
          <DropdownMenuItem onSelect={onCopyFrom} className={row}>
            <CopyFromIcon aria-hidden="true" className={icon} />
            <Text as="span" variant="body" weight={500}>
              {COPY.copyFrom}
            </Text>
          </DropdownMenuItem>
        ) : null}
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
 * The day's one ask (D-USE-32): Replace's (replace-confirm.md, USE-45) and
 * Clear's in its form (day-menu.md, D-USE-87). An AlertDialog naming what
 * goes, the action in ink, never red, and Cancel, where focus starts; Esc
 * cancels. A Toaster with Undo follows.
 */
export function DayAsk({
  open,
  words,
  action,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  words: { title: string; body: string };
  /** "Clear" or "Replace". */
  action: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
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
          <AlertDialogAction onClick={onConfirm}>{action}</AlertDialogAction>
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
 * saved block, which opens USE-45's picker of other days' blocks
 * (D-USE-87), and takes no tap when none is there. Event opens the Add
 * event sheet (USE-53).
 */
export function PlusMenu({
  day,
  disabled,
  defaultOpen = false,
  event = false,
  savedDisabled = false,
  triggerRef,
  onBlock,
  onTransition,
  onSaved,
  onEvent,
}: {
  day: string;
  disabled: boolean;
  defaultOpen?: boolean;
  /** This week: Event, at a set time on this date only. */
  event?: boolean;
  /** No other day's block to take. */
  savedDisabled?: boolean;
  triggerRef?: React.Ref<HTMLButtonElement>;
  onBlock: () => void;
  onTransition: () => void;
  onSaved: () => void;
  /** Event's Add event sheet (USE-53); unset, the row takes no tap. */
  onEvent?: () => void;
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
            ...(onEvent ? { onSelect: onEvent } : { disabled: true }),
          },
        ]
      : []),
    {
      label: COPY.fromSaved,
      line: COPY.fromSavedLine,
      icon: SavedBlockIcon,
      separated: true,
      onSelect: onSaved,
      disabled: savedDisabled,
    },
  ];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger
        ref={triggerRef}
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
