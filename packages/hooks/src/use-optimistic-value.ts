import { useCallback, useEffect, useRef, useState } from "react";

import { STEPPER_COMMIT_DEBOUNCE_MS } from "@syn/constants";

/**
 * useOptimisticValue — a control's own value, ahead of the request
 * (UX v1.2 §2 guardrail 4, TD-18; RUN-7).
 *
 * THE TAP CHANGES THE CONTROL; THE SERVER CATCHES UP. `set(next)` moves
 * `local` at once and schedules one commit after `debounceMs` of quiet
 * (trailing), so five fast taps are one request. `committing` is true while
 * that request is in flight — the composite shows a hairline pulse, never a
 * disabled control. When the request rejects, `local` returns to the last
 * `value` the caller handed in and `error` carries the rejection for the
 * screen's one line.
 *
 * A REVERT NEVER UNDOES A NEWER TAP. Every commit carries a sequence number;
 * a rejection (or a success) from an older commit than the latest is ignored
 * except for clearing `committing`, so a person who tapped again while the
 * first request was failing keeps the value they see.
 *
 * `value` IS THE TRUTH BETWEEN TAPS. While nothing is pending, `local`
 * follows `value` — a refetch that changes the row changes the control.
 * While a commit is pending, `value` is left alone so a stale read cannot
 * snap the control back under a finger.
 *
 * PLATFORM-PURE: timers and state only, no DOM. The Expo re-skin uses it
 * unchanged. There is no story; the composites that consume it carry theirs.
 */
export type UseOptimisticValueOptions<T> = {
  /** The committed value — the row's, or the form's. */
  value: T;
  /** The write. Resolve to accept, reject to revert. */
  onCommit?: (next: T) => Promise<void> | void;
  /** Quiet time before the write; `STEPPER_COMMIT_DEBOUNCE_MS` by default. 0 commits at once. */
  debounceMs?: number;
  /** Called after a rejection has reverted `local`; the screen shows the line. */
  onError?: (error: unknown) => void;
};

export type UseOptimisticValueResult<T> = {
  /** What the control shows. */
  local: T;
  /** Move `local` now; commit after the debounce. */
  set: (next: T) => void;
  /** Move `local` now and commit nothing yet — a value mid-typing; the next `set` commits. */
  hold: (next: T) => void;
  /** A write is in flight. */
  committing: boolean;
  /** The last rejection, until the next `set`. */
  error: unknown;
  /** Back to `value`, dropping any pending commit. */
  revert: () => void;
};

export function useOptimisticValue<T>({
  value,
  onCommit,
  debounceMs = STEPPER_COMMIT_DEBOUNCE_MS,
  onError,
}: UseOptimisticValueOptions<T>): UseOptimisticValueResult<T> {
  const [local, setLocal] = useState<T>(value);
  const [committing, setCommitting] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sequence = useRef(0);
  const inFlight = useRef(0);
  const pending = useRef(false);
  const latestValue = useRef(value);
  const latestCommit = useRef(onCommit);
  const latestOnError = useRef(onError);
  latestValue.current = value;
  latestCommit.current = onCommit;
  latestOnError.current = onError;

  // Between taps the row's value is the control's value.
  useEffect(() => {
    if (!pending.current && inFlight.current === 0) setLocal(value);
  }, [value]);

  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );

  const commit = useCallback((next: T) => {
    pending.current = false;
    const write = latestCommit.current;
    if (write === undefined) return;

    const seq = ++sequence.current;
    inFlight.current += 1;
    setCommitting(true);

    let result: Promise<void> | void;
    try {
      result = write(next);
    } catch (thrown) {
      result = Promise.reject(thrown);
    }

    Promise.resolve(result)
      .then(() => {
        inFlight.current -= 1;
        if (seq === sequence.current) setCommitting(false);
      })
      .catch((thrown: unknown) => {
        inFlight.current -= 1;
        // An older commit's failure is not the latest tap's.
        if (seq !== sequence.current) return;
        setCommitting(false);
        setLocal(latestValue.current);
        setError(thrown);
        latestOnError.current?.(thrown);
      });
  }, []);

  const set = useCallback(
    (next: T) => {
      setLocal(next);
      setError(null);
      pending.current = true;
      if (timer.current !== null) clearTimeout(timer.current);
      if (debounceMs <= 0) {
        commit(next);
        return;
      }
      timer.current = setTimeout(() => {
        timer.current = null;
        commit(next);
      }, debounceMs);
    },
    [commit, debounceMs],
  );

  const hold = useCallback((next: T) => {
    setLocal(next);
    setError(null);
    pending.current = true;
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const revert = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
    pending.current = false;
    // Anything already in flight is superseded: its answer is ignored.
    sequence.current += 1;
    setCommitting(false);
    setError(null);
    setLocal(latestValue.current);
  }, []);

  return { local, set, hold, committing, error, revert };
}
