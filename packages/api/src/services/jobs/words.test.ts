import { describe, expect, it } from "vitest";
import type { BuiltPayload } from "../notifications/build-payload";
import { dueBlockStarts, sendBlockStarts } from "./block-starts";
import { memoryPush } from "./push-fakes.fixture";
import { pushWindow } from "./push-window";
import { dueTodoReminders, sendTodoReminders } from "./todo-reminders";

/**
 * USE-105 C4: every payload the two jobs build passes the product rules'
 * words (apps/web/docs/product-rules.md, "A notification is a scheduled fact
 * in the person's own words"): no number about the day, no miss, no second
 * person, no streak or percentage. The only number is the time.
 */

const ZONE = "Europe/London";
const NOW = new Date("2026-10-19T08:02:00Z"); // 09:02 BST
const RULE = "DTSTART;VALUE=DATE:20261001\nRRULE:FREQ=DAILY";

const RULES: Array<[string, RegExp]> = [
  ["second person", /\b(you|your|yours|you're|yourself)\b/i],
  [
    "a miss",
    /\b(miss|missed|overdue|late|behind|forgot|forgotten|skipped|failed|didn't|haven't|still)\b/i,
  ],
  ["a streak or score", /\b(streak|score|%|percent|in a row)\b/i],
];

/** Times out; what is left may hold no digit. */
const withoutClock = (text: string) =>
  text.replace(/\b\d{1,2}:\d{2}(\s?[AP]M)?/gi, "");

function check(payload: BuiltPayload): string[] {
  const words = [payload.title, payload.body ?? ""].join(" ");
  const broken = RULES.filter(([, rule]) => rule.test(words)).map(
    ([name]) => name,
  );
  if (/\d/.test(withoutClock(words))) broken.push("a number about the day");
  return broken;
}

async function payloads(): Promise<BuiltPayload[]> {
  const window = pushWindow(NOW);
  const push = memoryPush();
  await sendTodoReminders(
    dueTodoReminders({
      todos: [
        {
          id: "a",
          title: "Water the plants",
          onDate: null,
          rrule: RULE,
          remindAt: "09:00",
          remindOn: null,
          doneAt: null,
          archivedAt: null,
        },
      ],
      doneSlots: [],
      timeZone: ZONE,
      window,
    }),
    ZONE,
    push,
  );
  const block = {
    startsAt: "09:00",
    endsAt: "10:00",
    rrule: RULE,
    onDate: null,
    archivedAt: null,
    notify: true,
  };
  await sendBlockStarts(
    dueBlockStarts({
      blocks: [{ ...block, id: "b", name: "Deep work" }],
      changes: [],
      slots: [],
      slotsWithEvents: new Set(),
      timeZone: ZONE,
      window,
    }),
    ZONE,
    push,
  );
  await sendBlockStarts(
    dueBlockStarts({
      blocks: [
        { ...block, id: "c", name: "Walk" },
        { ...block, id: "d", name: "Breakfast" },
      ],
      changes: [],
      slots: [],
      slotsWithEvents: new Set(),
      timeZone: ZONE,
      window,
    }),
    ZONE,
    push,
  );
  return push.sent.map((s) => s.payload);
}

describe("the jobs' words (C-USE-105-4)", () => {
  it("builds a payload for each kind", async () => {
    expect(await payloads()).toHaveLength(3);
  });

  it("the check catches what it is for", () => {
    const bad = (title: string) => check({ title, url: "/", ttlSeconds: 1 });
    expect(bad("You missed Walk · 9:00")).toEqual(["second person", "a miss"]);
    expect(bad("3 to-dos left · 9:00")).toEqual(["a number about the day"]);
    expect(bad("Walk · 9:00 AM")).toEqual([]);
  });

  it("every payload passes", async () => {
    for (const payload of await payloads()) {
      expect(check(payload), payload.title).toEqual([]);
    }
  });
});
