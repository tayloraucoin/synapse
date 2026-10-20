import { describe, expect, it, vi } from "vitest";
import { passageRecord, UNOPENABLE_LINK } from "@syn/validators";
import {
  checkLink,
  checkPassage,
  initialSheetState,
  linkDraftOf,
  passageDraftOf,
  sheetReducer,
  submitSheet,
  type PassageDraft,
  type SheetAction,
  type SheetState,
} from "./use-reading-sheet";

/**
 * USE-153's sheets, through their state and checks (C3 to C6): what a save
 * sends, what a failed save keeps, the link line, and the discard question.
 */

const PASSAGE_ID = "00000000-0000-4000-8000-000000002001";

const stored = passageRecord.parse({
  id: PASSAGE_ID,
  createdAt: "2026-10-01T12:00:00.000Z",
  updatedAt: "2026-10-01T12:00:00.000Z",
  title: "Where the feet are",
  bodyMd: "Begin where the feet are.",
  images: [`owner/${PASSAGE_ID}/one.jpg`],
  sortOrder: 0,
});

/** The reducer with its dispatches applied in order, as React would. */
function harness<D extends object>(initial: D) {
  let state: SheetState<D> = initialSheetState(initial);
  const dispatch = (action: SheetAction<D>) => {
    state = sheetReducer(state, action);
  };
  return { dispatch, get: () => state };
}

describe("a save that fails (C3)", () => {
  it("keeps the title and body as typed, shows the line, and Save writes again", async () => {
    const sheet = harness(passageDraftOf(stored));
    sheet.dispatch({
      type: "edit",
      patch: { title: "Where the feet stand", bodyMd: "Begin here, slowly." },
    });
    const write = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline mid-flight"))
      .mockResolvedValueOnce(stored);
    const check = (draft: PassageDraft) => checkPassage(PASSAGE_ID, draft);

    expect(await submitSheet(sheet.get(), check, write, sheet.dispatch)).toBe(
      "failed",
    );
    expect(sheet.get().failed).toBe(true);
    expect(sheet.get().closed).toBe(false);
    expect(sheet.get().draft).toEqual({
      title: "Where the feet stand",
      bodyMd: "Begin here, slowly.",
    });

    expect(await submitSheet(sheet.get(), check, write, sheet.dispatch)).toBe(
      "saved",
    );
    expect(write).toHaveBeenCalledTimes(2);
    expect(write.mock.calls[1]).toEqual(write.mock.calls[0]);
    expect(sheet.get().failed).toBe(false);
    expect(sheet.get().closed).toBe(true);
  });
});

describe("an edited passage's save (C4)", () => {
  it("sends only id, title and bodyMd, never images or tags", async () => {
    const sheet = harness(passageDraftOf(stored));
    sheet.dispatch({ type: "edit", patch: { bodyMd: "  Begin again.  " } });
    const write = vi.fn().mockResolvedValue(stored);

    await submitSheet(
      sheet.get(),
      (draft) => checkPassage(PASSAGE_ID, draft),
      write,
      sheet.dispatch,
    );

    expect(write).toHaveBeenCalledOnce();
    const sent = write.mock.calls[0]![0] as Record<string, unknown>;
    expect(Object.keys(sent).sort()).toEqual(["bodyMd", "id", "title"]);
    expect(sent).toEqual({
      id: PASSAGE_ID,
      title: "Where the feet are",
      bodyMd: "Begin again.",
    });
  });

  it("sends a new passage with no title as null, and no id", () => {
    expect(checkPassage(null, { title: " ", bodyMd: "Words." })).toEqual({
      ok: true,
      input: { title: null, bodyMd: "Words." },
    });
  });
});

describe("a link that cannot open (C5)", () => {
  it("shows the approved line on the Link field and calls no write", async () => {
    const sheet = harness(linkDraftOf(null));
    sheet.dispatch({
      type: "edit",
      patch: { title: "Morning calm", url: "morning calm playlist" },
    });
    const write = vi.fn();

    expect(
      await submitSheet(
        sheet.get(),
        (draft) => checkLink(null, draft),
        write,
        sheet.dispatch,
      ),
    ).toBe("invalid");
    expect(write).not.toHaveBeenCalled();
    expect(sheet.get().checked).toBe(true);
    expect(checkLink(null, sheet.get().draft)).toEqual({
      ok: false,
      field: "url",
      message:
        "That doesn’t open as a link. Paste the address from the browser or from Spotify’s Share.",
    });
    expect(UNOPENABLE_LINK).toBe(
      "That doesn’t open as a link. Paste the address from the browser or from Spotify’s Share.",
    );
  });

  it("takes https: and spotify: as they are", () => {
    for (const url of [
      "https://open.spotify.com/playlist/abc",
      "spotify:playlist:abc",
    ]) {
      expect(checkLink(null, { title: "Morning calm", url }).ok).toBe(true);
    }
  });
});

describe("leaving the sheet (C6)", () => {
  it("asks first with unsaved words, and Discard writes nothing", () => {
    const sheet = harness(passageDraftOf(stored));
    const write = vi.fn();
    sheet.dispatch({
      type: "edit",
      patch: { bodyMd: "Begin where the feet are, and tea before any of it." },
    });

    sheet.dispatch({ type: "request-close" });
    expect(sheet.get().discarding).toBe(true);
    expect(sheet.get().closed).toBe(false);

    sheet.dispatch({ type: "keep-editing" });
    expect(sheet.get().discarding).toBe(false);
    expect(sheet.get().draft.bodyMd).toBe(
      "Begin where the feet are, and tea before any of it.",
    );

    sheet.dispatch({ type: "request-close" });
    sheet.dispatch({ type: "discard" });
    expect(sheet.get().closed).toBe(true);
    expect(write).not.toHaveBeenCalled();
  });

  it("closes without asking when nothing changed", () => {
    const sheet = harness(linkDraftOf(null));
    sheet.dispatch({ type: "edit", patch: { title: "   " } });
    sheet.dispatch({ type: "request-close" });
    expect(sheet.get().discarding).toBe(false);
    expect(sheet.get().closed).toBe(true);
  });
});
