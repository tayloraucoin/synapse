import { describe, expect, it } from "vitest";
import type { SlotEventKind } from "@syn/types";
import { dayWindow } from "../day";
import { clockAt, deriveClock, type ClockEvent, type DayClock } from "./clock";

const WINDOW = dayWindow("2026-10-13", "America/Toronto", "03:00");
const MIN = 60_000;

/** An instant `minutes` after the day opens. */
function t(minutes: number): string {
  return new Date(WINDOW.start.getTime() + minutes * MIN).toISOString();
}

let counter = 0;
function ev(
  slotId: string,
  kind: SlotEventKind,
  minutes: number,
  extra: Partial<ClockEvent> = {},
): ClockEvent {
  counter += 1;
  return {
    slotId,
    kind,
    at: t(minutes),
    receivedAt: t(minutes),
    clientEventId: `evt-${String(counter).padStart(5, "0")}`,
    stepAwayId: null,
    ...extra,
  };
}

const NONE: ReadonlySet<string> = new Set();

function derive(events: ClockEvent[], work: ReadonlySet<string> = NONE) {
  return deriveClock(events, { dayWindow: WINDOW, workSlotIds: work });
}

function minutesOf(clock: DayClock, slotId: string, atMinutes = 24 * 60) {
  const slot = clock.slots.get(slotId)!;
  const { workMs, firingMs } = clockAt(
    slot,
    new Date(t(atMinutes)),
    WINDOW.end,
  );
  return { work: workMs / MIN, firing: firingMs / MIN };
}

describe("C1: work and firing spans", () => {
  it("sums work from started or resumed to paused, prompt_sent, done or day_closed", () => {
    const clock = derive([
      ev("a", "started", 10),
      ev("a", "paused", 20),
      ev("a", "resumed", 30),
      ev("a", "prompt_sent", 35),
      ev("b", "started", 40),
      ev("b", "done", 55),
      ev("c", "started", 60),
      ev("c", "day_closed", 90),
    ]);
    expect(minutesOf(clock, "a").work).toBe(15);
    expect(minutesOf(clock, "b").work).toBe(15);
    expect(minutesOf(clock, "c").work).toBe(30);
  });

  it("runs firing from prompt_sent to brought_back, done or day_closed, never as work", () => {
    const clock = derive([
      ev("a", "started", 0),
      ev("a", "prompt_sent", 10),
      ev("a", "brought_back", 42),
      ev("b", "started", 0),
      ev("b", "prompt_sent", 5),
      ev("b", "done", 25),
      ev("c", "prompt_sent", 50),
      ev("c", "day_closed", 80),
    ]);
    expect(minutesOf(clock, "a")).toEqual({ work: 10, firing: 32 });
    expect(minutesOf(clock, "b")).toEqual({ work: 5, firing: 20 });
    expect(minutesOf(clock, "c")).toEqual({ work: 0, firing: 30 });
  });

  it("never opens a work span on brought_back", () => {
    const clock = derive([
      ev("a", "started", 0),
      ev("a", "prompt_sent", 10),
      ev("a", "brought_back", 20),
    ]);
    const slot = clock.slots.get("a")!;
    expect(slot.work).toHaveLength(1);
    expect(slot.state).toBe("paused");
    expect(minutesOf(clock, "a", 120)).toEqual({ work: 10, firing: 10 });
  });

  it("counts an open work span to now", () => {
    const clock = derive([ev("a", "started", 10)]);
    const slot = clock.slots.get("a")!;
    expect(slot.state).toBe("running");
    expect(clockAt(slot, new Date(t(25)), WINDOW.end)).toEqual({
      workMs: 15 * MIN,
      firingMs: 0,
      running: true,
      firing: false,
    });
  });

  it("starting a firing slot ends its firing and opens work", () => {
    const clock = derive([
      ev("a", "prompt_sent", 0),
      ev("a", "started", 12),
      ev("a", "paused", 20),
    ]);
    expect(minutesOf(clock, "a")).toEqual({ work: 8, firing: 12 });
  });
});

describe("C2: one in hand inside a Work block", () => {
  it("a started or resumed closes any other open work span at its own at", () => {
    const work = new Set(["a", "b"]);
    const clock = derive(
      [ev("a", "started", 0), ev("b", "started", 10), ev("a", "resumed", 25)],
      work,
    );
    expect(clock.slots.get("a")!.work.map((s) => s.end?.toISOString())).toEqual(
      [t(10), undefined],
    );
    expect(clock.slots.get("b")!.work[0]!.end!.toISOString()).toBe(t(25));
    expect(clock.slots.get("b")!.state).toBe("paused");
    expect(minutesOf(clock, "b").work).toBe(15);
  });

  it("leaves a firing slot firing when another starts", () => {
    const clock = derive(
      [ev("a", "started", 0), ev("a", "prompt_sent", 5), ev("b", "started", 6)],
      new Set(["a", "b"]),
    );
    expect(clock.slots.get("a")!.state).toBe("firing");
    expect(minutesOf(clock, "a", 30).firing).toBe(25);
  });

  it("outside a Work block several slots run at once", () => {
    const clock = derive([
      ev("x", "started", 0),
      ev("y", "started", 5),
      ev("z", "started", 7),
    ]);
    for (const id of ["x", "y", "z"])
      expect(clock.slots.get(id)!.state).toBe("running");
    expect(minutesOf(clock, "x", 20).work).toBe(20);
  });

  it("a slot outside the block never closes one inside it", () => {
    const clock = derive(
      [ev("a", "started", 0), ev("x", "started", 5)],
      new Set(["a"]),
    );
    expect(clock.slots.get("a")!.state).toBe("running");
  });
});

/* ---- C3: seeded generated days ---- */

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

const KINDS: SlotEventKind[] = [
  "started",
  "paused",
  "resumed",
  "prompt_sent",
  "brought_back",
  "done",
  "undone",
  "day_closed",
];

interface GeneratedDay {
  events: ClockEvent[];
  workSlotIds: Set<string>;
}

function generateDay(seed: number): GeneratedDay {
  const rand = mulberry32(seed);
  const pick = <T>(list: T[]): T => list[Math.floor(rand() * list.length)]!;
  const slotIds = ["s1", "s2", "s3", "s4", "s5"].slice(
    0,
    2 + Math.floor(rand() * 4),
  );
  const workSlotIds = new Set(slotIds.filter(() => rand() < 0.6));
  const events: ClockEvent[] = [];
  const count = 5 + Math.floor(rand() * 40);
  for (let i = 0; i < count; i++) {
    // Coarse minutes so ties on `at` are common; a few fall outside the day.
    const minutes = Math.floor(rand() * 200) * 7 - 30;
    const at = new Date(WINDOW.start.getTime() + minutes * MIN);
    const received = new Date(at.getTime() + Math.floor(rand() * 4) * MIN);
    events.push({
      slotId: pick(slotIds),
      kind: pick(KINDS),
      at: at.toISOString(),
      receivedAt: received.toISOString(),
      clientEventId: `${seed}-${i}`,
      stepAwayId: rand() < 0.2 ? pick(["sa-1", "sa-2"]) : null,
    });
  }
  return { events, workSlotIds };
}

function shuffled<T>(list: T[], rand: () => number): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** The same event replayed later: a duplicate `clientEventId`, later `receivedAt`. */
function replayOf(event: ClockEvent, rand: () => number): ClockEvent {
  const later =
    Date.parse(event.receivedAt) + (1 + Math.floor(rand() * 600)) * MIN;
  return { ...event, receivedAt: new Date(later).toISOString() };
}

function withReplays(events: ClockEvent[], rand: () => number): ClockEvent[] {
  return [
    ...events,
    ...events.filter(() => rand() < 0.3).map((e) => replayOf(e, rand)),
  ];
}

function serialize(clock: DayClock): string {
  return JSON.stringify({ slots: [...clock.slots], stepAway: clock.stepAway });
}

function overlaps(
  a: { start: Date; end: Date | null },
  b: { start: Date; end: Date | null },
): boolean {
  const end = (span: { end: Date | null }) =>
    span.end?.getTime() ?? WINDOW.end.getTime();
  return a.start.getTime() < end(b) && b.start.getTime() < end(a);
}

const RUNS = 600;

function forEachSeed(check: (seed: number, day: GeneratedDay) => void): void {
  for (let seed = 1; seed <= RUNS; seed++) check(seed, generateDay(seed));
}

describe("C3: seeded generated days", () => {
  it(`gives the same clock shuffled and duplicated (${RUNS} seeds)`, () => {
    forEachSeed((seed, { events, workSlotIds }) => {
      const rand = mulberry32(seed ^ 0x9e3779b9);
      const base = serialize(
        deriveClock(events, { dayWindow: WINDOW, workSlotIds }),
      );
      const mixed = shuffled(withReplays(events, rand), rand);
      expect(
        serialize(deriveClock(mixed, { dayWindow: WINDOW, workSlotIds })),
        `seed ${seed}`,
      ).toBe(base);
    });
  });

  it(`gives the same clock split across two devices (${RUNS} seeds)`, () => {
    forEachSeed((seed, { events, workSlotIds }) => {
      const rand = mulberry32(seed ^ 0x85ebca6b);
      const phone = events.filter(() => rand() < 0.5);
      const desk = events.filter((e) => !phone.includes(e));
      const base = serialize(
        deriveClock(events, { dayWindow: WINDOW, workSlotIds }),
      );
      // Each device sends its own queue, replaying some of it, desk first.
      const arrived = [...withReplays(desk, rand), ...withReplays(phone, rand)];
      expect(
        serialize(deriveClock(arrived, { dayWindow: WINDOW, workSlotIds })),
        `seed ${seed}`,
      ).toBe(base);
    });
  });

  it(`never has two open work spans in one Work block (${RUNS} seeds)`, () => {
    forEachSeed((seed, { events, workSlotIds }) => {
      const clock = deriveClock(events, { dayWindow: WINDOW, workSlotIds });
      const spans = [...clock.slots]
        .filter(([id]) => workSlotIds.has(id))
        .flatMap(([id, slot]) => slot.work.map((span) => ({ id, span })));
      for (let i = 0; i < spans.length; i++)
        for (let j = i + 1; j < spans.length; j++)
          expect(
            overlaps(spans[i]!.span, spans[j]!.span),
            `seed ${seed}: ${spans[i]!.id} and ${spans[j]!.id}`,
          ).toBe(false);
      const running = [...clock.slots].filter(
        ([id, slot]) => workSlotIds.has(id) && slot.state === "running",
      );
      expect(running.length, `seed ${seed}`).toBeLessThanOrEqual(1);
    });
  });

  it(`never puts firing time inside work time (${RUNS} seeds)`, () => {
    forEachSeed((seed, { events, workSlotIds }) => {
      const clock = deriveClock(events, { dayWindow: WINDOW, workSlotIds });
      for (const [id, slot] of clock.slots)
        for (const work of slot.work)
          for (const firing of slot.firing)
            expect(overlaps(work, firing), `seed ${seed}: ${id}`).toBe(false);
    });
  });

  it("never throws on unparseable times", () => {
    const bad = { ...ev("a", "started", 0), at: "not a time" };
    expect(() => derive([bad, ev("a", "started", 5)])).not.toThrow();
    expect(derive([bad]).slots.size).toBe(0);
  });
});

describe("C4: done, undone and replays", () => {
  it("a done wins over a later paused", () => {
    const clock = derive([
      ev("a", "started", 0),
      ev("a", "done", 20),
      ev("a", "paused", 25),
      ev("a", "resumed", 30),
    ]);
    const slot = clock.slots.get("a")!;
    expect(slot.state).toBe("done");
    expect(slot.doneAt!.toISOString()).toBe(t(20));
    expect(minutesOf(clock, "a").work).toBe(20);
  });

  it("undone clears done without reopening a span", () => {
    const clock = derive([
      ev("a", "started", 0),
      ev("a", "done", 20),
      ev("a", "undone", 30),
    ]);
    const slot = clock.slots.get("a")!;
    expect(slot.doneAt).toBeNull();
    expect(slot.state).toBe("paused");
    expect(slot.work.every((span) => span.end !== null)).toBe(true);
    expect(minutesOf(clock, "a").work).toBe(20);
  });

  it("a repeated client_event_id is ignored, so a replay changes nothing", () => {
    const started = ev("a", "started", 0);
    const paused = ev("a", "paused", 10);
    const once = derive([started, paused]);
    const replayed = derive([
      started,
      paused,
      { ...started, receivedAt: t(300) },
      { ...paused, receivedAt: t(301) },
    ]);
    expect(serialize(replayed)).toBe(serialize(once));
  });
});

describe("C5: Step away", () => {
  const work = new Set(["w"]);

  it("pauses sharing a step_away_id read as one hold naming exactly those slots", () => {
    const clock = derive(
      [
        ev("w", "started", 0),
        ev("x", "started", 0),
        ev("y", "started", 0),
        ev("z", "started", 0),
        ev("z", "paused", 15),
        ev("w", "paused", 20, { stepAwayId: "sa-1" }),
        ev("x", "paused", 20, { stepAwayId: "sa-1" }),
      ],
      work,
    );
    expect(clock.stepAway).toEqual({
      id: "sa-1",
      at: new Date(t(20)),
      slotIds: ["w", "x"],
    });
    expect(clock.slots.get("y")!.state).toBe("running");
    expect(clock.slots.get("z")!.heldBy).toBeNull();
  });

  it("resumed events with that id release it", () => {
    const clock = derive([
      ev("x", "started", 0),
      ev("y", "started", 0),
      ev("x", "paused", 20, { stepAwayId: "sa-1" }),
      ev("y", "paused", 20, { stepAwayId: "sa-1" }),
      ev("x", "resumed", 40, { stepAwayId: "sa-1" }),
    ]);
    expect(clock.stepAway?.slotIds).toEqual(["y"]);
    const released = derive([
      ev("x", "started", 0),
      ev("x", "paused", 20, { stepAwayId: "sa-1" }),
      ev("x", "resumed", 40, { stepAwayId: "sa-1" }),
    ]);
    expect(released.stepAway).toBeNull();
    expect(minutesOf(released, "x", 50).work).toBe(30);
  });

  it("firing keeps counting through it", () => {
    const clock = derive([
      ev("f", "started", 0),
      ev("f", "prompt_sent", 5),
      ev("x", "started", 0),
      ev("x", "paused", 20, { stepAwayId: "sa-1" }),
      ev("x", "resumed", 50, { stepAwayId: "sa-1" }),
    ]);
    expect(clock.slots.get("f")!.state).toBe("firing");
    expect(minutesOf(clock, "f", 60).firing).toBe(55);
  });
});

describe("C6: the day window", () => {
  it("a span still open at the day's end stops counting there", () => {
    const clock = derive([
      ev("a", "started", 23 * 60),
      ev("b", "prompt_sent", 23 * 60),
    ]);
    const after = new Date(WINDOW.end.getTime() + 3 * 60 * MIN);
    const a = clockAt(clock.slots.get("a")!, after, WINDOW.end);
    const b = clockAt(clock.slots.get("b")!, after, WINDOW.end);
    expect(a).toEqual({
      workMs: 60 * MIN,
      firingMs: 0,
      running: false,
      firing: false,
    });
    expect(b).toEqual({
      workMs: 0,
      firingMs: 60 * MIN,
      running: false,
      firing: false,
    });
  });

  it("an event outside the window changes nothing", () => {
    const inside = [ev("a", "started", 0), ev("a", "paused", 30)];
    const before = { ...ev("a", "started", -10) };
    const atEnd = {
      ...ev("a", "resumed", 0),
      at: WINDOW.end.toISOString(),
      receivedAt: WINDOW.end.toISOString(),
    };
    expect(serialize(derive([before, ...inside, atEnd]))).toBe(
      serialize(derive(inside)),
    );
  });
});
