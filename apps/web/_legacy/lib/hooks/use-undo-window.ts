"use client";

import * as React from "react";

/**
 * The five seconds after a tap when *Undo* is still offered, keyed by row.
 *
 * ONE WINDOW PER ROW, MANY ROWS AT ONCE. Checking off three items in a row
 * should leave three undos open, not replace each with the last — a person
 * working down a list is not editing one thing, they are doing several, and
 * any of them might have been the wrong tap.
 *
 * RE-OPENING A ROW'S WINDOW RESTARTS ITS CLOCK rather than stacking a second
 * timer. Un-ticking an item inside its own undo window is a normal thing to
 * do, and the second action deserves the same five seconds the first got.
 *
 * THE PAYLOAD IS CARRIED WITH THE WINDOW. Undoing a completion has to restore
 * the ORIGINAL `done_at`, and that value exists only in the moment before the
 * write — holding it here is what lets the undo be a restoration rather than a
 * new record.
 */
export type UndoEntry<TPayload> = { payload: TPayload };

export function useUndoWindow<TPayload>(ms: number) {
  const [open, setOpen] = React.useState<
    ReadonlyMap<string, UndoEntry<TPayload>>
  >(new Map());
  const timers = React.useRef(new Map<string, number>());

  const close = React.useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
    setOpen((current) => {
      if (!current.has(id)) return current;
      const next = new Map(current);
      next.delete(id);
      return next;
    });
  }, []);

  const start = React.useCallback(
    (id: string, payload: TPayload) => {
      const existing = timers.current.get(id);
      if (existing !== undefined) window.clearTimeout(existing);

      setOpen((current) => {
        const next = new Map(current);
        next.set(id, { payload });
        return next;
      });

      timers.current.set(
        id,
        window.setTimeout(() => {
          timers.current.delete(id);
          setOpen((current) => {
            if (!current.has(id)) return current;
            const next = new Map(current);
            next.delete(id);
            return next;
          });
        }, ms),
      );
    },
    [ms],
  );

  // Every pending timer is cleared on unmount: a callback firing into a
  // navigated-away screen is a state update on nothing.
  React.useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) window.clearTimeout(timer);
      pending.clear();
    };
  }, []);

  const payloadFor = React.useCallback(
    (id: string): TPayload | undefined => open.get(id)?.payload,
    [open],
  );

  return { open, start, close, payloadFor };
}
