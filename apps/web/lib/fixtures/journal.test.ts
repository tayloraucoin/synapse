import { DEFAULT_JOURNAL_PROMPTS } from "@syn/constants";
import { lastNightEntries } from "@syn/utils";
import { describe, expect, it } from "vitest";
import { resolveScenario } from "./scenarios";
import { BASE_DATE } from "./scenarios/base-day";
import { createFixtureServer, FixtureOfflineError } from "./server";

/** A server on a Close the day scenario at its own clock. */
function setup(name = "close-journal") {
  const scenario = resolveScenario(name);
  return createFixtureServer(scenario, () => new Date(scenario.now));
}

describe("C3: a journal save writes only its key", () => {
  it("leaves every other answer as it was", async () => {
    const server = setup();
    const before = (await server.readJournal(BASE_DATE)).entry?.answers ?? {};
    expect(Object.keys(before)).toHaveLength(5);

    await server.writeJournalAnswer({
      date: BASE_DATE,
      key: "visualisation",
      value: "A slow start and the hard part done early.",
    });
    await server.writeJournalAnswer({
      date: BASE_DATE,
      key: "day_went",
      value: "Better than it started.",
    });

    const after = (await server.readJournal(BASE_DATE)).entry?.answers ?? {};
    expect(after).toEqual({
      ...before,
      visualisation: "A slow start and the hard part done early.",
      day_went: "Better than it started.",
    });
  });

  it("starts the date's entry on the first save of an empty night", async () => {
    const server = setup("close-empty");
    expect((await server.readJournal(BASE_DATE)).entry).toBeNull();
    const entry = await server.writeJournalAnswer({
      date: BASE_DATE,
      key: "gratitude_today",
      value: "The light at six.",
    });
    expect(entry).toEqual({
      onDate: BASE_DATE,
      answers: { gratitude_today: "The light at six." },
    });
  });

  it("reads the default prompts in order when none are set", async () => {
    const { prompts } = await setup().readJournal(BASE_DATE);
    expect(prompts.map((prompt) => prompt.label)).toEqual(
      DEFAULT_JOURNAL_PROMPTS.map((prompt) => prompt.label),
    );
  });

  it("waits offline and goes through once reconnected", async () => {
    const server = setup("close-offline");
    const write = {
      date: BASE_DATE,
      key: "visualisation",
      value: "Up early.",
    };
    await expect(server.writeJournalAnswer(write)).rejects.toBeInstanceOf(
      FixtureOfflineError,
    );
    server.reconnect();
    await server.writeJournalAnswer(write);
    expect(
      (await server.readJournal(BASE_DATE)).entry?.answers.visualisation,
    ).toBe("Up early.");
  });
});

describe("C3: Monday's lines are Tuesday's last night", () => {
  it("reads back through readMorning on the next date", async () => {
    const server = setup();
    await server.writeJournalAnswer({
      date: BASE_DATE,
      key: "visualisation",
      value: "A long walk before the desk.",
    });

    const morning = await server.readMorning("2026-10-13");
    expect(morning.lastNight?.onDate).toBe(BASE_DATE);
    expect(morning.lastNight?.answers.visualisation).toBe(
      "A long walk before the desk.",
    );
    expect(
      lastNightEntries(morning.lastNight, morning.prompts).map(
        (entry) => entry.text,
      ),
    ).toEqual([
      "Ship the Paper handoff. [placeholder]",
      "A long walk before the desk.",
      "Training at the Y. [placeholder]",
    ]);
  });
});
