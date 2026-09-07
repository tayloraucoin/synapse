"use client";

import * as React from "react";

import {
  Button,
  HelperText,
  LargeTargetRow,
  NumberUnitInput,
  OverflowCutList,
  ResponsiveSheet,
  StatusLine,
  Text,
  OTHER_REASON_KEY,
  TierRadioRows,
  toastUndo,
  type OverflowItem,
} from "@syn/ui";
import {
  OTHER_REASON_MAX,
  SHIFT_MAX,
  SHIFT_MIN,
  UNDO_LONG_MS,
} from "@syn/constants";
import type { MissTier } from "@syn/types";
import { formatClock } from "@syn/utils";

import { SheetHost } from "@/components/page-frame";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc, type RouterOutputs } from "@/lib/trpc/client";

import { SHIFT_COPY as COPY } from "./copy";

type DayView = RouterOutputs["day"]["get"];

const TARGETS = [15, 30, 60] as const;
const CUSTOM = "custom";

/**
 * SF-01 — three questions in one growing sheet.
 *
 * THE STEPS REVEAL RATHER THAN PAGINATE. A shift is one decision with three
 * parts, and a wizard would make a person who mis-set the amount walk forward
 * to find that out. Everything answered stays on screen and stays editable;
 * changing the amount re-previews and step 3 re-renders under it.
 *
 * THE PRIMARY IS ABSENT UNTIL A REASON EXISTS, not disabled. A shift with no
 * reason is not a shift the product can record — cut items inherit that reason
 * and tier (§6.5), and the resolver scores by it — so there is nothing to grey
 * out at step 1. The button appears when the sentence it would write is
 * complete.
 *
 * *STAYED ON SOMETHING MORE IMPORTANT* IS NEVER OFFERED HERE (§12 call 7).
 * That reason means "I did something else instead", which is a claim about one
 * item; a shift is a claim about the whole day, and inheriting it onto four cut
 * items would attribute a trade nobody made.
 *
 * THE CUT LIST IS PRE-CHECKED LOWEST PRIORITY FIRST (§6.6) and every check is
 * the person's to remove. Nothing is cut that they did not leave checked.
 */
export function ShiftSheet({
  open,
  day,
  onOpenChange,
  onShifted,
}: {
  open: boolean;
  day: DayView;
  onOpenChange: (open: boolean) => void;
  onShifted?: () => void;
}) {
  const online = useOnline();
  const utils = trpc.useUtils();

  const [target, setTarget] = React.useState<string | null>(null);
  const [customMin, setCustomMin] = React.useState<number | null>(null);
  const [tier, setTier] = React.useState<MissTier | null>(null);
  const [reasonKey, setReasonKey] = React.useState<string | null>(null);
  const [otherText, setOtherText] = React.useState("");
  const [cut, setCut] = React.useState<ReadonlySet<string>>(new Set());
  const [touchedCut, setTouchedCut] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const reasons = trpc.reason.list.useQuery(undefined, { enabled: open });
  const apply = trpc.shift.commit.useMutation();
  const undo = trpc.shift.undo.useMutation();

  const deltaMin =
    target === CUSTOM ? customMin : target === null ? null : Number(target);

  const validDelta =
    deltaMin !== null &&
    deltaMin >= SHIFT_MIN &&
    deltaMin <= SHIFT_MAX &&
    deltaMin % 5 === 0;

  const preview = trpc.shift.preview.useQuery(
    { date: day.dateKey, deltaMin: validDelta ? (deltaMin as number) : 15 },
    { enabled: open && validDelta },
  );

  React.useEffect(() => {
    if (!open) {
      setTarget(null);
      setCustomMin(null);
      setTier(null);
      setReasonKey(null);
      setOtherText("");
      setCut(new Set());
      setTouchedCut(false);
      setError(null);
    }
  }, [open]);

  /*
   * The suggestion is adopted until the person touches the list. After that it
   * is theirs, and re-previewing (a changed amount) must not silently re-check
   * something they unchecked.
   */
  React.useEffect(() => {
    if (touchedCut || preview.data === undefined) return;
    setCut(new Set(preview.data.suggestedCutIds));
  }, [preview.data, touchedCut]);

  const zone = day.timezone;
  const byId = React.useMemo(() => {
    const map = new Map<string, DayView["notAssigned"][number]>();
    for (const part of day.parts) for (const item of part.items) map.set(item.id, item);
    for (const item of day.notAssigned) map.set(item.id, item);
    for (const item of day.cutByShift) map.set(item.id, item);
    return map;
  }, [day]);

  const overflowItems: OverflowItem[] = (preview.data?.overflow ?? [])
    .map((entry) => {
      const item = byId.get(entry.id);
      if (!item) return null;
      return {
        ...item,
        newStartLabel:
          entry.newStart === null ? "" : formatClock(entry.newStart, zone),
      };
    })
    .filter((entry): entry is OverflowItem => entry !== null);

  const passedHard = (preview.data?.passedHardIds ?? [])
    .map((id) => byId.get(id))
    .filter((item): item is DayView["notAssigned"][number] => item !== undefined);

  const otherChosen = reasonKey === OTHER_REASON_KEY;
  const reasonAnswered =
    (reasonKey !== null && !otherChosen) ||
    (otherChosen && otherText.trim().length > 0 && tier !== null);

  const cutCount = [...cut].filter((id) =>
    overflowItems.some((item) => item.id === id),
  ).length;

  const overMin = remainingOver(overflowItems, cut);

  async function submit(): Promise<void> {
    if (!validDelta || !reasonAnswered || preview.data === undefined) return;
    setError(null);

    const chosenTier = otherChosen ? (tier as MissTier) : tierFor(reasonKey);
    if (chosenTier === null) return;

    try {
      const result = await apply.mutateAsync({
        date: day.dateKey,
        deltaMin: deltaMin as number,
        reason: {
          reasonKey: otherChosen ? OTHER_REASON_KEY : reasonKey,
          reasonText: otherChosen ? otherText.trim() : null,
          tier: chosenTier,
        },
        cut: [...cut],
        // The day as the sheet last saw it. A mismatch is a `CONFLICT` and a
        // re-preview rather than a shift the person did not agree to.
        fingerprint: preview.data.fingerprint,
      });

      onOpenChange(false);
      onShifted?.();
      await refresh();

      // Ten seconds, and the same procedure SC-02's action calls.
      toastUndo({
        text: COPY.shifted(deltaMin as number),
        durationMs: UNDO_LONG_MS,
        onUndo: () => {
          undo.mutate(
            { shiftId: result.shiftId },
            { onSettled: () => void refresh() },
          );
        },
      });
    } catch (caught) {
      // A stale preview is not an error to read — the day moved on, so the
      // sheet catches up and asks again.
      if (isConflict(caught)) {
        await preview.refetch();
        setTouchedCut(false);
        return;
      }
      setError(COPY.applyError);
    }
  }

  async function refresh(): Promise<void> {
    await utils.day.get.invalidate({ date: day.dateKey });
    await utils.shell.status.invalidate();
  }

  function tierFor(key: string | null): MissTier | null {
    if (key === null) return null;
    for (const [group, list] of Object.entries(reasons.data?.byTier ?? {})) {
      if (list.some((reason) => reason.key === key)) return group as MissTier;
    }
    return null;
  }

  const anchorLabel = firstAnchorTitle(overflowItems, byId, day) ?? COPY.theDayCloses;

  return (
    <SheetHost open={open}>
      <ResponsiveSheet
        open={open}
        onOpenChange={onOpenChange}
        title={COPY.title}
        size="tall"
        footer={
          <div className="flex justify-end gap-(--space-2)">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {COPY.cancel}
            </Button>
            {reasonAnswered && validDelta ? (
              <Button
                busy={apply.isPending}
                disabled={!online}
                onClick={() => void submit()}
              >
                {cutCount === 0 ? COPY.shift : COPY.shiftAndCut(cutCount)}
              </Button>
            ) : null}
          </div>
        }
      >
        <div className="flex flex-col gap-(--space-5)">
          {!online ? <StatusLine variant="offline" placement="inline" /> : null}

          {/* ------------------------------------------------ 1 — amount -- */}
          <section className="flex flex-col gap-(--space-2)">
            <Text as="span" variant="caption" tone="secondary">
              {COPY.step(1)}
            </Text>
            <LargeTargetRow
              label={<Text as="h3" variant="secondary" weight={500}>{COPY.amountQuestion}</Text>}
              options={[
                ...TARGETS.map((minutes) => ({
                  value: String(minutes),
                  label: COPY.plusMinutes(minutes),
                })),
                { value: CUSTOM, label: COPY.custom },
              ]}
              value={target}
              onChange={(next) => {
                setTarget(next);
                setTouchedCut(false);
              }}
            />
            {target === CUSTOM ? (
              <NumberUnitInput
                label={COPY.amountQuestion}
                unit={COPY.minutesUnit}
                value={customMin}
                min={SHIFT_MIN}
                max={SHIFT_MAX}
                error={
                  customMin !== null && !validDelta ? COPY.amountError : undefined
                }
                onChange={(next) => {
                  setCustomMin(next);
                  setTouchedCut(false);
                }}
              />
            ) : null}
          </section>

          {/* ------------------------------------------------ 2 — reason -- */}
          {validDelta ? (
            <section className="flex flex-col gap-(--space-2)">
              <Text as="span" variant="caption" tone="secondary">
                {COPY.step(2)}
              </Text>
              <TierRadioRows
                label={<Text as="h3" variant="secondary" weight={500}>{COPY.reasonQuestion}</Text>}
                value={tier}
                onChange={setTier}
                reasons={withoutTradedUp(reasons.data?.byTier ?? null)}
                selectedReason={reasonKey}
                onReasonSelect={(key) => {
                  setReasonKey(key);
                  if (key !== OTHER_REASON_KEY) setTier(tierFor(key));
                }}
                otherText={otherText}
                onOtherTextChange={(text) =>
                  setOtherText(text.slice(0, OTHER_REASON_MAX))
                }
              />
              <HelperText>{COPY.reasonInherits}</HelperText>
            </section>
          ) : null}

          {/* --------------------------------------------------- 3 — fit -- */}
          {validDelta && reasonAnswered && preview.data !== undefined ? (
            <section className="flex flex-col gap-(--space-3)">
              <Text as="span" variant="caption" tone="secondary">
                {COPY.step(3)}
              </Text>
              <Text as="h3" variant="secondary" weight={500}>
                {COPY.fitHeading}
              </Text>

              <Text as="p" tone="secondary">
                {COPY.moveSummary(preview.data.moving, deltaMin as number)}
                {preview.data.doneStaying > 0
                  ? ` ${COPY.doneStay(preview.data.doneStaying)}`
                  : ""}
              </Text>

              {overflowItems.length === 0 && passedHard.length === 0 ? (
                <Text as="p" tone="secondary">
                  {COPY.everythingFits}
                </Text>
              ) : (
                <>
                  {overflowItems.length === 0 ? null : (
                    <Text as="p" tone="secondary">
                      {COPY.noLongerFit(overflowItems.length, anchorLabel)}
                    </Text>
                  )}
                  <OverflowCutList
                    items={overflowItems}
                    cut={cut}
                    onChange={(next) => {
                      setTouchedCut(true);
                      setCut(next);
                    }}
                    overMin={overMin}
                    passedHard={passedHard}
                  />
                </>
              )}
            </section>
          ) : null}

          {error === null ? null : <HelperText error>{error}</HelperText>}
        </div>
      </ResponsiveSheet>
    </SheetHost>
  );
}

/**
 * The reasons a shift may inherit — everything but *Stayed on something more
 * important* (§12 call 7). See the component's header for why.
 */
function withoutTradedUp(
  byTier: Readonly<Record<string, readonly { key: string }[]>> | null,
): Readonly<Record<MissTier, readonly never[]>> | undefined {
  if (byTier === null) return undefined;
  const out: Record<string, unknown> = {};
  for (const [tier, list] of Object.entries(byTier)) {
    out[tier] = list.filter((reason) => reason.key !== "stayed_on_important");
  }
  return out as Readonly<Record<MissTier, readonly never[]>>;
}

/** Minutes still over, given what is still checked. */
function remainingOver(
  items: readonly OverflowItem[],
  cut: ReadonlySet<string>,
): number {
  return items
    .filter((item) => !cut.has(item.id))
    .reduce((total, item) => total + (item.durationMin ?? 0), 0);
}

/**
 * What the overflow runs into — the earliest hard item after the first
 * overflowing item, or nothing, in which case the caller says *the day closes*.
 */
function firstAnchorTitle(
  overflow: readonly OverflowItem[],
  byId: Map<string, DayView["notAssigned"][number]>,
  day: DayView,
): string | null {
  const earliest = overflow
    .map((item) => item.scheduledStart?.getTime() ?? Number.POSITIVE_INFINITY)
    .sort((a, b) => a - b)[0];

  if (earliest === undefined) return null;

  const anchors = [...byId.values()]
    .filter(
      (item) =>
        item.scheduling === "hard" &&
        item.scheduledStart !== null &&
        item.scheduledStart.getTime() >= earliest,
    )
    .sort(
      (a, b) =>
        (a.scheduledStart?.getTime() ?? 0) - (b.scheduledStart?.getTime() ?? 0),
    );

  void day;
  return anchors[0]?.title ?? null;
}

function isConflict(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof (error as { data?: { code?: string } }).data?.code === "string" &&
    (error as { data: { code: string } }).data.code === "CONFLICT"
  );
}
