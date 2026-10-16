"use client";

import * as React from "react";
import {
  Button,
  CloseIcon,
  cn,
  HueSquare,
  ResponsiveSheet,
  SegmentedControl,
  Text,
  ToggleGroup,
  ToggleGroupItem,
} from "@syn/ui";
import type { WorkTier } from "@syn/utils";
import {
  PLACE_SHEET_WORDS as WORDS,
  type PlaceSheetView,
} from "@/lib/data/place-sheet";
import { usePlaceSheet, type PlaceSheetSource } from "@/lib/data/use-place";
import { TIER_WORDS } from "@/lib/data/week-view";
import { SpreadSheet } from "../spread";
import { TIER_HUE } from "../view";
import { DoesntFitCard } from "./doesnt-fit-card";

/**
 * PlaceSheet (USE-80; interactions/place-from-the-pool/phone.md and its
 * place-sheet, placed-undo and doesnt-fit states): Place on a pool sheet row,
 * below 1024 (D-USE-54, A picked and locked by D-USE-58; the phone has no
 * drag, D-USE-55). × on the left; "Pool · <client> · <ID> · <size> · due
 * <Day>"; "Place <title>"; the sessions line; Days, one or more, each a
 * toggle named by the full day; Tier, its square with its word; the fit per
 * day in muted words, past Work's end with its time and never red; "Place on
 * <Day> and <Day>". Nothing moves until that action (C-USE-this-week-2).
 *
 * One day picked that its Work cannot hold folds the days and the tier
 * ("Tier: Primary" opens it again) and shows DoesntFitCard in place of the
 * fit line, with "Place on <Day> anyway" (D-USE-108 (2)). Spread opens
 * USE-78's sheet for the item in this one's place; × there comes back here
 * [ASSUMPTION], Spread it closes both.
 *
 * Placing lands through usePlace's `placeAll`: one session per day of the one
 * item (D-USE-40), nothing to Linear, and a toast "Placed on Tue and Wed, in
 * Primary." whose Undo takes every day back. The sheet then closes and hands
 * the days to `onPlaced`, for the day beneath to show (USE-81). Focus returns
 * to the row's Place on ×.
 */

export interface PlaceSheetProps {
  /** The row placed; null keeps the sheet closed. */
  itemRef: PlaceSheetSource | null;
  /** The day it opens over: picked first, and due words count from it. */
  dateKey: string;
  onClose: () => void;
  /** Placed: the days it landed on, and the item (an issue's new one). */
  onPlaced?: (dateKeys: string[], workItemId: string) => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
  /** A capture's start: its picks and tier, or placed at once. */
  initial?: { picked?: string[]; tier?: WorkTier; place?: boolean };
}

const TIERS: readonly WorkTier[] = [
  "urgent",
  "primary",
  "secondary",
  "stretch",
];

const LABEL = "text-(length:--fs-label) font-semibold text-foreground";

export function PlaceSheet({
  itemRef,
  dateKey,
  onClose,
  onPlaced,
  returnFocusRef,
  initial,
}: PlaceSheetProps) {
  const sheet = usePlaceSheet(itemRef, dateKey, initial);
  const [spreading, setSpreading] = React.useState(false);
  const [tierOpen, setTierOpen] = React.useState(false);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const open = itemRef !== null;
  const { view } = sheet;

  React.useEffect(() => {
    if (!open) {
      setSpreading(false);
      setTierOpen(false);
    }
  }, [open]);

  async function place(only?: string) {
    const placed = await sheet.place(only);
    if (!placed) return;
    onPlaced?.(placed.dates, placed.workItemId);
    onClose();
  }

  // A capture of the placed state places once, on its own picks.
  const placedOnce = React.useRef(false);
  React.useEffect(() => {
    if (!initial?.place || !sheet.ready || placedOnce.current) return;
    placedOnce.current = true;
    void place();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, when ready
  }, [initial?.place, sheet.ready]);

  const card = view?.doesntFit ?? null;
  const folded = card !== null;

  const header = (
    <div className="flex min-w-0 flex-1 flex-col items-start">
      <Button
        variant="ghost"
        size="icon"
        aria-label={WORDS.close}
        onClick={onClose}
        className="-ms-(--space-3) text-foreground"
      >
        <CloseIcon aria-hidden="true" className="size-5" />
      </Button>
      {view ? (
        <Text as="p" variant="caption" tone="muted">
          {view.meta}
        </Text>
      ) : null}
      <Text
        ref={headingRef}
        as="h2"
        variant="heading"
        tabIndex={-1}
        className="outline-none"
      >
        {view?.title ?? WORDS.title(itemRef?.title ?? "")}
      </Text>
      {folded ? null : (
        <Text
          as="p"
          className="pt-(--space-1) text-(length:--fs-label) text-muted-foreground"
        >
          {WORDS.sessions}
        </Text>
      )}
    </div>
  );

  const footer =
    view && view.action ? (
      <Button
        size="lg"
        variant={folded ? "secondary" : "default"}
        className="w-full"
        busy={sheet.isPending}
        onClick={() => void place()}
      >
        {view.action}
      </Button>
    ) : null;

  return (
    <>
      <ResponsiveSheet
        open={open && !spreading}
        onOpenChange={(next) => {
          if (!next) onClose();
        }}
        title={view?.title ?? WORDS.title(itemRef?.title ?? "")}
        header={header}
        headerAction={null}
        footer={footer}
        returnFocusRef={returnFocusRef}
        initialFocus="title"
        classes={{
          content: "bg-background",
          header: "min-h-0 px-5 pt-(--space-1)",
          body: "flex flex-col px-5 pt-(--space-3) pb-(--space-2)",
          footer: "border-t-0 px-5 pt-(--space-2)",
        }}
      >
        {view ? (
          <div className="flex flex-col">
            <DayChips view={view} compact={folded} onToggle={sheet.toggleDay} />
            {folded && !tierOpen ? (
              <button
                type="button"
                aria-expanded={false}
                onClick={() => setTierOpen(true)}
                className={cn(
                  LABEL,
                  "mt-(--space-3) min-h-11 self-start rounded-(--radius-control) text-start outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                {WORDS.tierValue(view.tier)}
              </button>
            ) : (
              <TierControl view={view} onChange={sheet.setTier} />
            )}
            {card ? (
              <div className="pt-(--space-2)">
                <DoesntFitCard
                  card={card}
                  disabled={sheet.isPending}
                  onSpread={() => setSpreading(true)}
                  onUse={(day) => void place(day)}
                />
              </div>
            ) : view.fitLine ? (
              <Text
                as="p"
                aria-live="polite"
                className="pt-(--space-4) text-(length:--fs-label) text-muted-foreground"
              >
                {view.fitLine}
              </Text>
            ) : null}
          </div>
        ) : null}
        <span className="sr-only" aria-live="polite">
          {sheet.announcement}
        </span>
      </ResponsiveSheet>
      <SpreadSheet
        workItemId={open && spreading ? sheet.workItemId : null}
        onClose={() => setSpreading(false)}
        onSpread={onClose}
      />
    </>
  );
}

/**
 * The week's days: the letter over the date, 48 × 52, toggle buttons named by
 * the full day; a day not offered dashed, its reason in its name. Folded for
 * the doesn't-fit card: one line, "T 13", only the days with Work.
 */
function DayChips({
  view,
  compact,
  onToggle,
}: {
  view: PlaceSheetView;
  compact: boolean;
  onToggle: (dateKey: string) => void;
}) {
  const labelId = React.useId();
  const chips = compact ? view.chips.filter((c) => c.hasWork) : view.chips;
  return (
    <div className="flex flex-col gap-(--space-2)">
      {compact ? null : (
        <Text as="span" id={labelId} className={LABEL}>
          {WORDS.days}
        </Text>
      )}
      <ToggleGroup
        type="multiple"
        aria-labelledby={compact ? undefined : labelId}
        aria-label={compact ? WORDS.days : undefined}
        value={view.picked}
        onValueChange={(next) => {
          const changed =
            next.find((d) => !view.picked.includes(d)) ??
            view.picked.find((d) => !next.includes(d));
          if (changed !== undefined) onToggle(changed);
        }}
        className={cn(
          "w-full gap-(--space-2)",
          compact ? "flex flex-wrap justify-start" : "grid grid-cols-7",
        )}
      >
        {chips.map((chip) => (
          <ToggleGroupItem
            key={chip.dateKey}
            value={chip.dateKey}
            disabled={!chip.offered}
            aria-label={chip.name}
            className={cn(
              "flex min-w-0 items-center justify-center rounded-(--radius) border px-0",
              compact
                ? "h-11 w-12 gap-1 text-(length:--fs-label)"
                : "h-13 flex-col gap-0.5",
              chip.picked
                ? "border-primary bg-primary text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                : "border-hairline bg-background text-foreground",
              !chip.offered &&
                "border-dashed bg-transparent text-muted-foreground disabled:opacity-60",
            )}
          >
            {compact ? (
              <span aria-hidden="true">{chip.short}</span>
            ) : (
              <>
                <span
                  aria-hidden="true"
                  className="text-(length:--fs-caption) leading-none"
                >
                  {chip.letter}
                </span>
                <span
                  aria-hidden="true"
                  className="text-(length:--fs-body) leading-none font-semibold"
                >
                  {chip.date}
                </span>
              </>
            )}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

/** One tier for every day picked, a radio group; each square with its word. */
function TierControl({
  view,
  onChange,
}: {
  view: PlaceSheetView;
  onChange: (tier: WorkTier) => void;
}) {
  return (
    <SegmentedControl<WorkTier>
      label={WORDS.tier}
      stacked={false}
      value={view.tier}
      onChange={onChange}
      options={TIERS.map((tier) => ({
        value: tier,
        label: (
          <span className="flex items-center gap-1.5">
            <HueSquare hue={TIER_HUE[tier]} />
            {TIER_WORDS[tier]}
          </span>
        ),
      }))}
      className="pt-(--space-5)"
      classes={{
        label: LABEL,
        group: "bg-fill-muted gap-0 border-0 p-(--space-1)",
        item: cn(
          "bg-transparent text-muted-foreground h-10 min-w-0 rounded-(--radius-control) px-(--space-1) font-normal",
          "has-checked:bg-background has-checked:text-foreground has-checked:font-semibold",
        ),
      }}
    />
  );
}
