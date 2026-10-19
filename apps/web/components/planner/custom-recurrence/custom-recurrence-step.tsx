"use client";

/**
 * CustomRecurrenceStep (USE-47; new-block-sheet/states/custom-recurrence.md):
 * Repeats › Custom… as a step inside the sheet that opens it, back on the
 * left, never a second sheet. The New block sheet mounts it; the To-do
 * sheet's Repeats reaches the same step (D-USE-37), with no times and no
 * usual week.
 *
 * Top to bottom: back and "<name> · New block" over "Custom recurrence";
 * Repeat every (a number and day, week, month or year); Repeat on (seven
 * round toggles with week; with month, on day 18 or on the third Sunday
 * [ASSUMPTION: a two-way choice, drawn as a hint]; nothing with day or
 * year); Ends (Never, On a date, After n times; a faded field wakes when
 * its row is picked or the field is touched); the summary; Done.
 *
 * The step holds its own draft: Done hands back the choices, which the
 * sheet stores as one rule (`buildRule`, D-USE-80); back hands back nothing.
 */
import * as React from "react";
import {
  BackIcon,
  Button,
  cn,
  Input,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
} from "@syn/ui";
import { addDays, type RuleForm, type RuleUnit } from "@syn/utils";
import {
  CUSTOM_RECURRENCE_COPY as COPY,
  customSummary,
  shortLongDate,
} from "./copy";

export interface CustomRecurrenceStepProps {
  /** The caption over the title: "Sunday reset · New block". */
  caption: string;
  /** Where back returns, as its name reads: "Back to Sunday reset". */
  backTo: string;
  /** The rule's start date, `YYYY-MM-DD`: the hint and the summary read from it. */
  startKey: string;
  /** What the step opens on. */
  value: RuleForm;
  /** A block's times, for the summary; a to-do has none. */
  times?: { startsAt: string; endsAt: string };
  /** A block's summary also says how it shows in the usual week. */
  usualWeek: boolean;
  onDone: (form: RuleForm) => void;
  onBack: () => void;
}

const UNITS: RuleUnit[] = ["day", "week", "month", "year"];
const MAX_EVERY = 99;
const MAX_TIMES = 999;
/** The faded After field's count, as Google offers it. */
const DEFAULT_TIMES = 13;
/** [ASSUMPTION] The faded On field reads three months on, as the frame's 18 Jan 2027 from 18 Oct. */
function defaultUntil(startKey: string): string {
  const [y, m, d] = startKey.split("-").map(Number) as [number, number, number];
  const month = m + 3;
  const year = y + Math.floor((month - 1) / 12);
  const next = ((month - 1) % 12) + 1;
  const last = new Date(Date.UTC(year, next, 0)).getUTCDate();
  return `${year}-${String(next).padStart(2, "0")}-${String(Math.min(d, last)).padStart(2, "0")}`;
}

function wholeNumber(text: string, max: number): number | null {
  const value = Number.parseInt(text, 10);
  if (!Number.isFinite(value) || value < 1) return null;
  return Math.min(value, max);
}

const LABEL = "text-(length:--fs-secondary) font-medium text-foreground";

export function CustomRecurrenceStep({
  caption,
  backTo,
  startKey,
  value,
  times,
  usualWeek,
  onDone,
  onBack,
}: CustomRecurrenceStepProps) {
  const [form, setForm] = React.useState<RuleForm>(value);
  // The number as typed; an empty field reads back to the last whole number.
  const [everyText, setEveryText] = React.useState(String(value.every));
  const [until, setUntil] = React.useState(
    value.ends.kind === "on" ? value.ends.date : defaultUntil(startKey),
  );
  const [count, setCount] = React.useState(
    value.ends.kind === "after" ? value.ends.count : DEFAULT_TIMES,
  );
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const ids = {
    every: React.useId(),
    unitHint: React.useId(),
    repeatOn: React.useId(),
    ends: React.useId(),
    monthBy: React.useId(),
    summary: React.useId(),
  };

  React.useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const set = (change: Partial<RuleForm>) =>
    setForm((current) => ({ ...current, ...change }));

  const pickEnds = (kind: RuleForm["ends"]["kind"]) =>
    set({
      ends:
        kind === "on"
          ? { kind, date: until }
          : kind === "after"
            ? { kind, count }
            : { kind },
    });

  const toggleDay = (day: number) => {
    const on = form.weekdays.includes(day);
    // One day stays: a weekly rule with none is no rule.
    if (on && form.weekdays.length === 1) return;
    set({
      weekdays: on
        ? form.weekdays.filter((d) => d !== day)
        : [...form.weekdays, day].sort((a, b) => a - b),
    });
  };

  const pickUnit = (unit: RuleUnit) =>
    set({
      unit,
      monthBy: unit === "month" ? (form.monthBy ?? "day") : null,
    });

  const summary = customSummary(form, startKey, {
    ...(times ? { times } : {}),
    usualWeek,
  });

  return (
    <div className="flex flex-col gap-(--space-5) pb-(--space-2)">
      <div className="flex items-start gap-(--space-2)">
        <Button
          variant="ghost"
          size="icon"
          aria-label={COPY.back(backTo)}
          onClick={onBack}
          className="-ms-(--space-3)"
        >
          <BackIcon aria-hidden="true" />
        </Button>
        <div className="flex min-w-0 flex-col pt-(--space-1)">
          <Text as="p" variant="caption" tone="secondary">
            {caption}
          </Text>
          <Text
            as="h2"
            variant="heading"
            ref={headingRef}
            tabIndex={-1}
            className="outline-none"
          >
            {COPY.title}
          </Text>
        </div>
      </div>

      <section className="flex flex-col gap-(--space-2)">
        <label htmlFor={ids.every} className={LABEL}>
          {COPY.repeatEvery}
        </label>
        <div className="flex gap-(--space-2)">
          <Input
            id={ids.every}
            mode="number"
            inputMode="numeric"
            min={1}
            max={MAX_EVERY}
            value={everyText}
            aria-describedby={ids.unitHint}
            onChange={(event) => {
              setEveryText(event.target.value);
              const every = wholeNumber(event.target.value, MAX_EVERY);
              if (every !== null) set({ every });
            }}
            onBlur={() => setEveryText(String(form.every))}
            classes={{
              root: "w-16 shrink-0",
              input: "text-center tabular-nums",
            }}
          />
          <Select
            value={form.unit}
            onValueChange={(next) => pickUnit(next as RuleUnit)}
          >
            <SelectTrigger
              aria-label={COPY.repeatEvery}
              aria-describedby={ids.unitHint}
              className="min-h-(--target) flex-1"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" side="bottom" align="start">
              {UNITS.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {COPY.unit(unit, form.every)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Text as="p" id={ids.unitHint} variant="caption" tone="secondary">
          {COPY.unitHint}
        </Text>
      </section>

      {form.unit === "week" ? (
        <section className="flex flex-col gap-(--space-2)">
          <Text as="span" id={ids.repeatOn} className={LABEL}>
            {COPY.repeatOn}
          </Text>
          <div
            role="group"
            aria-labelledby={ids.repeatOn}
            className="flex justify-between gap-(--space-1)"
          >
            {COPY.weekdayLetters.map((letter, day) => {
              const on = form.weekdays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  aria-pressed={on}
                  aria-label={COPY.weekdays[day]}
                  onClick={() => toggleDay(day)}
                  className={cn(
                    "inline-flex size-(--target) shrink-0 items-center justify-center rounded-full border text-(length:--fs-secondary)",
                    "focus-visible:ring-ring outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                    on
                      ? "bg-primary text-primary-foreground border-transparent font-semibold"
                      : "border-hairline text-foreground",
                  )}
                >
                  {letter}
                </button>
              );
            })}
          </div>
          <Text as="p" variant="caption" tone="secondary">
            {COPY.monthHint(startKey)}
          </Text>
        </section>
      ) : null}

      {form.unit === "month" ? (
        <section className="flex flex-col gap-(--space-2)">
          <Text as="span" id={ids.monthBy} className={LABEL}>
            {COPY.repeatOn}
          </Text>
          <RadioGroup
            aria-labelledby={ids.monthBy}
            value={form.monthBy ?? "day"}
            onValueChange={(next) => set({ monthBy: next as "day" | "nth" })}
            className="gap-0"
          >
            {(
              [
                ["day", COPY.onDay(startKey)],
                ["nth", COPY.onNth(startKey)],
              ] as const
            ).map(([by, label]) => (
              <RadioRow key={by} value={by} label={label} />
            ))}
          </RadioGroup>
        </section>
      ) : null}

      <section className="flex flex-col gap-(--space-1)">
        <Text as="span" id={ids.ends} className={LABEL}>
          {COPY.ends}
        </Text>
        <RadioGroup
          aria-labelledby={ids.ends}
          value={form.ends.kind}
          onValueChange={(next) => pickEnds(next as RuleForm["ends"]["kind"])}
          className="gap-0"
        >
          <RadioRow value="never" label={COPY.never} />
          <RadioRow value="on" label={COPY.on}>
            <span
              className={cn(
                "relative flex h-(--target) w-28 items-center justify-center rounded-(--radius-control) border border-input text-(length:--fs-secondary) tabular-nums",
                "focus-within:border-foreground focus-within:ring-1 focus-within:ring-foreground",
                form.ends.kind === "on"
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              <span aria-hidden="true">{shortLongDate(until)}</span>
              <input
                type="date"
                aria-label={COPY.onDate}
                value={until}
                min={addDays(startKey, 1)}
                onFocus={() => pickEnds("on")}
                onChange={(event) => {
                  if (event.target.value === "") return;
                  setUntil(event.target.value);
                  set({ ends: { kind: "on", date: event.target.value } });
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
          </RadioRow>
          <RadioRow value="after" label={COPY.after}>
            <span
              className={cn(
                "flex h-(--target) w-28 items-center justify-center gap-(--space-1) rounded-(--radius-control) border border-input px-(--space-2) text-(length:--fs-secondary)",
                "focus-within:border-foreground focus-within:ring-1 focus-within:ring-foreground",
                form.ends.kind === "after"
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              <input
                type="number"
                inputMode="numeric"
                aria-label={COPY.timesName}
                min={1}
                max={MAX_TIMES}
                value={count}
                onFocus={() => pickEnds("after")}
                onChange={(event) => {
                  const next = wholeNumber(event.target.value, MAX_TIMES);
                  if (next === null) return;
                  setCount(next);
                  set({ ends: { kind: "after", count: next } });
                }}
                className="w-10 bg-transparent text-end tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span aria-hidden="true">{count === 1 ? "time" : "times"}</span>
            </span>
          </RadioRow>
        </RadioGroup>
      </section>

      <Text
        as="p"
        id={ids.summary}
        role="status"
        aria-live="polite"
        variant="secondary"
        tone="secondary"
      >
        {summary}
      </Text>

      <Button
        className="h-12 w-full"
        aria-describedby={ids.summary}
        onClick={() => onDone(form)}
      >
        {COPY.done}
      </Button>
    </div>
  );
}

/** A radio row 44 px tall: the round radio, its label, and a field at the trailing edge. */
function RadioRow({
  value,
  label,
  children,
}: {
  value: string;
  label: string;
  children?: React.ReactNode;
}) {
  const id = React.useId();
  return (
    <div className="flex min-h-(--target) items-center gap-(--space-3)">
      <RadioGroupItem
        id={id}
        value={value}
        className="size-5 rounded-full border-foreground [&_[data-slot=radio-group-indicator]_span]:size-2.5 [&_[data-slot=radio-group-indicator]_span]:rounded-full"
      />
      <label htmlFor={id} className="flex-1 cursor-pointer">
        <Text as="span" variant="body">
          {label}
        </Text>
      </label>
      {children}
    </div>
  );
}
