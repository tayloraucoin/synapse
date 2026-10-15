import { describe, expect, it } from "vitest";
import { DEFAULT_JOURNAL_PROMPTS } from "@syn/constants";
import { lastNightEntries } from "./last-night";

const ANSWERS = {
  day_went: "Long, and fine.",
  looking_forward: "Dinner, and the new book.",
  visualisation: "Quiet morning, a long focused stretch.",
  make_happen_tomorrow: "Ship the first Primary before lunch.",
};

describe("lastNightEntries (C-USE-orient-last-night-open-1, -4)", () => {
  it("reads the three read-back keys in order, nothing else", () => {
    const entries = lastNightEntries(
      { answers: ANSWERS },
      DEFAULT_JOURNAL_PROMPTS,
    );
    expect(entries.map((entry) => entry.key)).toEqual([
      "make_happen_tomorrow",
      "visualisation",
      "looking_forward",
    ]);
    expect(entries.map((entry) => entry.text)).toEqual([
      "Ship the first Primary before lunch.",
      "Quiet morning, a long focused stretch.",
      "Dinner, and the new book.",
    ]);
  });

  it("re-tenses only the first caption", () => {
    const captions = lastNightEntries(
      { answers: ANSWERS },
      DEFAULT_JOURNAL_PROMPTS,
    ).map((entry) => entry.caption);
    expect(captions).toEqual([
      "What I want to make happen today",
      "Tomorrow, as I see it",
      "Looking forward to",
    ]);
  });

  it("takes the person's own prompts, falling back to the defaults", () => {
    const captions = lastNightEntries({ answers: ANSWERS }, [
      { key: "make_happen_tomorrow", label: "Tomorrow I will" },
      { key: "looking_forward", label: "Glad about" },
    ]).map((entry) => entry.caption);
    expect(captions).toEqual([
      "Today I will",
      "Tomorrow, as I see it",
      "Glad about",
    ]);
  });

  it("leaves a renamed first prompt with no 'tomorrow' as written", () => {
    const [first] = lastNightEntries({ answers: ANSWERS }, [
      { key: "make_happen_tomorrow", label: "The one thing" },
    ]);
    expect(first?.caption).toBe("The one thing");
  });

  it("leaves out a key that is missing or blank", () => {
    const entries = lastNightEntries(
      {
        answers: {
          make_happen_tomorrow: "   ",
          looking_forward: "Dinner.",
        },
      },
      DEFAULT_JOURNAL_PROMPTS,
    );
    expect(entries).toEqual([
      { key: "looking_forward", caption: "Looking forward to", text: "Dinner." },
    ]);
  });

  it("reads nothing with no evening", () => {
    expect(lastNightEntries(null, DEFAULT_JOURNAL_PROMPTS)).toEqual([]);
  });
});
