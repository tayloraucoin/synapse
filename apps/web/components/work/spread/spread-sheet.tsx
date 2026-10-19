"use client";

import * as React from "react";
import {
  BackIcon,
  Button,
  CloseIcon,
  cn,
  DisclosureIcon,
  ResponsiveSheet,
  SegmentedControl,
  Text,
} from "@syn/ui";
import { weekdayIndex, type WorkTier } from "@syn/utils";
import {
  carryDateOf,
  daysWords,
  lengthWords,
  sessionTimesOf,
  shortDate,
} from "@/lib/data/spread";
import {
  PHONE_SESSION_MIN,
  useSpread,
  type WhichBlock,
} from "@/lib/data/use-spread";
import { SIZE_WORDS } from "@/lib/data/week-view";
import { SPREAD_PHONE_COPY as COPY } from "./copy";
import { DaysAndTierStep } from "./days-and-tier-step";

/**
 * SpreadSheet (USE-78; interactions/spread, states/across-the-week/402.md):
 * Spread across the week below 1024, a full sheet in place of the desk's
 * dialog (D-USE-54, C-USE-spread-4). × on the left; "Pool · <client> · <ID> ·
 * <size>"; the title; Hours left and Session length by half hours; Which Work
 * block; the Days and tier row, which opens `DaysAndTierStep` inside this
 * sheet with back on the left (D-USE-57); The sessions, each with its times
 * and where that day's Work ends; the carry line; Spread it.
 *
 * It shares `useSpread` with the dialog, so its rows are `spreadPreview`'s
 * and nothing is counted here (the times are read from the same days). The
 * picks live in the hook, so leaving Days and tier keeps them. From 768 to
 * 1023 the same sheet is ResponsiveSheet's side panel (D-USE-103). The page
 * swaps in place, with no slide at any motion setting [ASSUMPTION]. Always
 * carries on (D-USE-106): the phone draws no checkbox.
 */

export interface SpreadSheetProps {
  /** The item spread; null keeps the sheet closed. */
  workItemId: string | null;
  onClose: () => void;
  /** Spread it placed the sessions. */
  onSpread?: () => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
  /** A capture's start: the Days and tier page open. */
  initialStep?: "main" | "days";
}

const WEEKDAY = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const TIER_WORD: Record<WorkTier, string> = {
  urgent: "Urgent",
  primary: "Primary",
  secondary: "Secondary",
  stretch: "Stretch",
};
const HALF_HOUR = 30;
const HOURS_MAX = 200 * 60;

/** "2 h 30" read aloud: "2 hours 30". */
const spoken = (words: string) =>
  words.replace(/^1 h\b/, "1 hour").replace(/(\d+) h\b/, "$1 hours");

/** "Tue 13" read aloud: "Tuesday 13". */
const longDate = (dateKey: string) =>
  `${WEEKDAY[weekdayIndex(dateKey)]} ${Number(dateKey.slice(8))}`;

export function SpreadSheet({
  workItemId,
  onClose,
  onSpread,
  returnFocusRef,
  initialStep = "main",
}: SpreadSheetProps) {
  const spread = useSpread(workItemId, { eachMin: PHONE_SESSION_MIN });
  const open = workItemId !== null;
  const [step, setStep] = React.useState<"main" | "days">(initialStep);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const daysRowRef = React.useRef<HTMLButtonElement>(null);
  const backTo = React.useRef(false);

  // Each opening starts on the sheet's first page.
  React.useEffect(() => {
    if (!open) setStep(initialStep);
  }, [open, initialStep]);

  // Each page focuses its heading; back from Days and tier, its row.
  React.useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      if (step === "main" && backTo.current) {
        backTo.current = false;
        daysRowRef.current?.focus();
      } else headingRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open, step]);

  const { item, preview, which } = spread;
  const n = preview.rows.length;
  const picked = spread.chips.filter((chip) => chip.picked);
  const tierWord = TIER_WORD[spread.tier];
  const meta = item
    ? [
        COPY.from,
        spread.client?.name ?? null,
        item.linearIdentifier,
        item.size ? SIZE_WORDS[item.size] : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;
  const carryDate = carryDateOf(spread.days);
  const carry =
    preview.leftMin === 0
      ? COPY.nothingCarries
      : carryDate
        ? COPY.carry(lengthWords(preview.leftMin), shortDate(carryDate))
        : null;

  async function spreadIt() {
    if (!(await spread.add())) return;
    onSpread?.();
    onClose();
  }

  const leaveDays = () => {
    backTo.current = true;
    setStep("main");
  };

  const header =
    step === "days" ? (
      <div className="flex min-w-0 flex-1 flex-col items-start">
        <Button
          variant="ghost"
          onClick={leaveDays}
          aria-label={COPY.backName}
          className="-ms-(--space-3) h-(--target) gap-(--space-1) px-(--space-3) font-normal"
        >
          <BackIcon aria-hidden="true" className="size-4 shrink-0" />
          {COPY.back}
        </Button>
        <Text
          ref={headingRef}
          as="h2"
          variant="heading"
          tabIndex={-1}
          className="outline-none"
        >
          {COPY.daysAndTier}
        </Text>
      </div>
    ) : (
      <div className="flex min-w-0 flex-1 flex-col items-start">
        <Button
          variant="ghost"
          size="icon"
          aria-label={COPY.close}
          onClick={onClose}
          className="-ms-(--space-3) text-foreground"
        >
          <CloseIcon aria-hidden="true" className="size-5" />
        </Button>
        {meta ? (
          <Text as="p" variant="caption" tone="muted">
            {meta}
          </Text>
        ) : null}
        <Text
          ref={headingRef}
          as="h2"
          variant="heading"
          tabIndex={-1}
          className="outline-none"
        >
          {COPY.title}
        </Text>
      </div>
    );

  const footer =
    step === "days" ? (
      <Button size="lg" className="w-full" onClick={leaveDays}>
        {COPY.done}
      </Button>
    ) : (
      <Button
        size="lg"
        className="w-full"
        disabled={n === 0 || !spread.ready}
        busy={spread.isPending}
        onClick={() => void spreadIt()}
      >
        {COPY.spreadIt}
      </Button>
    );

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={(next) => {
        if (next) return;
        // Out of Days and tier goes back to the sheet; out of the sheet, closed.
        if (step === "days" && initialStep !== "days") leaveDays();
        else onClose();
      }}
      title={step === "days" ? COPY.daysAndTier : COPY.title}
      header={header}
      headerAction={null}
      footer={footer}
      returnFocusRef={returnFocusRef}
      size="tall"
      classes={{
        content: cn(
          "bg-background",
          step === "days"
            ? "data-[vaul-drawer-direction=bottom]:h-[77dvh]"
            : "data-[vaul-drawer-direction=bottom]:h-[89dvh]",
        ),
        header: "min-h-0 px-5 pt-(--space-1)",
        body: "flex flex-col px-5 pt-(--space-2) pb-(--space-2)",
        footer: "border-t-0 px-5 pt-(--space-2)",
      }}
    >
      {step === "days" ? (
        <DaysAndTierStep spread={spread} />
      ) : (
        <>
          <div className="flex flex-col">
            <StepperRow
              label={COPY.hoursLeft}
              value={spread.workLeftMin}
              min={HALF_HOUR}
              max={HOURS_MAX}
              onChange={spread.setWorkLeftMin}
            />
            <StepperRow
              label={COPY.sessionLength}
              value={
                spread.eachMin === "whole" ? PHONE_SESSION_MIN : spread.eachMin
              }
              min={HALF_HOUR}
              max={12 * 60}
              onChange={spread.setEachMin}
            />
          </div>

          <SegmentedControl<WhichBlock>
            label={COPY.whichBlock}
            stacked={false}
            value={which}
            onChange={spread.chooseBlock}
            options={(["morning", "afternoon", "pick"] as const).map(
              (value) => ({ value, label: COPY.blocks[value] }),
            )}
            className="pt-(--space-4)"
            classes={{
              label: "text-(length:--fs-label) font-semibold text-foreground",
              group: "bg-fill-muted gap-0 border-0 p-(--space-1)",
              item: cn(
                "bg-transparent text-muted-foreground h-10 min-w-0 rounded-(--radius-control) font-normal",
                "has-checked:bg-background has-checked:text-foreground has-checked:font-semibold",
              ),
            }}
          />

          <button
            ref={daysRowRef}
            type="button"
            onClick={() => setStep("days")}
            className={cn(
              "mt-(--space-4) flex min-h-13 items-center gap-(--space-3) border-y border-hairline text-start outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <span className="text-(length:--fs-body) text-foreground">
              {COPY.daysAndTier}
            </span>
            <span className="ms-auto truncate text-(length:--fs-body) text-muted-foreground">
              {COPY.daysAndTierValue(
                picked.length === 0
                  ? null
                  : daysWords(picked.map((chip) => chip.dateKey)),
                tierWord,
              )}
            </span>
            <DisclosureIcon
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground"
            />
          </button>

          <div className="flex flex-col pt-(--space-4)">
            <Text
              as="h3"
              id="spread-sessions"
              className="text-(length:--fs-label) font-semibold text-foreground"
            >
              {COPY.sessions}
            </Text>
            {n === 0 ? (
              <Text
                as="p"
                className="pt-(--space-2) text-(length:--fs-label) text-foreground"
              >
                {COPY.nothing}
              </Text>
            ) : (
              <ul aria-labelledby="spread-sessions" className="flex flex-col">
                {preview.rows.map((row) => {
                  const times = sessionTimesOf(row, spread.days);
                  if (!times) return null;
                  return (
                    <li
                      key={row.dateKey}
                      aria-label={COPY.rowName(
                        longDate(row.dateKey),
                        times.start,
                        times.end,
                        times.workEnds,
                      )}
                      className="flex min-h-9 items-center gap-(--space-2) text-(length:--fs-body)"
                    >
                      <span className="w-13 shrink-0 font-semibold text-foreground">
                        {shortDate(row.dateKey)}
                      </span>
                      <span className="tabular-nums text-foreground">
                        {times.start} to {times.end}
                      </span>
                      <span className="ms-auto shrink-0 text-(length:--fs-caption) tabular-nums text-muted-foreground">
                        {COPY.workEnds(times.workEnds)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            {carry ? (
              <Text
                as="p"
                aria-live="polite"
                className="pt-(--space-2) text-(length:--fs-caption) text-muted-foreground"
              >
                {carry}
              </Text>
            ) : null}
          </div>
          <span className="sr-only" aria-live="polite">
            {spread.announcement}
          </span>
        </>
      )}
    </ResponsiveSheet>
  );
}

/** A row on a hairline: its word, and − value + (36 px, a 44 px hit). */
function StepperRow({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (min: number) => void;
}) {
  const id = React.useId();
  const clamp = (next: number) => Math.min(max, Math.max(min, next));
  // Half-hour steps from the half hour below or above.
  const step = (by: 1 | -1) =>
    onChange(
      clamp(
        by > 0
          ? Math.floor(value / HALF_HOUR) * HALF_HOUR + HALF_HOUR
          : Math.ceil(value / HALF_HOUR) * HALF_HOUR - HALF_HOUR,
      ),
    );
  const words = lengthWords(value);
  return (
    <div className="flex min-h-14 items-center gap-(--space-2) border-b border-hairline">
      <span id={id} className="text-(length:--fs-body) text-foreground">
        {label}
      </span>
      <div className="ms-auto flex items-center">
        <StepButton
          label={COPY.less(label)}
          disabled={value <= min}
          onClick={() => step(-1)}
        >
          −
        </StepButton>
        <span
          role="spinbutton"
          tabIndex={0}
          aria-labelledby={id}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={spoken(words)}
          onKeyDown={(event) => {
            if (event.key === "ArrowUp" || event.key === "ArrowRight") {
              event.preventDefault();
              step(1);
            } else if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
              event.preventDefault();
              step(-1);
            }
          }}
          className="min-w-14 rounded-(--radius-control) text-center text-(length:--fs-body) font-semibold tabular-nums text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {words}
        </span>
        <StepButton
          label={COPY.more(label)}
          disabled={value >= max}
          onClick={() => step(1)}
        >
          +
        </StepButton>
      </div>
    </div>
  );
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="group grid size-11 place-items-center outline-none disabled:opacity-50"
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-9 place-items-center rounded-(--radius-control) border border-hairline text-(length:--fs-body) text-foreground",
          "group-focus-visible:ring-2 group-focus-visible:ring-ring",
        )}
      >
        {children}
      </span>
    </button>
  );
}
