"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { trpc, type RouterOutputs } from "@/lib/trpc/client";
import { todayRoute } from "@/lib/routes";

/**
 * The frame's behaviour — UX v1.1 §5.2 (DYN-13).
 *
 * THE WAKE IS ALREADY STAMPED by the time this runs: `day.orient` wrote it
 * on the server read. This owns the two optional lines' autosave (a debounce
 * and the blur), and *Start the morning* — which writes nothing of its own
 * and, for one tap only, shows the R18 line when its rules say so.
 *
 * THE LINE IS A BEAT, THEN THE MORNING. "It then proceeds": the caption
 * shows, the navigation follows after `SKIP_LINE_BEAT_MS`. Nothing is written
 * for the line; it is a recall, not a record.
 */

export type OrientView = RouterOutputs["day"]["orient"];

const AUTOSAVE_MS = 600;
export const SKIP_LINE_BEAT_MS = 1500;

export function useOrientFrame(initial: OrientView) {
  const router = useRouter();
  const save = trpc.day.saveMorning.useMutation();

  const [gratitude, setGratitude] = React.useState(initial.gratitude ?? "");
  const [intention, setIntention] = React.useState(initial.intention ?? "");
  const [showSkipLine, setShowSkipLine] = React.useState(false);
  const [starting, setStarting] = React.useState(false);

  const saved = React.useRef({ gratitude: initial.gratitude ?? "", intention: initial.intention ?? "" });
  const timer = React.useRef<number | null>(null);

  const flush = React.useCallback(
    (next: { gratitude: string; intention: string }) => {
      const patch: { gratitude?: string; intention?: string } = {};
      if (next.gratitude !== saved.current.gratitude) patch.gratitude = next.gratitude;
      if (next.intention !== saved.current.intention) patch.intention = next.intention;
      if (Object.keys(patch).length === 0) return;
      saved.current = next;
      // A failed save keeps the text on screen; the primary still works.
      save.mutate({ date: initial.date, ...patch });
    },
    [initial.date, save],
  );

  const schedule = React.useCallback(
    (next: { gratitude: string; intention: string }) => {
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

  function onGratitude(value: string): void {
    setGratitude(value);
    schedule({ gratitude: value, intention });
  }

  function onIntention(value: string): void {
    setIntention(value);
    schedule({ gratitude, intention: value });
  }

  function onBlur(): void {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    flush({ gratitude, intention });
  }

  function start(): void {
    if (starting) return;
    setStarting(true);
    onBlur();
    const line = initial.askGratitude && initial.skippedYesterday && gratitude.trim() === "";
    if (line) {
      setShowSkipLine(true);
      window.setTimeout(() => router.replace(todayRoute()), SKIP_LINE_BEAT_MS);
      return;
    }
    router.replace(todayRoute());
  }

  return {
    gratitude,
    intention,
    onGratitude,
    onIntention,
    onBlur,
    start,
    starting,
    showSkipLine,
  };
}
