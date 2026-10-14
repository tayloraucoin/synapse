import { describe, expect, it } from "vitest";
import { iconValueSchema } from "@syn/validators";
import { toIconValue } from "@/components/planner/icon-picker-step";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { createFixtureServer } from "@/lib/fixtures/server";
import { withRecent } from "@/lib/hooks/use-recent-picks";
import { savedColourActions } from "./use-saved-colours";

function server() {
  return createFixtureServer(
    resolveScenario("default"),
    () => new Date("2026-10-12T10:20:00-04:00"),
  );
}

describe("C5: a pick is stored as the record stores it", () => {
  it("an icon is its Lucide name and a colour, which iconValueSchema accepts", () => {
    const hex = toIconValue({
      kind: "lucide",
      value: "leaf",
      color: "#2F6F62",
    });
    expect(hex).toEqual({ kind: "lucide", value: "leaf", color: "#2f6f62" });
    expect(iconValueSchema.safeParse(hex).success).toBe(true);

    const kind = toIconValue({
      kind: "lucide",
      value: "book-open",
      color: "sky",
    });
    expect(kind).toEqual({ kind: "lucide", value: "book-open", color: "sky" });
  });

  it("an emoji is its character", () => {
    expect(toIconValue({ kind: "emoji", value: "🧘" })).toEqual({
      kind: "emoji",
      value: "🧘",
    });
  });

  it("refuses a pick that is not a Lucide name or a colour", () => {
    expect(() =>
      toIconValue({ kind: "lucide", value: "<svg/>", color: "#2f6f62" }),
    ).toThrow();
    expect(() =>
      toIconValue({ kind: "lucide", value: "leaf", color: "#2f6g6" }),
    ).toThrow();
  });

  it("Recent keeps the last eight, newest first, without repeats", () => {
    const list = ["a", "b", "c", "d", "e", "f", "g", "h"];
    expect(withRecent(list, "c")).toEqual([
      "c",
      "a",
      "b",
      "d",
      "e",
      "f",
      "g",
      "h",
    ]);
    expect(withRecent(list, "z")).toEqual([
      "z",
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
    ]);
  });
});

describe("C5: saved colours land in the fixture server", () => {
  it("reads the default scenario's four, newest first", async () => {
    const rows = await server().listSavedColours();
    expect(rows.map((r) => r.hex)).toEqual([
      "#2f6f62",
      "#6a4c93",
      "#d4893a",
      "#3d5a80",
    ]);
  });

  it("adds a new one first, lower case", async () => {
    const s = server();
    const added = await savedColourActions(s).add("#A1B2C3");
    expect(added.hex).toBe("#a1b2c3");
    const rows = await s.listSavedColours();
    expect(rows[0]?.hex).toBe("#a1b2c3");
    expect(rows).toHaveLength(5);
  });

  it("edits one in place", async () => {
    const s = server();
    const [first, second] = await s.listSavedColours();
    await savedColourActions(s).update(second!.id, "#112233");
    const rows = await s.listSavedColours();
    expect(rows.map((r) => r.hex)).toEqual([
      first!.hex,
      "#112233",
      "#d4893a",
      "#3d5a80",
    ]);
  });

  it("removes one, and Undo puts it back where it was", async () => {
    const s = server();
    const actions = savedColourActions(s);
    const [, second] = await s.listSavedColours();
    const removed = await actions.remove(second!.id);
    expect((await s.listSavedColours()).map((r) => r.hex)).not.toContain(
      "#6a4c93",
    );
    await actions.restore(removed!);
    expect((await s.listSavedColours()).map((r) => r.hex)).toEqual([
      "#2f6f62",
      "#6a4c93",
      "#d4893a",
      "#3d5a80",
    ]);
  });

  it("refuses a bad hex and a hex saved twice, changing nothing", async () => {
    const s = server();
    const actions = savedColourActions(s);
    await expect(actions.add("#2f6g62")).rejects.toThrow();
    await expect(actions.add("#2F6F62")).rejects.toThrow(/already saved/);
    expect(await s.listSavedColours()).toHaveLength(4);
  });
});
