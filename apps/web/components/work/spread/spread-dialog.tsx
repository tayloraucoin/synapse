"use client";

import * as React from "react";
import {
  Button,
  Checkbox,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  HueSquare,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  Label,
  SegmentedControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Text,
} from "@syn/ui";
import { weekdayIndex, type WorkTier } from "@syn/utils";
import { lengthWords, shortDate } from "@/lib/data/spread";
import { useSpread, type WhichBlock } from "@/lib/data/use-spread";
import { TIER_HUE } from "../view";
import { SPREAD_COPY as COPY } from "./copy";

/**
 * SpreadDialog (USE-77; interactions/spread, states/across-the-week/1728.md):
 * Spread… on a big pool row opens it over the Week. Work left, Which block,
 * Days, Each session and Tier above a rule; What this makes, one row per
 * session with what it shares and the time it gets; the sum line; Carry on
 * next week; Cancel and Add <n> sessions. Every change re-counts the preview
 * (`spreadPreview`), announced politely. Focus lands on Work left and is
 * trapped; × is "Close"; Esc, Cancel or the scrim close with nothing placed;
 * focus returns to the Spread… that opened it. Lengths only, never red.
 */

export interface SpreadCard {
  emoji: string | null;
  title: string;
  /** "Personal · 🧠 Synapse · SYN-218 · 8 Huge". */
  meta: string;
}

export interface SpreadDialogProps {
  /** The item spread; null keeps the dialog closed. */
  workItemId: string | null;
  card: SpreadCard | null;
  onClose: () => void;
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
const TIERS: readonly WorkTier[] = [
  "urgent",
  "primary",
  "secondary",
  "stretch",
];
const TIER_WORD: Record<WorkTier, string> = {
  urgent: "Urgent",
  primary: "Primary",
  secondary: "Secondary",
  stretch: "Stretch",
};
const HALF_HOUR = 30;
const WORK_LEFT_MAX = 200 * 60;
const SESSION_STEP = 15;

/** "09:30" → "9:30". */
const clock = (time: string) => time.replace(/^0(\d)/, "$1");

/** "2 h 30" read aloud: "2 hours 30". */
const spoken = (words: string) =>
  words.replace(/^1 h\b/, "1 hour").replace(/(\d+) h\b/, "$1 hours");

/** "20", "20 h", "7 h 30", "7.5", "7:30" or "450 min" → minutes; null when unreadable. */
function readHours(text: string): number | null {
  const t = text.trim().toLowerCase();
  const min = /^(\d+)\s*min$/.exec(t);
  if (min) return Number(min[1]);
  const hm = /^(\d+)\s*(?:h|:)\s*(\d{1,2})?$/.exec(t);
  if (hm) return Number(hm[1]) * 60 + Number(hm[2] ?? 0);
  const h = Number(t.replace(",", "."));
  return Number.isFinite(h) && t !== "" ? Math.round(h * 60) : null;
}

export function SpreadDialog({ workItemId, card, onClose }: SpreadDialogProps) {
  const spread = useSpread(workItemId);
  const workLeftRef = React.useRef<HTMLInputElement>(null);
  const opener = React.useRef<HTMLElement | null>(null);
  const open = workItemId !== null;

  // Focus goes back to the Spread… that opened the dialog.
  React.useLayoutEffect(() => {
    if (open && document.activeElement instanceof HTMLElement) {
      opener.current = document.activeElement;
    }
  }, [open]);

  const { preview, which } = spread;
  const n = preview.rows.length;
  const blockOf = (dateKey: string, blockId: string) =>
    spread.chips
      .find((chip) => chip.dateKey === dateKey)
      ?.blocks.find((b) => b.id === blockId);

  const sum = COPY.sum(
    n,
    lengthWords(preview.totalMin),
    preview.leftMin > 0 ? lengthWords(preview.leftMin) : null,
    which,
  );

  async function add() {
    if (await spread.add()) onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? null : onClose())}>
      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          workLeftRef.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          if (opener.current?.isConnected) {
            event.preventDefault();
            opener.current.focus();
          }
        }}
        className="wide:max-w-(--spread-w) max-h-[calc(100dvh-var(--space-8))] max-w-(--spread-w) gap-(--space-4) overflow-y-auto rounded-(--radius-sheet) bg-background motion-reduce:animate-none"
      >
        <div className="flex items-start justify-between gap-(--space-4)">
          <DialogTitle className="font-serif text-(length:--fs-review-title) leading-(--lh-review-title) font-normal text-ink">
            {COPY.title}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            aria-label={COPY.close}
            onClick={onClose}
            className="-me-(--space-3) -mt-(--space-2) text-muted-foreground"
          >
            ×
          </Button>
        </div>

        {card ? (
          <div className="flex items-start gap-(--space-3) rounded-(--radius-control) bg-surface px-(--space-4) py-(--space-3)">
            <span
              aria-hidden="true"
              className="font-emoji text-(length:--fs-heading) inline-flex shrink-0 leading-none"
            >
              {card.emoji}
            </span>
            <div className="flex min-w-0 flex-col">
              <Text
                as="span"
                className="text-(length:--fs-body) text-foreground"
              >
                {card.title}
              </Text>
              <DialogDescription className="text-(length:--fs-caption) text-muted-foreground">
                {card.meta}
              </DialogDescription>
            </div>
          </div>
        ) : (
          <DialogDescription className="sr-only">
            {COPY.title}
          </DialogDescription>
        )}

        <WorkLeft
          inputRef={workLeftRef}
          value={spread.workLeftMin}
          onChange={spread.setWorkLeftMin}
        />

        <SegmentedControl<WhichBlock>
          label={
            <span className="text-(length:--fs-label) font-semibold text-foreground">
              {COPY.whichBlock}
            </span>
          }
          stacked={false}
          value={which}
          onChange={spread.chooseBlock}
          options={(["morning", "afternoon", "pick"] as const).map((value) => ({
            value,
            label: COPY.blocks[value],
          }))}
          classes={{
            group: "bg-fill-muted gap-0 border-0 p-(--space-1)",
            item: cn(
              "bg-transparent text-muted-foreground min-w-0 rounded-(--radius-control) font-normal",
              "has-checked:bg-background has-checked:text-foreground has-checked:font-semibold",
            ),
          }}
        />

        {which === "pick" ? <PickBlocks spread={spread} /> : null}

        <Days spread={spread} />

        <EachSessionField value={spread.eachMin} onChange={spread.setEachMin} />

        <div className="flex items-center justify-between gap-(--space-4)">
          <Label
            htmlFor="spread-tier"
            className="text-(length:--fs-label) font-semibold text-foreground"
          >
            {COPY.tier}
          </Label>
          <Select
            value={spread.tier}
            onValueChange={(value) => spread.setTier(value as WorkTier)}
          >
            <SelectTrigger
              id="spread-tier"
              size="sm"
              className="w-auto border-0 bg-transparent px-(--space-2) shadow-none"
            >
              <TierWord tier={spread.tier} />
            </SelectTrigger>
            <SelectContent align="end">
              {TIERS.map((tier) => (
                <SelectItem key={tier} value={tier}>
                  <TierWord tier={tier} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-(--space-2) border-t border-hairline pt-(--space-4)">
          <Text
            as="h3"
            id="spread-makes"
            className="text-(length:--fs-label) font-semibold text-muted-foreground"
          >
            {COPY.whatThisMakes}
          </Text>
          {n === 0 ? (
            <Text as="p" className="text-(length:--fs-label) text-foreground">
              {COPY.nothing}
            </Text>
          ) : (
            <ul aria-labelledby="spread-makes" className="flex flex-col">
              {preview.rows.map((row) => {
                const block = blockOf(row.dateKey, row.blockId);
                const blockWords = block
                  ? COPY.blockWords(clock(block.start), clock(block.end))
                  : "";
                const line = [
                  blockWords,
                  ...row.sharesWith.map((what) => COPY.shares(what)),
                ].join(" · ");
                const length = lengthWords(row.getsMin);
                return (
                  <li
                    key={row.dateKey}
                    aria-label={COPY.rowName(
                      shortDate(row.dateKey),
                      line,
                      spoken(length),
                    )}
                    className="flex min-h-8 items-center gap-(--space-3) text-(length:--fs-label)"
                  >
                    <span className="w-14 shrink-0 font-semibold text-foreground">
                      {shortDate(row.dateKey)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-muted-foreground">
                      {line}
                    </span>
                    <span className="shrink-0 tabular-nums text-foreground">
                      {length}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          <Text
            as="p"
            aria-live="polite"
            className="pt-(--space-2) text-(length:--fs-label) text-ink"
          >
            {sum}
          </Text>
          <Label className="flex items-center gap-(--space-2) text-(length:--fs-label) font-normal text-foreground">
            <Checkbox
              checked={spread.carryOn}
              onCheckedChange={(on) => spread.setCarryOn(on === true)}
            />
            {COPY.carryOn}
          </Label>
        </div>

        <div className="flex justify-end gap-(--space-2) pt-(--space-2)">
          <Button variant="secondary" onClick={onClose}>
            {COPY.cancel}
          </Button>
          <Button
            disabled={n === 0 || !spread.ready}
            busy={spread.isPending}
            onClick={() => void add()}
          >
            {COPY.add(n)}
          </Button>
        </div>
        <span className="sr-only" aria-live="polite">
          {spread.announcement}
        </span>
      </DialogContent>
    </Dialog>
  );
}

function TierWord({ tier }: { tier: WorkTier }) {
  return (
    <span className="flex items-center gap-(--space-2) text-(length:--fs-label) text-foreground">
      <HueSquare hue={TIER_HUE[tier]} />
      {TIER_WORD[tier]}
    </span>
  );
}

function WorkLeft({
  inputRef,
  value,
  onChange,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: number;
  onChange: (min: number) => void;
}) {
  const [draft, setDraft] = React.useState<string | null>(null);
  const clamp = (min: number) =>
    Math.min(WORK_LEFT_MAX, Math.max(HALF_HOUR, min));
  const commit = () => {
    if (draft === null) return;
    const read = readHours(draft);
    if (read !== null) onChange(clamp(read));
    setDraft(null);
  };
  const step = (by: number) => {
    // Half-hour steps from the half hour below or above.
    const snapped =
      by > 0
        ? Math.floor(value / HALF_HOUR) * HALF_HOUR + HALF_HOUR
        : Math.ceil(value / HALF_HOUR) * HALF_HOUR - HALF_HOUR;
    onChange(clamp(snapped));
  };
  return (
    <div className="flex items-center justify-between gap-(--space-4)">
      <div className="flex flex-col">
        <Label
          htmlFor="spread-work-left"
          className="text-(length:--fs-label) font-semibold text-foreground"
        >
          {COPY.workLeft}
        </Label>
        <Text
          as="span"
          id="spread-work-left-helper"
          className="text-(length:--fs-caption) text-muted-foreground"
        >
          {COPY.workLeftHelper}
        </Text>
      </div>
      <InputGroup className="h-10 w-30 shrink-0 border-hairline">
        <InputGroupInput
          ref={inputRef}
          id="spread-work-left"
          aria-describedby="spread-work-left-helper"
          inputMode="decimal"
          value={draft ?? lengthWords(value)}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            }
          }}
          className="text-(length:--fs-body)"
        />
        <InputGroupAddon align="inline-end" className="gap-0 p-0">
          <InputGroupButton
            aria-label={COPY.less}
            disabled={value <= HALF_HOUR}
            onClick={() => step(-1)}
            className="h-9 w-6 rounded-none text-muted-foreground"
          >
            −
          </InputGroupButton>
          <InputGroupButton
            aria-label={COPY.more}
            disabled={value >= WORK_LEFT_MAX}
            onClick={() => step(1)}
            className="h-9 w-6 rounded-none text-muted-foreground"
          >
            +
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

type Spread = ReturnType<typeof useSpread>;

function Days({ spread }: { spread: Spread }) {
  const reasonId = React.useId();
  return (
    <div className="flex items-center justify-between gap-(--space-4)">
      <Text
        as="span"
        id={`${reasonId}-label`}
        className="text-(length:--fs-label) font-semibold text-foreground"
      >
        {COPY.days}
      </Text>
      <div
        role="group"
        aria-labelledby={`${reasonId}-label`}
        className="flex gap-(--space-2)"
      >
        {spread.chips.map((chip) => {
          const weekday = WEEKDAY[weekdayIndex(chip.dateKey)]!;
          const date = Number(chip.dateKey.slice(8));
          const why = chip.reason
            ? COPY.reason(chip.reason, spread.which)
            : null;
          return (
            <React.Fragment key={chip.dateKey}>
              <button
                type="button"
                aria-pressed={chip.picked}
                aria-label={COPY.dayName(weekday, date, chip.picked)}
                aria-describedby={
                  why ? `${reasonId}-${chip.dateKey}` : undefined
                }
                disabled={!chip.offered}
                title={why ?? undefined}
                onClick={() => spread.toggleDay(chip.dateKey)}
                className={cn(
                  "inline-flex size-8.5 items-center justify-center rounded-full border text-(length:--fs-label) font-semibold outline-none",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  chip.picked
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-hairline bg-background text-foreground hover:bg-surface",
                  !chip.offered &&
                    "border-dashed bg-transparent font-normal text-muted-foreground hover:bg-transparent",
                )}
              >
                <span aria-hidden="true">{weekday[0]}</span>
              </button>
              {why ? (
                <span id={`${reasonId}-${chip.dateKey}`} className="sr-only">
                  {why}
                </span>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function PickBlocks({ spread }: { spread: Spread }) {
  const days = spread.chips.filter((chip) => chip.picked);
  return (
    <div className="flex flex-col gap-(--space-2)">
      {days.map((chip) => {
        const weekday = WEEKDAY[weekdayIndex(chip.dateKey)]!;
        const open = chip.blocks.filter((b) => !b.begun);
        const chosen = spread.blockPicks[chip.dateKey] ?? open[0]?.id;
        return (
          <div
            key={chip.dateKey}
            role="radiogroup"
            aria-label={COPY.pickFor(weekday)}
            className="flex items-center gap-(--space-2)"
          >
            <span className="w-14 shrink-0 text-(length:--fs-label) font-semibold text-foreground">
              {shortDate(chip.dateKey)}
            </span>
            <div className="flex flex-wrap gap-(--space-1)">
              {chip.blocks.map((block) => {
                const on = block.id === chosen;
                return (
                  <button
                    key={block.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    disabled={block.begun}
                    onClick={() => spread.setBlockPick(chip.dateKey, block.id)}
                    className={cn(
                      "h-8 rounded-(--radius-control) border px-(--space-2) text-(length:--fs-caption) outline-none",
                      "focus-visible:ring-2 focus-visible:ring-ring",
                      on
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-hairline bg-background text-foreground hover:bg-surface",
                      block.begun &&
                        "border-dashed bg-transparent text-muted-foreground",
                    )}
                  >
                    {clock(block.start)} to {clock(block.end)}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EachSessionField({
  value,
  onChange,
}: {
  value: number | "whole";
  onChange: (next: number | "whole") => void;
}) {
  return (
    <div className="flex min-h-8 items-center justify-between gap-(--space-4)">
      <Text
        as="span"
        className="text-(length:--fs-label) font-semibold text-foreground"
      >
        {COPY.eachSession}
      </Text>
      {value === "whole" ? (
        <div className="flex items-baseline gap-(--space-2)">
          <Text as="span" className="text-(length:--fs-label) text-foreground">
            {COPY.wholeBlock}
          </Text>
          <button
            type="button"
            onClick={() => onChange(60)}
            className="text-(length:--fs-caption) text-muted-foreground underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            {COPY.setLength}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-(--space-2)">
          <button
            type="button"
            onClick={() => onChange("whole")}
            className="text-(length:--fs-caption) text-muted-foreground underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            {COPY.wholeBlock}
          </button>
          <InputGroup
            role="group"
            aria-label={COPY.sessionLength}
            className="h-8 w-auto border-hairline"
          >
            <InputGroupAddon align="inline-start" className="p-0">
              <InputGroupButton
                aria-label={COPY.shorter}
                disabled={value <= SESSION_STEP}
                onClick={() =>
                  onChange(Math.max(SESSION_STEP, value - SESSION_STEP))
                }
                className="h-7 w-7 rounded-none"
              >
                −
              </InputGroupButton>
            </InputGroupAddon>
            <span
              aria-live="polite"
              className="min-w-14 px-(--space-1) text-center text-(length:--fs-label) tabular-nums text-foreground"
            >
              {lengthWords(value)}
            </span>
            <InputGroupAddon align="inline-end" className="p-0">
              <InputGroupButton
                aria-label={COPY.longer}
                onClick={() => onChange(value + SESSION_STEP)}
                className="h-7 w-7 rounded-none"
              >
                +
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      )}
    </div>
  );
}
