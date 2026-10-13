"use client";

import * as React from "react";

import type { SaveStatus } from "@syn/types";

import { trpc, type RouterOutputs } from "@/lib/trpc/client";

/**
 * The journal's behaviour — UX v1.1 §7.2 (DYN-18).
 *
 * ONE KEY PER SAVE. Each field autosaves on pause (and on blur) through
 * `journal.save`, which merges that one key into the day's row — a second
 * device writing a different field never loses this one. The status is the
 * one quiet word in the corner: *saving*, *saved*, or *Saving on this
 * device* while a write is retried; never louder.
 *
 * NOTHING HERE COUNTS, TIMES OR JUDGES. An empty field is nothing.
 */

export type JournalEntry = RouterOutputs["journal"]["get"];

const AUTOSAVE_MS = 600;
const MAX_ATTEMPTS = 3;

export function useJournal(initial: JournalEntry) {
  const utils = trpc.useUtils();
  const save = trpc.journal.save.useMutation();

  const [answers, setAnswers] = React.useState<Record<string, string>>({ ...initial.answers });
  const [status, setStatus] = React.useState<SaveStatus>("idle");

  const saved = React.useRef<Record<string, string>>({ ...initial.answers });
  const timers = React.useRef<Map<string, number>>(new Map());

  const flush = React.useCallback(
    async (key: string, value: string): Promise<void> => {
      if ((saved.current[key] ?? "") === value) return;
      setStatus("saving");
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        try {
          await save.mutateAsync({ date: initial.date, key, value });
          saved.current[key] = value;
          setStatus("saved");
          await utils.day.get.invalidate({ date: initial.date });
          return;
        } catch {
          if (attempt === MAX_ATTEMPTS) break;
          setStatus("retrying");
          await new Promise((resolve) => window.setTimeout(resolve, 400 * attempt));
        }
      }
      setStatus("failed");
    },
    [initial.date, save, utils],
  );

  function onChange(key: string, value: string): void {
    setAnswers((current) => ({ ...current, [key]: value }));
    const pending = timers.current.get(key);
    if (pending !== undefined) window.clearTimeout(pending);
    timers.current.set(
      key,
      window.setTimeout(() => {
        timers.current.delete(key);
        void flush(key, value);
      }, AUTOSAVE_MS),
    );
  }

  function onBlur(key: string): void {
    const pending = timers.current.get(key);
    if (pending !== undefined) {
      window.clearTimeout(pending);
      timers.current.delete(key);
    }
    void flush(key, answers[key] ?? "");
  }

  React.useEffect(() => {
    const active = timers.current;
    return () => {
      for (const handle of active.values()) window.clearTimeout(handle);
    };
  }, []);

  return { answers, status, onChange, onBlur };
}
