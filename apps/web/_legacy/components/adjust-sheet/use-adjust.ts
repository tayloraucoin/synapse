"use client";

import * as React from "react";

import { toastUndo } from "@syn/ui";
import { UNDO_LONG_MS } from "@syn/constants";
import type { ReasonView } from "@syn/types";

import { trpc, type RouterOutputs } from "@/lib/trpc/client";

import { ADJUST_COPY as COPY } from "./copy";

/**
 * Adjust's state — UX v1.1 §6.6 (DYN-17): four answers feeding one preview.
 *
 * THE ARITHMETIC IS THE SERVER'S. Every answer change re-runs
 * `adjust.preview` (a read) and the proposal is whatever came back —
 * shorten to the floors then cut, cut ascending, the person's ticks, or the
 * slide; the sheet computes nothing of its own. *Set* sends the same answers
 * with the preview's fingerprint, and a day that changed under the sheet is
 * a `CONFLICT` the sheet answers with a fresh preview, never a surprise.
 *
 * THE ENTRY PRESELECTS THE REASON, and that is all it does: *Slept in* from
 * the late-wake offer, *Ran long* from the header row, *Something came up*
 * from a one-off's sheet. Nothing is inferred from taps.
 */

export type AdjustEntry = "late-offer" | "header" | "one-off" | "band-drag";
export type AdjustWhat = "slide" | "hold";
export type AdjustHow = "shorten" | "cut" | "choose";
export type AdjustPreview = RouterOutputs["adjust"]["preview"];
export type AdjustScope = RouterOutputs["adjust"]["scope"];

const PRESELECT: Record<AdjustEntry, string> = {
  "late-offer": "slept_in",
  header: "ran_long",
  "one-off": "something_came_up",
  "band-drag": "ran_long",
};

const PREVIEW_DEBOUNCE_MS = 250;

export function useAdjust(options: {
  open: boolean;
  date: string;
  entry: AdjustEntry;
  bandDragDeltaMin?: number;
  onApplied?: () => void;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const scope = trpc.adjust.scope.useQuery({ date: options.date }, { enabled: options.open });
  const reasonList = trpc.reason.list.useQuery(undefined, { enabled: options.open });
  const commit = trpc.adjust.commit.useMutation();
  const undo = trpc.adjust.undo.useMutation();

  /** The chips: the person's set, built-ins first, *Other* last. */
  const reasons: ReasonView[] = React.useMemo(() => {
    const list = reasonList.data;
    if (!list) return [];
    const all = [...list.byTier.circumstance, ...list.byTier.scoping, ...list.byTier.chose_not_to];
    const other = list.other;
    return other === null ? all : [...all.filter((reason) => reason.key !== other.key), other];
  }, [reasonList.data]);

  const [reasonKey, setReasonKey] = React.useState<string | null>(null);
  const [what, setWhat] = React.useState<AdjustWhat | null>(null);
  const [how, setHow] = React.useState<AdjustHow | null>(null);
  const [chosenIds, setChosenIds] = React.useState<Set<string>>(() => new Set());
  const [keepInstead, setKeepInstead] = React.useState<Set<string>>(() => new Set());
  const [preview, setPreview] = React.useState<AdjustPreview | null>(null);
  const [previewing, setPreviewing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Reset per open; the entry's chip is the one preselection.
  React.useEffect(() => {
    if (!options.open) return;
    setWhat(null);
    setHow(null);
    setChosenIds(new Set());
    setKeepInstead(new Set());
    setPreview(null);
    setError(null);
  }, [options.open, options.entry]);

  React.useEffect(() => {
    if (!options.open || reasons.length === 0 || reasonKey !== null) return;
    const wanted = PRESELECT[options.entry];
    setReasonKey(reasons.find((reason) => reason.key === wanted)?.key ?? reasons[0]?.key ?? null);
  }, [options.open, options.entry, reasons, reasonKey]);

  React.useEffect(() => {
    if (!options.open) setReasonKey(null);
  }, [options.open]);

  // The anchor decides step 2's rows (§6.6): soft → slide first; hard → hold only.
  const anchorIsHard = scope.data?.anchorIsHard ?? true;
  React.useEffect(() => {
    if (!options.open || scope.data === undefined || what !== null) return;
    if (options.entry === "band-drag" && !anchorIsHard) setWhat("slide");
  }, [options.open, options.entry, scope.data, anchorIsHard, what]);

  const ready = reasonKey !== null && what !== null && (what === "slide" || how !== null);

  /** Every change re-previews; the proposal is the server's answer. */
  const timer = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (!options.open || !ready || reasonKey === null || what === null) return;
    if (timer.current !== null) window.clearTimeout(timer.current);
    setPreviewing(true);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      void utils.adjust.preview
        .fetch({
          date: options.date,
          entry: options.entry,
          reasonKey,
          what,
          ...(what === "hold" && how !== null ? { how } : {}),
          ...(how === "choose" ? { chosenIds: [...chosenIds] } : {}),
          ...(keepInstead.size > 0 ? { keepInstead: [...keepInstead] } : {}),
        })
        .then((next) => {
          setPreview(next);
          setError(null);
          // *Choose what stays* starts from everything the proposal kept.
          if (how === "choose" && chosenIds.size === 0) {
            setChosenIds(new Set(next.proposal.map((row) => row.id)));
          }
        })
        .catch(() => setError(COPY.error))
        .finally(() => setPreviewing(false));
    }, PREVIEW_DEBOUNCE_MS);
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [options.open, options.date, options.entry, ready, reasonKey, what, how, chosenIds, keepInstead, utils]);

  async function set(): Promise<void> {
    if (preview === null || reasonKey === null || what === null) return;
    setError(null);
    try {
      const applied = await commit.mutateAsync({
        date: options.date,
        entry: options.entry,
        reasonKey,
        what,
        ...(what === "hold" && how !== null ? { how } : {}),
        ...(how === "choose" ? { chosenIds: [...chosenIds] } : {}),
        ...(keepInstead.size > 0 ? { keepInstead: [...keepInstead] } : {}),
        fingerprint: preview.fingerprint,
      });
      await utils.day.get.invalidate({ date: options.date });
      await utils.shell.status.invalidate();
      options.onApplied?.();
      options.onClose();
      toastUndo({
        text: COPY.applied(applied.cut + applied.notAssigned, applied.slideMin),
        durationMs: UNDO_LONG_MS,
        onUndo: () => {
          undo.mutate(
            { shiftId: applied.shiftId },
            {
              onSettled: () => {
                void utils.day.get.invalidate({ date: options.date });
                options.onApplied?.();
              },
            },
          );
        },
      });
    } catch {
      // A stale preview is not an error to read — the day moved on, so the
      // sheet catches up and asks again with a fresh proposal.
      setError(COPY.error);
      setPreview(null);
      setKeepInstead(new Set());
    }
  }

  return {
    scope: scope.data ?? null,
    reasons,
    reasonKey,
    setReasonKey,
    what,
    setWhat: (next: AdjustWhat) => {
      setWhat(next);
      if (next === "slide") setHow(null);
    },
    how,
    setHow: (next: AdjustHow) => {
      setHow(next);
      setChosenIds(new Set());
      setKeepInstead(new Set());
    },
    chosenIds,
    toggleChosen: (id: string, on: boolean) =>
      setChosenIds((current) => {
        const next = new Set(current);
        if (on) next.add(id);
        else next.delete(id);
        return next;
      }),
    keepInstead,
    keep: (id: string) => setKeepInstead((current) => new Set(current).add(id)),
    anchorIsHard,
    preview,
    previewing,
    ready,
    set,
    setting: commit.isPending,
    error,
    loading: scope.isLoading || reasonList.isLoading,
  };
}

export type AdjustApi = ReturnType<typeof useAdjust>;
