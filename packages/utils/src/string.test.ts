import { describe, expect, it } from "vitest";
import {
  firstNonEmpty,
  getInitials,
  normalizeEmailInput,
  pluralize,
  slugify,
  truncate,
  withTrailingGap,
} from "./string";

describe("normalizeEmailInput", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmailInput("  Sample.Person@Example.TEST ")).toBe(
      "sample.person@example.test",
    );
  });
});

describe("firstNonEmpty", () => {
  it("returns the first value with text after trimming", () => {
    expect(firstNonEmpty(undefined, "   ", " Morning walk ", "Later")).toBe(
      "Morning walk",
    );
  });

  it("returns an empty string when nothing qualifies", () => {
    expect(firstNonEmpty(undefined, "", "  ")).toBe("");
  });
});

describe("truncate", () => {
  it("leaves a string that fits unchanged", () => {
    expect(truncate("Stretch", 7)).toBe("Stretch");
  });

  it("never exceeds max, counting the ellipsis", () => {
    const result = truncate("Read two chapters", 8);
    expect(result).toBe("Read tw…");
    expect(result.length).toBeLessThanOrEqual(8);
  });

  it("drops trailing space before the ellipsis", () => {
    expect(truncate("Read two chapters", 6)).toBe("Read…");
  });

  it("handles the degenerate widths", () => {
    expect(truncate("Stretch", 1)).toBe("…");
    expect(truncate("Stretch", 0)).toBe("");
  });
});

describe("pluralize", () => {
  it("uses the singular only for exactly one", () => {
    expect(pluralize(1, "item")).toBe("item");
    expect(pluralize(0, "item")).toBe("items");
    expect(pluralize(3, "item")).toBe("items");
  });

  it("takes an irregular plural", () => {
    expect(pluralize(2, "child", "children")).toBe("children");
  });
});

describe("withTrailingGap", () => {
  it("ends with exactly one space", () => {
    expect(withTrailingGap("Sam   ")).toBe("Sam ");
  });

  it("uses an en space when asked", () => {
    expect(withTrailingGap("Sam", { enSpace: true })).toBe("Sam ");
  });
});

describe("getInitials", () => {
  it("takes the first and last word", () => {
    expect(getInitials("Sam Lee Rivera")).toBe("SR");
  });

  it("takes leading letters of a single word", () => {
    expect(getInitials("sam")).toBe("SA");
    expect(getInitials("sam", 1)).toBe("S");
  });

  it("returns an empty string for a blank name", () => {
    expect(getInitials("   ")).toBe("");
  });
});

describe("slugify", () => {
  it("joins words with underscores", () => {
    expect(slugify("Earlier thing ran long")).toBe("earlier_thing_ran_long");
  });

  it("folds accents rather than dropping them", () => {
    expect(slugify("Café run")).toBe("cafe_run");
  });

  it("collapses runs and trims the ends", () => {
    expect(slugify("  --Came up!! -- ")).toBe("came_up");
  });

  it("never ends on a separator after cutting to length", () => {
    expect(slugify("ab cd", 3)).toBe("ab");
  });

  it("can return an empty string for a label with nothing to keep", () => {
    expect(slugify("+++")).toBe("");
  });
});
