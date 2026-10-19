import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { addDays } from "@syn/utils";
import { REVIEW_LATE_COPY } from "@/app/(shell)/today/review/_components/late-copy";
import {
  leaveCard,
  PassedRow,
} from "@/app/(shell)/today/review/_components/passed-row";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { BASE_DATE } from "@/lib/fixtures/scenarios/base-day";
import { NOW_IDS, onNowDay } from "@/lib/fixtures/scenarios/now-day";
import { createFixtureServer } from "@/lib/fixtures/server";
import { deriveToday } from "./derive-today";
import { writeDayMoveLater } from "./use-day-edits";
import { undoItemWrite } from "./use-item-sheet";
import { deriveReviewDay, type ReviewDayView } from "./use-review-day";

/**
 * Review the day after a late wake (USE-38) against the fixture server: the
 * layout from the wake is derived on read, Move later writes today only
 * with an exact Undo, and Leave writes nothing.
 */

const NEXT_MONDAY = addDays(BASE_DATE, 7);
const WELLNESS = NOW_IDS.blocks.wellness;

function setup(name = "review-late") {
  const server = createFixtureServer(
    resolveScenario(name),
    () => new Date(Date.parse(onNowDay("08:10"))),
  );
  const today = () => server.readToday(BASE_DATE);
  return {
    server,
    today,
    view: async () => deriveReviewDay(deriveToday(await today())),
    usual: async () =>
      deriveReviewDay(deriveToday(await server.readToday(NEXT_MONDAY))),
  };
}

/** The column's blocks as "<name> HH:MM-HH:MM", in order. */
const column = (view: ReviewDayView) =>
  view.blocks.map((block) => `${block.name} ${block.startsAt}-${block.endsAt}`);

/** Words a late wake never uses ("Move later" is a place, not a verdict). */
const VERDICT = /\b(late|missed|behind|skipped|overdue)\b/i;

describe("C1: the day laid out from a wake at 8:10, derived on read", () => {
  it("starts the column at 8 with Orient at 8:10; Training 8:15 to 8:57 keeps its end; Wellness folds", async () => {
    const s = setup();
    const view = await s.view();
    expect(view.startMin).toBe(8 * 60);
    expect(view.orient).toEqual({ atMin: 8 * 60 + 10, lengthMin: 5 });
    expect(column(view)).toEqual([
      "Training 08:15-08:57",
      "Breakfast 09:00-09:30",
      "Work 09:30-12:00",
      "Lunch 12:00-13:00",
      "Work 13:00-15:00",
    ]);
    expect(view.late).toEqual({
      wokeAt: "08:10",
      passed: [
        {
          id: WELLNESS,
          kind: "wellness",
          name: "Wellness",
          startsAt: "07:05",
          endsAt: "08:00",
        },
      ],
    });
  });

  it("stores nothing: the date has no block change, and an on-time wake reads as planned", async () => {
    const s = setup();
    const records = await s.today();
    expect(records.blockChanges.filter((c) => c.onDate === BASE_DATE)).toEqual(
      [],
    );
    const onTime = await setup("review-success").view();
    expect(onTime.late).toBeNull();
    expect(onTime.orient?.atMin).toBe(7 * 60);
    expect(column(onTime)[0]).toBe("Wellness 07:05-08:00");
  });

  it('words the row "Planned before 8:10 · Wellness", several joined, and never a verdict', () => {
    expect(REVIEW_LATE_COPY.passed("08:10", ["Wellness"])).toBe(
      "Planned before 8:10 · Wellness",
    );
    expect(REVIEW_LATE_COPY.passed("08:10", ["Wellness", "Training"])).toBe(
      "Planned before 8:10 · Wellness, Training",
    );
    for (const words of [
      REVIEW_LATE_COPY.passed("08:10", ["Wellness"]),
      REVIEW_LATE_COPY.moveLater,
      REVIEW_LATE_COPY.leave,
      REVIEW_LATE_COPY.movedLater("Wellness", "08:15"),
    ]) {
      expect(words).not.toMatch(VERDICT);
    }
  });
});

describe("C2: the row opened draws a card per passed block", () => {
  it('"Wellness" over "7:05 to 8:00" with its leaf edge, Move later and Leave; nothing grey or red', async () => {
    const view = await setup("review-late-passed-open").view();
    const html = renderToStaticMarkup(
      createElement(PassedRow, {
        wokeAt: view.late!.wokeAt,
        passed: view.late!.passed,
        onMoveLater: () => {},
        defaultOpen: true,
      }),
    );
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain("Planned before 8:10 · Wellness");
    expect(html).toContain("7:05 to 8:00");
    expect(html).toContain("bg-category-leaf-dot");
    expect(html).toContain(">Move later<");
    expect(html).toContain(">Leave<");
    expect(html).toContain('aria-label="Move Wellness later"');
    expect(html.replaceAll("disabled:opacity-50", "")).not.toMatch(
      /destructive|danger|opacity-|grayscale/,
    );
    expect(html.replace(/<[^>]+>/g, " ")).not.toMatch(VERDICT);
  });
});

describe("C3: Move later and Leave", () => {
  it("puts Wellness right after Orient at 8:15, slides the later blocks by its 55 min, today only; Undo restores the day", async () => {
    const s = setup();
    const before = await s.today();
    const usual = await s.usual();

    const written = await writeDayMoveLater(s.server, before, WELLNESS);
    expect(written.movedLater).toEqual({
      block: "Wellness",
      startsAt: "08:15",
    });
    const after = await s.view();
    expect(column(after)).toEqual([
      "Wellness 08:15-09:10",
      "Training 09:10-09:52",
      "Breakfast 09:55-10:25",
      "Work 10:25-12:55",
      "Lunch 12:55-13:55",
      "Work 13:55-15:55",
    ]);
    // Nothing is passed any more, so the row goes.
    expect(after.late?.passed).toEqual([]);
    expect(await s.usual()).toEqual(usual);

    await undoItemWrite(s.server, written.undo);
    expect(await s.today()).toEqual(before);
    expect(column(await s.view())[0]).toBe("Training 08:15-08:57");
  });

  it("Leave takes the card off the row's own state only; the last one left folds the row", async () => {
    const s = setup();
    const before = await s.today();
    const { passed } = (await s.view()).late!;
    const two = [...passed, { ...passed[0]!, id: "other", name: "Stretch" }];

    const first = leaveCard({ left: new Set(), passed: two }, WELLNESS);
    expect([...first.left]).toEqual([WELLNESS]);
    expect(first.open).toBe(true);
    expect(leaveCard({ ...first, passed: two }, "other").open).toBe(false);
    // The block stays folded and nothing is written.
    expect(await s.today()).toEqual(before);
    expect((await s.view()).late?.passed.map((block) => block.name)).toEqual([
      "Wellness",
    ]);
  });
});
