"use client";

/**
 * The landing page's two live figures — SYS-6, `docs/ux/landing-page-ux.md` §4.
 *
 * `ExampleDay` is the hero: seven rows, the three day parts, and the now line
 * at the visitor's own local time, moving by re-render on the minute (official
 * spec §9.6). `MovedRows` is pillar 2: two rows, one done in its window and one
 * done late. Both let the visitor tick a row and undo it, because a picture of
 * the List that cannot be touched is a screenshot.
 *
 * FIRST PAINT IS DELIBERATELY EARLY, NEVER WRONG. `now` is null on the server
 * and on the client's first render, so both produce the same markup: every row
 * upcoming, nothing checked, no line. The first effect reads the clock and the
 * device zone, and the states, the checks, and the line arrive in one
 * re-render. Times are built as the same wall clock in whichever zone is in
 * force, so "7:00 AM" is "7:00 AM" before and after — only the `<time>`
 * attribute changes, which `TimeText` already suppresses.
 *
 * NOTHING HERE IS STORED. The taps live in component state and are gone on
 * reload. There is no account, nothing is written, and the page asks for
 * nothing.
 */

import { UNDO_SHORT_MS } from "@syn/constants";
import type { DayItemView } from "@syn/types";
import { BlockHeader, ItemRow, NowLine } from "@syn/ui";
import { formatClock } from "@syn/utils";
import * as React from "react";

import {
  buildExampleItems,
  buildMovedRows,
  deriveState,
  deviceTimeZone,
  groupByBlock,
  initialDone,
  nowLineAfterIndex,
  nowLineMinutes,
  readNow,
  STATIC_TIME_ZONE,
} from "./example-day";

const UNDO_LABEL = "Undo";
const MINUTE_MS = 60_000;

/**
 * The five-second inline undo (Epic 2 §0.1 rule 8), for as many rows as the
 * visitor taps. The window is `@syn/constants`' own, so this figure and the
 * real List cannot drift apart on the one number a person actually feels.
 */
function useUndoFlags() {
  const [recent, setRecent] = React.useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );
  const timers = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  React.useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => clearTimeout(timer));
      pending.clear();
    };
  }, []);

  const forget = React.useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setRecent((previous) => {
      if (!previous.has(id)) return previous;
      const next = new Set(previous);
      next.delete(id);
      return next;
    });
  }, []);

  const mark = React.useCallback((id: string) => {
    const existing = timers.current.get(id);
    if (existing !== undefined) clearTimeout(existing);

    setRecent((previous) => new Set(previous).add(id));

    timers.current.set(
      id,
      setTimeout(() => {
        timers.current.delete(id);
        setRecent((previous) => {
          const next = new Set(previous);
          next.delete(id);
          return next;
        });
      }, UNDO_SHORT_MS),
    );
  }, []);

  return { recent, mark, forget };
}

/** Flip one id in a done map, recording when it was ticked. */
function flip(
  done: ReadonlyMap<string, Date>,
  id: string,
  at: Date,
): ReadonlyMap<string, Date> {
  const next = new Map(done);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.set(id, at);
  }
  return next;
}

/* ------------------------------------------------------------- the hero -- */

export function ExampleDay({ className }: { className?: string }) {
  /* UTC instants until the clock is known — see the header note. */
  const [items, setItems] = React.useState<readonly DayItemView[]>(() =>
    buildExampleItems(false),
  );
  const [now, setNow] = React.useState<Date | null>(null);
  const [timeZone, setTimeZone] = React.useState(STATIC_TIME_ZONE);
  const [done, setDone] = React.useState<ReadonlyMap<string, Date>>(
    () => new Map<string, Date>(),
  );
  const { recent, mark, forget } = useUndoFlags();

  React.useEffect(() => {
    const start = readNow();
    const local = buildExampleItems(true, start);

    setItems(local);
    setTimeZone(deviceTimeZone());
    setDone(initialDone(local, start));
    setNow(start);

    /*
     * On the minute, not every second: the line's position and every row's
     * state change at minute precision, and a tick a person cannot see is a
     * render they paid for. The first timeout lands on the next :00 so the
     * line moves when the clock does, not a fraction after it.
     */
    let interval: ReturnType<typeof setInterval> | undefined;
    const align = setTimeout(
      () => {
        setNow(readNow());
        interval = setInterval(() => setNow(readNow()), MINUTE_MS);
      },
      MINUTE_MS - (start.getTime() % MINUTE_MS),
    );

    /* A backgrounded tab's timers are throttled, so re-read on return. */
    const onVisible = () => {
      if (document.visibilityState === "visible") setNow(readNow());
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearTimeout(align);
      if (interval !== undefined) clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const groups = React.useMemo(() => groupByBlock(items), [items]);
  const flatIndex = React.useMemo(
    () => new Map(items.map((item, index) => [item.id, index])),
    [items],
  );

  const lineAfter = now === null ? null : nowLineAfterIndex(items, now);

  const toggle = React.useCallback(
    (item: DayItemView) => {
      setDone((previous) => flip(previous, item.id, readNow()));
      mark(item.id);
    },
    [mark],
  );

  const undo = React.useCallback(
    (item: DayItemView) => {
      setDone((previous) => flip(previous, item.id, readNow()));
      forget(item.id);
    },
    [forget],
  );

  const lineSlot =
    now === null ? null : (
      <li aria-hidden="true" className="relative h-0">
        <NowLine
          atMin={nowLineMinutes(now, timeZone)}
          topPx={0}
          label={formatClock(now, timeZone)}
        />
      </li>
    );

  return (
    <div className={className}>
      {groups.map((group) => (
        <React.Fragment key={group.part}>
          <BlockHeader kind={group.part} name={null} span={null} />
          <ol>
            {group.items.map((item) => {
              const index = flatIndex.get(item.id) ?? 0;
              const doneAt = done.get(item.id);

              return (
                <React.Fragment key={item.id}>
                  {lineAfter === -1 && index === 0 ? lineSlot : null}
                  <ItemRow
                    item={{
                      ...item,
                      state: deriveState(item, now, doneAt),
                      doneAt: doneAt ?? null,
                    }}
                    timeZone={timeZone}
                    onToggleDone={toggle}
                    undo={
                      recent.has(item.id)
                        ? { label: UNDO_LABEL, onUndo: () => undo(item) }
                        : undefined
                    }
                  />
                  {lineAfter === index ? lineSlot : null}
                </React.Fragment>
              );
            })}
          </ol>
        </React.Fragment>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------- pillar two --- */

/**
 * Two rows with no clock: one done inside its window, one done hours late and
 * marked *moved*, its planned time still on the row in violet. Untick either
 * and it reads `passed` — faded, silent, still live (official spec §2.4:
 * faded is not disabled).
 */
export function MovedRows({ className }: { className?: string }) {
  const rows = React.useMemo(() => buildMovedRows(), []);
  const [done, setDone] = React.useState<ReadonlyMap<string, Date>>(
    () => new Map(rows.map((row) => [row.id, row.doneAt ?? new Date(0)])),
  );
  const { recent, mark, forget } = useUndoFlags();

  const toggle = React.useCallback(
    (item: DayItemView) => {
      setDone((previous) =>
        flip(previous, item.id, item.doneAt ?? new Date(0)),
      );
      mark(item.id);
    },
    [mark],
  );

  const undo = React.useCallback(
    (item: DayItemView) => {
      setDone((previous) =>
        flip(previous, item.id, item.doneAt ?? new Date(0)),
      );
      forget(item.id);
    },
    [forget],
  );

  return (
    <ol className={className}>
      {rows.map((row) => (
        <ItemRow
          key={row.id}
          item={{
            ...row,
            state: done.has(row.id) ? row.state : "passed",
            doneAt: done.has(row.id) ? row.doneAt : null,
          }}
          timeZone={STATIC_TIME_ZONE}
          onToggleDone={toggle}
          undo={
            recent.has(row.id)
              ? { label: UNDO_LABEL, onUndo: () => undo(row) }
              : undefined
          }
        />
      ))}
    </ol>
  );
}
