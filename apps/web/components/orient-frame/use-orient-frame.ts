"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { trpc, type RouterOutputs } from "@/lib/trpc/client";
import { todayRoute } from "@/lib/routes";

/**
 * The frame's behaviour — UX v1.1 §5.2 (DYN-13), amended by v1.2 §5.2 (RUN-9).
 *
 * THE WAKE IS ALREADY STAMPED by the time this runs: `day.orient` wrote it
 * on the server read. This owns the three optional lines' autosave (a
 * debounce and the blur) — gratitude, intention, and since v1.2 *Today, as I
 * see it* — and *Start the morning*, which writes nothing of its own and,
 * for one tap only, shows the R18 line when its rules say so.
 *
 * THE LINE IS A BEAT, THEN THE MORNING. "It then proceeds": the caption
 * shows, the navigation follows after `SKIP_LINE_BEAT_MS`. Nothing is written
 * for the line; it is a recall, not a record.
 */

export type OrientView = RouterOutputs["day"]["orient"];

type Lines = { gratitude: string; intention: string; visualisation: string };

const AUTOSAVE_MS = 600;
export const SKIP_LINE_BEAT_MS = 1500;

export function useOrientFrame(initial: OrientView) {
  const router = useRouter();
  const save = trpc.day.saveMorning.useMutation();

  const [lines, setLines] = React.useState<Lines>({
    gratitude: initial.gratitude ?? "",
    intention: initial.intention ?? "",
    visualisation: initial.visualisation ?? "",
  });
  const [showSkipLine, setShowSkipLine] = React.useState(false);
  const [starting, setStarting] = React.useState(false);

  const saved = React.useRef<Lines>({
    gratitude: initial.gratitude ?? "",
    intention: initial.intention ?? "",
    visualisation: initial.visualisation ?? "",
  });
  const timer = React.useRef<number | null>(null);

  const flush = React.useCallback(
    (next: Lines) => {
      const patch: Partial<Lines> = {};
      if (next.gratitude !== saved.current.gratitude) patch.gratitude = next.gratitude;
      if (next.intention !== saved.current.intention) patch.intention = next.intention;
      if (next.visualisation !== saved.current.visualisation) patch.visualisation = next.visualisation;
      if (Object.keys(patch).length === 0) return;
      saved.current = next;
      // A failed save keeps the text on screen; the primary still works.
      save.mutate({ date: initial.date, ...patch });
    },
    [initial.date, save],
  );

  const schedule = React.useCallback(
    (next: Lines) => {
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        timer.current = null;
        flush(next);
      }, AUTOSAVE_MS);
    },
    [flush],
  );

  React.useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  function onLine(key: keyof Lines, value: string): void {
    const next = { ...lines, [key]: value };
    setLines(next);
    schedule(next);
  }

  function onBlur(): void {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    flush(lines);
  }

  function start(): void {
    if (starting) return;
    setStarting(true);
    onBlur();
    const line = initial.askGratitude && initial.skippedYesterday && lines.gratitude.trim() === "";
    if (line) {
      setShowSkipLine(true);
      window.setTimeout(() => router.replace(todayRoute()), SKIP_LINE_BEAT_MS);
      return;
    }
    router.replace(todayRoute());
  }

  return {
    lines,
    onLine,
    onBlur,
    start,
    starting,
    showSkipLine,
  };
}
