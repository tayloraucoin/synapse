import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NOW_COPY as COPY } from "@/app/(shell)/today/_components/now/copy";
import { LiftedCard } from "@/components/planner/lifted-card";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { onNowDay } from "@/lib/fixtures/scenarios/now-day";
import { createFixtureServer } from "@/lib/fixtures/server";
import { deriveToday } from "./derive-today";
import { deriveNow } from "./use-now";

/**
 * Readied before the first block (USE-110; ready-go/states/not-yet-started.md):
 * at 6:58 Now holds Wellness with its card's dot hollow and the quiet line;
 * at 7:05 the dot fills and the line leaves (C-USE-ready-go-not-yet-started-2).
 */
const SCENARIO = "ready-go-not-yet-started";

async function viewAt(time: string) {
  const scenario = resolveScenario(SCENARIO);
  const now = new Date(Date.parse(onNowDay(time)));
  const server = createFixtureServer(scenario, () => now);
  const records = await server.readToday(scenario.now.slice(0, 10));
  return deriveNow(deriveToday(records), now, null);
}

function dotOf(early: boolean) {
  const html = renderToStaticMarkup(
    React.createElement(LiftedCard, {
      title: "Pee and weigh",
      icon: null,
      hue: "leaf",
      meta: "2 min · 7:05",
      early,
      label: "Pee and weigh, now",
      start: { label: "Start", onPress: () => {} },
      done: { label: "Done", name: "Done, Pee and weigh", onPress: () => {} },
    }),
  );
  return /data-dot="(\w+)"/.exec(html)?.[1];
}

describe("C1: readied at 6:58, before Wellness at 7:05", () => {
  it("is live on Wellness, not yet started, Pee and weigh lifted", async () => {
    const view = await viewAt("06:58");
    expect(view.phase).toBe("live");
    expect(view.block).toMatchObject({
      name: "Wellness",
      startsAt: "07:05",
      notYetStarted: true,
      behindSince: null,
    });
    expect(view.current?.title).toBe("Pee and weigh");
  });

  it("reads the quiet line, which reports nothing late", () => {
    const line = COPY.startsAt("07:05");
    expect(line).toBe("Starts at 7:05. Anything can be done early.");
    expect(line).not.toMatch(/late|behind|missed/i);
  });

  it("draws the card's dot hollow while early", () => {
    expect(dotOf(true)).toBe("hollow");
  });
});

describe("C5: the block's time arrives", () => {
  it("at 7:05 the block has started: the dot fills verdigris", async () => {
    const view = await viewAt("07:05");
    expect(view.block).toMatchObject({
      name: "Wellness",
      notYetStarted: false,
    });
    expect(dotOf(false)).toBe("filled");
  });
});
