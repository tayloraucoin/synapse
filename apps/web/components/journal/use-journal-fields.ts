"use client";

import * as React from "react";

import type { SaveStatus } from "@syn/types";

import { isWaitingToSave } from "@/lib/data/use-morning";

/**
 * The journal's fields — UX v1.1 §7.2 (DYN-18), on `useJournal` (USE-44).
 *
 * ONE KEY PER SAVE. Each field autosaves 600 ms after the last key and on
 * blur, sending only its own answer, so a second device writing a different
 * field never loses this one. The status is the one quiet word under the
 * last field: *saving*, *saved*, or *Saving on this device* while a write
 * waits for a connection or is retried; never louder.
 *
 * OFFLINE THE WORDS STAY. A write with no connection is kept as waiting and
 * sent again, each key with its latest words, once the connection is back.
 *
 * NOTHING HERE COUNTS, TIMES OR JUDGES. An empty field is nothing.
 */

const AUTOSAVE_MS = 600;
const MAX_ATTEMPTS = 3;

const hasWords = (answers: Readonly<Record<string, string>>) =>
  Object.values(answers).some((value) => value.trim() !== "");

export function useJournalFields({
  initial,
  save,
  online,
}: {
  initial: Readonly<Record<string, string>>;
  save: (key: string, value: string) => Promise<unknown>;
  online: boolean;
}) {
  const [answers, setAnswers] = React.useState<Record<string, string>>({
    ...initial,
  });
  // Words already kept read as saved; an empty page says nothing yet.
  const [status, setStatus] = React.useState<SaveStatus>(
    hasWords(initial) ? "saved" : "idle",
  );

  const latest = React.useRef<Record<string, string>>({ ...initial });
  const saved = React.useRef<Record<string, string>>({ ...initial });
  const waiting = React.useRef<Set<string>>(new Set());
  const timers = React.useRef<Map<string, number>>(new Map());

  const flush = React.useCallback(
    async (key: string): Promise<void> => {
      const value = latest.current[key] ?? "";
      if ((saved.current[key] ?? "") === value) return;
      setStatus("saving");
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        try {
          await save(key, value);
          saved.current[key] = value;
          waiting.current.delete(key);
          setStatus(waiting.current.size > 0 ? "waiting" : "saved");
          return;
        } catch (error) {
          if (isWaitingToSave(error)) {
            waiting.current.add(key);
            setStatus("waiting");
            return;
          }
          if (attempt === MAX_ATTEMPTS) break;
          setStatus("retrying");
          await new Promise((resolve) =>
            window.setTimeout(resolve, 400 * attempt),
          );
        }
      }
      setStatus("failed");
    },
    [save],
  );

  function onChange(key: string, value: string): void {
    latest.current[key] = value;
    setAnswers((current) => ({ ...current, [key]: value }));
    const pending = timers.current.get(key);
    if (pending !== undefined) window.clearTimeout(pending);
    timers.current.set(
      key,
      window.setTimeout(() => {
        timers.current.delete(key);
        void flush(key);
      }, AUTOSAVE_MS),
    );
  }

  function onBlur(key: string): void {
    const pending = timers.current.get(key);
    if (pending !== undefined) {
      window.clearTimeout(pending);
      timers.current.delete(key);
    }
    void flush(key);
  }

  // Back online: each waiting key goes again with its latest words.
  React.useEffect(() => {
    if (!online) return;
    for (const key of [...waiting.current]) void flush(key);
  }, [online, flush]);

  React.useEffect(() => {
    const active = timers.current;
    return () => {
      for (const handle of active.values()) window.clearTimeout(handle);
    };
  }, []);

  return { answers, status, onChange, onBlur };
}
