"use client";

import * as React from "react";

import {
  BudgetLine,
  Button,
  CheckboxField,
  HelperText,
  LargeTargetRow,
  QuickChipRow,
  ResponsiveSheet,
  SkeletonRow,
  StatusLine,
  Text,
} from "@syn/ui";

import { SheetHost } from "@/components/page-frame";
import { useOnline } from "@/lib/hooks/use-online";

import { ADJUST_COPY as COPY } from "./copy";
import { useAdjust, type AdjustEntry, type AdjustHow } from "./use-adjust";

/**
 * Adjust — UX v1.1 §6.6 (DYN-17): "one sheet for slept in, ran long,
 * something came up. Written from how a person actually decides: first what
 * happened, then what gives, then how, then approve."
 *
 * FOUR STEPS, EACH EXPANDING BENEATH THE LAST. A step renders once the one
 * before it is answered; changing an earlier answer re-runs the preview. The
 * proposal is read-only and the number is the feedback: when nothing soft is
 * left to cut the sentence says where work runs to, and *Set* is still
 * allowed (R7).
 *
 * WHAT IT NEVER DOES: detect, score (the tier is a chip; its words live in
 * Review), say *late*, shorten below a floor, move a pin or a fixture — the
 * last three are the service's, and the sheet only reports them.
 */
export interface AdjustSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  entry: AdjustEntry;
  /** DYN-16: the Schedule's morning-band drag, with the delta it dragged. */
  bandDragDeltaMin?: number;
  onApplied?: () => void;
}

export function AdjustSheet({ open, onOpenChange, date, entry, bandDragDeltaMin, onApplied }: AdjustSheetProps) {
  const online = useOnline();
  const adjust = useAdjust({ open, date, entry, bandDragDeltaMin, onApplied, onClose: () => onOpenChange(false) });
  const disabled = !online || adjust.setting;
  const { scope, preview } = adjust;

  const primaryLabel =
    preview === null
      ? COPY.set
      : preview.gone.length > 0
        ? COPY.setNotAssigned(preview.gone.length)
        : preview.slideMin > 0
          ? COPY.setWorkAt(preview.newAnchorClock)
          : COPY.set;

  const sentence =
    preview === null
      ? null
      : preview.slideMin > 0
        ? COPY.moves(preview.newAnchorClock)
        : preview.fits
          ? COPY.fits(preview.newAnchorClock)
          : COPY.nothingLeft(clockAfter(preview.newAnchorClock, preview.overMin));

  // "Stand-up 9:30 stays; the walk doesn't fit before it." — a pin or a
  // fixture is reported, never moved (§6.6).
  const keptSentence =
    preview !== null && preview.keptHard.length > 0 && preview.gone.length > 0
      ? COPY.keptHard(
          preview.proposal.find((row) => row.fixed)?.title ?? "",
          (preview.gone[0]?.title ?? "").toLowerCase(),
        )
      : null;

  return (
    <SheetHost open={open}>
      <ResponsiveSheet
        open={open}
        onOpenChange={onOpenChange}
        title={COPY.title}
        subtitle={scope === null ? undefined : COPY.scopeWord(scope.label)}
        size="tall"
        footer={
          <div className="flex justify-end gap-(--space-2)">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {COPY.cancel}
            </Button>
            <Button
              disabled={disabled || preview === null || adjust.previewing}
              busy={adjust.setting}
              onClick={() => void adjust.set()}
            >
              {primaryLabel}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-(--space-6)">
          {!online ? <StatusLine variant="offline" placement="inline" /> : null}

          {adjust.loading ? (
            <div className="flex flex-col gap-(--space-2)">
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : null}

          {/* 1 — What happened. One tap, usually none. */}
          {adjust.reasons.length > 0 ? (
            <section className="flex flex-col gap-(--space-2)">
              <Text as="h3" variant="caption" tone="secondary">
                {COPY.whatHappened}
              </Text>
              <QuickChipRow
                label={COPY.whatHappened}
                chips={adjust.reasons.map((reason) => ({ label: reason.label, value: reason.key }))}
                selected={adjust.reasonKey}
                onSelect={adjust.setReasonKey}
                disabled={disabled}
              />
            </section>
          ) : null}

          {/* 2 — What gives. Ordered by the anchor's direction. */}
          {scope !== null && adjust.reasonKey !== null ? (
            <section className="flex flex-col gap-(--space-2)">
              <Text as="h3" variant="caption" tone="secondary">
                {COPY.whatGives}
              </Text>
              <LargeTargetRow
                label={COPY.whatGives}
                layout="stacked"
                value={adjust.what}
                onChange={(value) => adjust.setWhat(value as "slide" | "hold")}
                disabled={disabled}
                options={[
                  ...(adjust.anchorIsHard
                    ? []
                    : [
                        {
                          value: "slide",
                          label: COPY.startWorkLater,
                          description: COPY.startWorkLaterBody(
                            bandDragDeltaMin === undefined
                              ? clockAfter(scope.anchorClock, 0)
                              : clockAfter(scope.anchorClock, bandDragDeltaMin),
                          ),
                        },
                      ]),
                  { value: "hold", label: COPY.keepWork(scope.anchorClock), description: COPY.keepWorkBody },
                ]}
              />
            </section>
          ) : null}

          {/* 3 — How. Skipped when the whole remainder slides. */}
          {adjust.what === "hold" ? (
            <section className="flex flex-col gap-(--space-3)">
              <Text as="h3" variant="caption" tone="secondary">
                {COPY.how}
              </Text>
              <LargeTargetRow
                label={COPY.how}
                layout="stacked"
                value={adjust.how}
                onChange={(value) => adjust.setHow(value as AdjustHow)}
                disabled={disabled}
                options={[
                  { value: "shorten", label: COPY.shorten, description: COPY.shortenBody },
                  { value: "cut", label: COPY.cut, description: COPY.cutBody },
                  { value: "choose", label: COPY.choose, description: COPY.chooseBody },
                ]}
              />
              {adjust.how === "choose" && preview !== null ? (
                <div className="flex flex-col gap-(--space-2)">
                  {/* The quick-pick's grammar again: every soft item, ticked or not. */}
                  <ul className="flex flex-col">
                    {preview.proposal.map((row) => (
                      <li key={row.id} className="flex min-h-11 items-center justify-between gap-(--space-3)">
                        <CheckboxField
                          checked={adjust.chosenIds.has(row.id)}
                          disabled={disabled || row.fixed}
                          onCheckedChange={(next) => adjust.toggleChosen(row.id, next === true)}
                        >
                          {row.title}
                        </CheckboxField>
                        <Text as="span" variant="caption" tone="secondary" className="tabular-nums">
                          {`${row.durationMin} min`}
                        </Text>
                      </li>
                    ))}
                    {preview.gone.map((row) => (
                      <li key={row.id} className="flex min-h-11 items-center justify-between gap-(--space-3)">
                        <CheckboxField
                          checked={adjust.chosenIds.has(row.id)}
                          disabled={disabled}
                          onCheckedChange={(next) => adjust.toggleChosen(row.id, next === true)}
                        >
                          {row.title}
                        </CheckboxField>
                      </li>
                    ))}
                  </ul>
                  <BudgetLine
                    chosenMin={preview.proposal
                      .filter((row) => adjust.chosenIds.has(row.id))
                      .reduce((sum, row) => sum + row.durationMin, 0)}
                    availableMin={Math.max(0, scope === null ? 0 : scope.toMin - scope.fromMin)}
                    sticky
                  />
                </div>
              ) : null}
            </section>
          ) : null}

          {/* 4 — The proposal. Read-only; the number is the feedback. */}
          {adjust.ready ? (
            <section className="flex flex-col gap-(--space-3)" aria-live="polite">
              <Text as="h3" variant="caption" tone="secondary">
                {COPY.proposal}
              </Text>
              {preview === null || adjust.previewing ? (
                <div className="flex flex-col gap-(--space-2)">
                  <SkeletonRow />
                  <SkeletonRow />
                </div>
              ) : (
                <>
                  <Text as="p">{sentence}</Text>
                  {keptSentence === null ? null : (
                    <Text as="p" variant="secondary" tone="secondary">
                      {keptSentence}
                    </Text>
                  )}
                  <ul className="flex flex-col">
                    {preview.proposal.map((row) => (
                      <li key={row.id} className="flex min-h-11 items-center justify-between gap-(--space-3)">
                        <Text as="span" className="tabular-nums">
                          {COPY.row(row.title, row.durationMin, row.startClock)}
                        </Text>
                        {row.shortened ? (
                          <Text as="span" variant="caption" tone="secondary">
                            {COPY.shortened}
                          </Text>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                  {preview.gone.length === 0 ? null : (
                    <div className="flex flex-col gap-(--space-1)">
                      <Text as="h4" variant="caption" tone="secondary">
                        {COPY.notAssignedToday}
                      </Text>
                      <ul className="flex flex-col">
                        {preview.gone.map((row) => (
                          <li key={row.id} className="flex min-h-11 items-center justify-between gap-(--space-3)">
                            <Text as="span" tone="secondary">
                              {row.title}
                            </Text>
                            {/* Swapping trims the next-lowest (v1 §6.8). */}
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={disabled || adjust.keepInstead.has(row.id)}
                              onClick={() => adjust.keep(row.id)}
                            >
                              {COPY.keepInstead}
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </section>
          ) : null}

          {adjust.error === null ? null : <HelperText error>{adjust.error}</HelperText>}
        </div>
      </ResponsiveSheet>
    </SheetHost>
  );
}

/** "9:20" — a clock plus minutes, for the sentences. */
function clockAfter(clock: string, minutes: number): string {
  const match = /^\s*(\d{1,2}):(\d{2})\s*([AaPp][Mm])?\s*$/.exec(clock);
  if (!match) return clock;
  let hour = Number(match[1]);
  const meridiem = match[3]?.toLowerCase();
  if (meridiem === "pm" && hour < 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;
  const total = (hour * 60 + Number(match[2]) + minutes + 1440) % 1440;
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
