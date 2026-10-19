import { describe, expect, it } from "vitest";
import { suggestIcons } from "./icon-suggest";

const ENTRIES = [
  { id: "book", keywords: ["book", "read", "library"] },
  { id: "runner", keywords: ["running", "sport", "marathon"] },
  { id: "lotus", keywords: ["meditation", "yoga", "zen"] },
  { id: "pen", keywords: ["write", "writing"] },
  { id: "glasses", keywords: ["reading", "eyes"] },
  { id: "bike", keywords: ["cycle", "sport"] },
  { id: "ball", keywords: ["sport", "game"] },
  { id: "medal", keywords: ["sport", "win"] },
  { id: "whistle", keywords: ["sport", "referee"] },
];

describe("C4: suggestIcons", () => {
  it("returns none for an empty name, or one with no words", () => {
    expect(suggestIcons("", ENTRIES)).toEqual([]);
    expect(suggestIcons("   ", ENTRIES)).toEqual([]);
    expect(suggestIcons("— ·", ENTRIES)).toEqual([]);
  });

  it("matches a name's words against each entry's keywords", () => {
    expect(suggestIcons("Meditate", ENTRIES)).toEqual(["lotus"]);
    expect(suggestIcons("Go running", ENTRIES)).toEqual(["runner"]);
  });

  it("puts the best match first", () => {
    // "read" equals a keyword of book; it only begins glasses' "reading".
    expect(suggestIcons("Read", ENTRIES)).toEqual(["book", "glasses"]);
    // Two words that both hit book outrank one that hits glasses.
    expect(suggestIcons("Read a library book", ENTRIES)[0]).toBe("book");
  });

  it("keeps the set's own order between equal matches", () => {
    expect(suggestIcons("Sport", ENTRIES)).toEqual([
      "runner",
      "bike",
      "ball",
      "medal",
      "whistle",
    ]);
  });

  it("returns at most five, or the limit given", () => {
    const many = Array.from({ length: 12 }, (_, n) => ({
      id: `e${n}`,
      keywords: ["walk"],
    }));
    expect(suggestIcons("Walk", many)).toHaveLength(5);
    expect(suggestIcons("Walk", many, 3)).toEqual(["e0", "e1", "e2"]);
  });

  it("ignores case, punctuation and words under three letters", () => {
    expect(suggestIcons("READ!", ENTRIES)).toEqual(["book", "glasses"]);
    expect(suggestIcons("go to", ENTRIES)).toEqual([]);
  });
});
