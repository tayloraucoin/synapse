/**
 * TimePicker — the house's 24-hour picker (USE-141; set-my-days
 * states/time-picker.md). It bends Epic 1 §0.3's "native picker on both
 * platforms" on Taylor's word of 2026-10-19: the browser's own picker
 * ignored the tokens and was never drawn.
 *
 * The trigger is the field's clock, its own 44 px button ("Choose a time
 * for Up at"). Below the split break it opens a bottom Drawer: the label,
 * the time large, the two lists, Done; at the break a Popover under the
 * field holds the lists and Done. Hour is 0 to 23 and Minute steps by 5;
 * each is a `listbox` whose pick is filled ink with a check, so colour is
 * never the only sign. Arrows move one, Page Up and Down five, Home and
 * End go to the ends, digits type ahead (`@syn/utils` time-picker).
 *
 * Every pick is previewed (`onPreview`), so the field reads the time as
 * the lists move; Done commits it (`onCommit`); Escape, the × or a tap
 * outside puts back the time it opened with. Focus returns to the trigger.
 * A typed minute off the step is kept: the minute list then shows no pick
 * until one is chosen. Built on Drawer (vaul) and Popover (radix-ui): no
 * new dependency.
 */
"use client";

import {
  joinClock,
  PICKER_HOURS,
  pickerKeyMove,
  pickerMinutes,
  pickerTypeAhead,
  splitClock,
} from "@syn/utils";
import { CheckIcon, Clock3Icon, XIcon } from "lucide-react";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { useIsSplit } from "../../../lib/use-media-query";
import { Button } from "../../../primitives/control/button";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "../../../primitives/feedback/popover";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "../../../primitives/layout/drawer";
import { Text } from "../../../primitives/typography/text";
import { TIME_PICKER_COPY as COPY } from "./copy";

export interface TimePickerProps {
  /** The field's label: names the trigger and the dialog ("Up at"). */
  label: string;
  /** "HH:mm" as the field shows it now, or null. */
  value: string | null;
  /** Where the lists open when there is no value: the field's suggestion. */
  fallback?: string;
  /** Each pick, and the opening time put back on a dismiss. */
  onPreview?: (value: string | null) => void;
  /** Done: the time to keep. */
  onCommit: (value: string) => void;
  minuteStep?: number;
  disabled?: boolean;
  /**
   * The field around the clock: rendered here so the popover sits under the
   * whole field at the split break, not under the clock alone.
   */
  renderField?: (trigger: React.ReactNode) => React.ReactElement;
  /** Controlled open state. */
  open?: boolean;
  /** Open on mount (a `?state=` frame). */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

/** "6:30" from "06:30": 24-hour, no leading zero (words-and-access.md). */
function readout(value: string | null): string {
  const clock = splitClock(value);
  return clock === null
    ? ""
    : `${clock.hour}:${String(clock.minute).padStart(2, "0")}`;
}

export function TimePicker({
  label,
  value,
  fallback,
  onPreview,
  onCommit,
  minuteStep = 5,
  disabled = false,
  renderField,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  className,
}: TimePickerProps) {
  const split = useIsSplit();
  const [openState, setOpenState] = React.useState(false);
  // Opened on load one effect late, once the field it sits under is laid out.
  React.useEffect(() => {
    if (defaultOpen) setOpenState(true);
  }, [defaultOpen]);
  const open = openProp ?? openState;
  const opening = React.useRef<string | null>(value);
  const kept = React.useRef(false);
  const [draft, setDraft] = React.useState<string | null>(
    value ?? fallback ?? null,
  );

  const setOpen = (next: boolean) => {
    if (next) {
      opening.current = value;
      kept.current = false;
      setDraft(value ?? fallback ?? null);
    } else if (!kept.current) {
      // A dismiss: the time it opened with goes back.
      onPreview?.(opening.current);
    }
    setOpenState(next);
    onOpenChange?.(next);
  };

  const pick = (next: string) => {
    setDraft(next);
    onPreview?.(next);
  };

  const done = () => {
    if (draft !== null) onCommit(draft);
    kept.current = true;
    setOpen(false);
  };

  const trigger = (
    <button
      type="button"
      disabled={disabled}
      aria-label={COPY.choose(label)}
      aria-haspopup="dialog"
      className={cn(
        "inline-flex size-(--target) shrink-0 items-center justify-center rounded-(--radius-control) text-muted-foreground",
        "hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-45",
        className,
      )}
    >
      <Clock3Icon aria-hidden="true" className="size-4" />
    </button>
  );

  const lists = (
    <TimePickerLists value={draft} minuteStep={minuteStep} onPick={pick} />
  );
  const foot = (
    <div className="flex flex-col gap-(--space-3)">
      <Text as="p" variant="secondary" tone="muted">
        {COPY.helper}
      </Text>
      <Button size="lg" className="w-full" onClick={done}>
        {COPY.done}
      </Button>
    </div>
  );

  if (split) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        {renderField ? (
          <PopoverAnchor asChild>
            {renderField(<PopoverTrigger asChild>{trigger}</PopoverTrigger>)}
          </PopoverAnchor>
        ) : (
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        )}
        <PopoverContent
          align={renderField ? "start" : "end"}
          aria-label={label}
          className="flex w-80 flex-col gap-(--space-3) rounded-(--radius-sheet)"
        >
          {lists}
          {foot}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground={false}>
      {renderField ? (
        renderField(<DrawerTrigger asChild>{trigger}</DrawerTrigger>)
      ) : (
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      )}
      <DrawerContent className="bg-background" aria-describedby={undefined}>
        <div className="flex flex-col gap-(--space-4) px-(--space-4) pt-(--space-2) pb-(--space-8)">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <DrawerTitle className="text-(length:--fs-secondary) leading-(--lh-secondary) font-semibold text-muted-foreground">
                {label}
              </DrawerTitle>
              <Text
                as="p"
                variant="heading"
                aria-live="polite"
                className="tabular-nums"
              >
                {readout(draft)}
              </Text>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" aria-label={COPY.close}>
                <XIcon aria-hidden="true" />
              </Button>
            </DrawerClose>
          </div>
          {lists}
          {foot}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/**
 * The two lists side by side, Hour and Minute, each labelled above. Exported
 * for the static markup test and for a surface that hosts the lists itself.
 */
export function TimePickerLists({
  value,
  minuteStep = 5,
  onPick,
}: {
  value: string | null;
  minuteStep?: number;
  onPick: (value: string) => void;
}) {
  const clock = splitClock(value);
  const minutes = React.useMemo(() => pickerMinutes(minuteStep), [minuteStep]);
  const hour = clock?.hour ?? null;
  const minute = clock?.minute ?? null;
  const minuteIndex = minute === null ? -1 : minutes.indexOf(minute);
  return (
    <div className="flex gap-(--space-3)">
      <PickerListbox
        autoFocus
        label={COPY.hour}
        options={PICKER_HOURS}
        selected={hour}
        words={(h) => String(h)}
        onPick={(h) => onPick(joinClock(h, minute ?? 0))}
      />
      <PickerListbox
        label={COPY.minute}
        options={minutes}
        selected={minuteIndex === -1 ? null : minute}
        words={(m) => String(m).padStart(2, "0")}
        onPick={(m) => onPick(joinClock(hour ?? 0, m))}
      />
    </div>
  );
}

function PickerListbox({
  autoFocus = false,
  label,
  options,
  selected,
  words,
  onPick,
}: {
  /** Focus opens on this list's pick (the Hour list). */
  autoFocus?: boolean;
  label: string;
  options: readonly number[];
  selected: number | null;
  words: (option: number) => string;
  onPick: (option: number) => void;
}) {
  const id = React.useId();
  const listRef = React.useRef<HTMLUListElement>(null);
  const typed = React.useRef("");
  const index = selected === null ? null : options.indexOf(selected);
  const optionId = (i: number) => `${id}-${i}`;

  // Focus opens on the picked hour, after the sheet or popover has placed its own.
  React.useEffect(() => {
    if (!autoFocus) return;
    const frame = requestAnimationFrame(() =>
      listRef.current?.focus({ preventScroll: true }),
    );
    return () => cancelAnimationFrame(frame);
  }, [autoFocus]);

  // The pick stays centred in its own list as it moves; only the list
  // scrolls, never the page behind the sheet, and never smoothly.
  React.useEffect(() => {
    const list = listRef.current;
    if (index === null || list === null) return;
    const node = list.children[index] as HTMLElement | undefined;
    if (node === undefined) return;
    list.scrollTop = node.offsetTop - (list.clientHeight - node.offsetHeight) / 2;
  }, [index]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    const moved = pickerKeyMove(index, options.length, event.key);
    if (moved !== null) {
      event.preventDefault();
      typed.current = "";
      onPick(options[moved]!);
      return;
    }
    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      // Digits extend what was typed while they still name an option.
      const longer = pickerTypeAhead(options, typed.current + event.key);
      const found = longer ?? pickerTypeAhead(options, event.key);
      typed.current = longer !== null ? typed.current + event.key : event.key;
      if (found !== null) onPick(options[found]!);
    }
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-(--space-1)">
      <Text as="span" id={`${id}-label`} variant="secondary" weight={600}>
        {label}
      </Text>
      <ul
        ref={listRef}
        role="listbox"
        aria-labelledby={`${id}-label`}
        aria-activedescendant={index === null ? undefined : optionId(index)}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="relative flex max-h-[calc(var(--target)*5+var(--space-2))] flex-col overflow-y-auto rounded-(--radius-control) border border-border p-(--space-1) focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {options.map((option, i) => {
          const picked = i === index;
          return (
            <li
              key={option}
              id={optionId(i)}
              role="option"
              aria-selected={picked}
              onClick={() => onPick(option)}
              className={cn(
                "flex h-(--target) shrink-0 cursor-pointer items-center justify-between rounded-(--radius-control) px-(--space-3) text-(length:--fs-heading) tabular-nums",
                picked
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "text-muted-foreground hover:bg-surface",
              )}
            >
              {words(option)}
              {picked ? (
                <CheckIcon aria-hidden="true" className="size-4" />
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
