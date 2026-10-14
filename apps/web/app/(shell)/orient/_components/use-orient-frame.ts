"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { SaveStatus } from "@syn/types";
import type { MorningLinesInput } from "@syn/validators";
import {
  isWaitingToSave,
  useMorning,
  useStampOrient,
  useWriteMorningLines,
} from "@/lib/data/use-morning";
import { todayReviewRoute } from "@/lib/routes";

/**
 * Orient's behaviour (USE-12), on the legacy frame's hook (DYN-13, RUN-9).
 *
 * THE OPEN IS THE WAKE. Once the entry gate has let the day in, the stamp is
 * sent once for the life of the screen; the server keeps the first, so a
 * later open never moves it. Nothing here reads the clock: the server stamps
 * at its own now.
 *
 * THE LINES AUTOSAVE: a debounce and the blur, only the lines that changed.
 * Offline a write waits on the device ("Waiting to save") and goes again
 * when the connection is back. When the lines cannot be read they show
 * empty and still save (D-USE-63).
 *
 * "Review the day" writes nothing and goes on (D-USE-5).
 */

export type LineKey = "grateful" | "intention" | "todayAsISeeIt";
type Lines = Record<LineKey, string>;

const AUTOSAVE_MS = 600;
const EMPTY: Lines = { grateful: "", intention: "", todayAsISeeIt: "" };

export function useOrientFrame(dateKey: string, entered: boolean) {
  const router = useRouter();
  const morning = useMorning(dateKey);
  const stamp = useStampOrient();
  const write = useWriteMorningLines();

  /* ---- the wake, once ---- */
  const stamped = React.useRef(false);
  React.useEffect(() => {
    if (!entered || stamped.current) return;
    stamped.current = true;
    stamp.mutate(dateKey);
  }, [dateKey, entered, stamp]);

  /* ---- the lines ---- */
  const [lines, setLines] = React.useState<Lines>(EMPTY);
  const [status, setStatus] = React.useState<SaveStatus>("idle");
  const saved = React.useRef<Lines>(EMPTY);
  const typed = React.useRef(false);
  const timer = React.useRef<number | null>(null);

  // The read fills the fields once, unless a line was typed before it came.
  const loaded = morning.day.data?.lines;
  const filled = React.useRef(false);
  React.useEffect(() => {
    if (filled.current || morning.day.data === undefined) return;
    filled.current = true;
    if (typed.current) return;
    const next: Lines = {
      grateful: loaded?.grateful ?? "",
      intention: loaded?.intention ?? "",
      todayAsISeeIt: loaded?.todayAsISeeIt ?? "",
    };
    saved.current = next;
    setLines(next);
    if (Object.values(next).some((line) => line !== "")) setStatus("saved");
  }, [loaded, morning.day.data]);

  const flush = React.useCallback(
    (next: Lines) => {
      const patch: MorningLinesInput = { onDate: dateKey };
      let changed = false;
      for (const key of ["grateful", "intention", "todayAsISeeIt"] as const) {
        if (next[key] !== saved.current[key]) {
          patch[key] = next[key];
          changed = true;
        }
      }
      if (!changed) return;
      setStatus("saving");
      write.mutate(patch, {
        onSuccess: () => {
          saved.current = { ...saved.current, ...patch };
          setStatus("saved");
        },
        // The words stay on screen either way; offline they wait.
        onError: (error) =>
          setStatus(isWaitingToSave(error) ? "waiting" : "failed"),
      });
    },
    [dateKey, write],
  );

  const latest = React.useRef(lines);
  latest.current = lines;

  // Back online: what waited goes again.
  React.useEffect(() => {
    const resend = () => flush(latest.current);
    window.addEventListener("online", resend);
    return () => window.removeEventListener("online", resend);
  }, [flush]);

  React.useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  function onLine(key: LineKey, value: string): void {
    typed.current = true;
    const next = { ...lines, [key]: value };
    setLines(next);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      flush(next);
    }, AUTOSAVE_MS);
  }

  function onBlur(): void {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    flush(lines);
  }

  function review(): void {
    onBlur();
    router.push(`${todayReviewRoute()}${window.location.search}`);
  }

  return {
    reading: morning.reading,
    retryReading: morning.retryReading,
    lastNight: morning.day.data?.lastNight ?? null,
    lines,
    status,
    retrySave: () => flush(latest.current),
    onLine,
    onBlur,
    review,
  };
}
