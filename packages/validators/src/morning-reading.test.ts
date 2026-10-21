import { describe, expect, it } from "vitest";
import { linkFormSchema } from "./link";
import {
  readingListRecord,
  reorderReadingInput,
  turnOnInput,
} from "./morning-reading";
import { passageFormSchema } from "./passage";

/** USE-150 C7: the forms carry the approved words (words-and-access.md). */

const LINK_LINE =
  "That doesn’t open as a link. Paste the address from the browser or from Spotify’s Share.";

function messageOf(result: {
  success: boolean;
  error?: { issues: { message: string }[] };
}) {
  expect(result.success).toBe(false);
  return result.error!.issues[0]!.message;
}

describe("C7: the morning reading's words", () => {
  it.each([
    "http://example.org",
    "javascript:alert(1)",
    "example.org",
    "spotify:",
  ])("a link that cannot open (%s) gives the link line", (url) => {
    expect(
      messageOf(linkFormSchema.safeParse({ title: "Morning calm", url })),
    ).toBe(LINK_LINE);
  });

  it("a link past 2,048 characters gives the link line", () => {
    const url = `https://example.org/${"a".repeat(2048)}`;
    expect(
      messageOf(linkFormSchema.safeParse({ title: "Morning calm", url })),
    ).toBe(LINK_LINE);
  });

  it("an https: and a spotify: link pass", () => {
    expect(
      linkFormSchema.safeParse({ title: "A", url: "https://example.org" })
        .success,
    ).toBe(true);
    expect(
      linkFormSchema.safeParse({ title: "A", url: "spotify:playlist:abc" })
        .success,
    ).toBe(true);
  });

  it("a title past 80 gives the title limit line, on both forms", () => {
    const title = "t".repeat(81);
    expect(
      messageOf(
        linkFormSchema.safeParse({ title, url: "https://example.org" }),
      ),
    ).toBe("Titles stop at 80 characters.");
    expect(
      messageOf(passageFormSchema.safeParse({ title, bodyMd: "Words." })),
    ).toBe("Titles stop at 80 characters.");
  });

  it("a passage past 8,000 gives the passage limit line", () => {
    const bodyMd = "w".repeat(8001);
    expect(
      messageOf(passageFormSchema.safeParse({ title: null, bodyMd })),
    ).toBe("A passage stops at 8,000 characters.");
  });

  it("an empty title on a passage is stored as none", () => {
    expect(
      passageFormSchema.parse({ title: "", bodyMd: "Words." }).title,
    ).toBeNull();
  });
});

describe("the reading inputs", () => {
  it("reorder needs a kind and at least one id", () => {
    expect(
      reorderReadingInput.safeParse({ kind: "passage", ids: [] }).success,
    ).toBe(false);
    expect(
      reorderReadingInput.safeParse({
        kind: "quote",
        ids: [crypto.randomUUID()],
      }).success,
    ).toBe(false);
  });

  it("turn on's restore is optional", () => {
    expect(
      turnOnInput.parse({ kind: "link", id: crypto.randomUUID() }).restore,
    ).toBeUndefined();
  });

  it("an off row carries its archivedAt", () => {
    const result = readingListRecord.safeParse({
      passages: [],
      passagesOff: [
        {
          id: crypto.randomUUID(),
          createdAt: "2026-10-20T07:00:00.000Z",
          updatedAt: "2026-10-20T07:00:00.000Z",
          title: null,
          bodyMd: "Words.",
          images: [],
          sortOrder: 0,
        },
      ],
      links: [],
      linksOff: [],
    });
    expect(result.success).toBe(false);
  });
});
