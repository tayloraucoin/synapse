"use client";

import * as React from "react";
import {
  linkFormSchema,
  passageFormSchema,
  type LinkRecord,
  type PassageRecord,
} from "@syn/validators";
import type { useMorningReading } from "@/lib/data/use-morning-reading";

/**
 * The passage and link sheets' state (USE-153; D-USE-126, D-USE-128,
 * D-USE-129): the words as typed, whether they differ from what opened,
 * the discard question, and Save with its states.
 *
 * THE WORDS ARE NEVER DROPPED. A failed save keeps every word and shows one
 * line; Save is the retry. Offline, the words stay and Save waits; nothing
 * is queued (the writes are refused offline before they are sent).
 *
 * WHAT A SAVE SENDS. A passage sends `{ id, title, bodyMd }` and a link
 * `{ id, title, url }`, built field by field from the draft and never from
 * the list record, so a passage's stored images and tags never ride along
 * (D-USE-121).
 *
 * The reducer and the checks are pure, so the tests drive them without a DOM.
 */

type Writes = ReturnType<typeof useMorningReading>;

/** What a passage's save sends: `{ id?, title, bodyMd }`. */
export type ReadingPassageSave = Parameters<Writes["savePassage"]>[0];

/** What a link's save sends: `{ id?, title, url }`; the kind is the server's. */
export type ReadingLinkSave = Parameters<Writes["saveLink"]>[0];

export interface PassageDraft {
  title: string;
  bodyMd: string;
}

export interface LinkDraft {
  title: string;
  url: string;
}

/** A field's line, or the input the write takes. */
export type SheetCheck<I> =
  | { ok: true; input: I }
  | { ok: false; field: string; message: string };

export function passageDraftOf(row: PassageRecord | null): PassageDraft {
  return { title: row?.title ?? "", bodyMd: row?.bodyMd ?? "" };
}

export function linkDraftOf(row: LinkRecord | null): LinkDraft {
  return { title: row?.title ?? "", url: row?.url ?? "" };
}

/** Save waits until a passage has words in its body (the editor's empty is ""). */
export function passageHasWords(draft: PassageDraft): boolean {
  return draft.bodyMd.trim() !== "";
}

/** A link needs a title and something in Link before Save checks it. */
export function linkHasWords(draft: LinkDraft): boolean {
  return draft.title.trim() !== "" && draft.url.trim() !== "";
}

function firstIssue(error: {
  issues: { path: (string | number)[]; message: string }[];
}) {
  const issue = error.issues[0];
  return {
    field: String(issue?.path[0] ?? ""),
    message: issue?.message ?? "",
  };
}

/** The passage form's check; the save is `{ id, title, bodyMd }` and nothing else. */
export function checkPassage(
  id: string | null,
  draft: PassageDraft,
): SheetCheck<ReadingPassageSave> {
  const parsed = passageFormSchema.safeParse({
    title: draft.title,
    bodyMd: draft.bodyMd,
  });
  if (!parsed.success) return { ok: false, ...firstIssue(parsed.error) };
  const { title, bodyMd } = parsed.data;
  return {
    ok: true,
    input: id === null ? { title, bodyMd } : { id, title, bodyMd },
  };
}

/** The link form's check: `https:` or `spotify:`, refused in the approved line. */
export function checkLink(
  id: string | null,
  draft: LinkDraft,
): SheetCheck<ReadingLinkSave> {
  const parsed = linkFormSchema.safeParse({
    title: draft.title,
    url: draft.url,
  });
  if (!parsed.success) return { ok: false, ...firstIssue(parsed.error) };
  const { title, url } = parsed.data;
  return { ok: true, input: id === null ? { title, url } : { id, title, url } };
}

export interface SheetState<D> {
  initial: D;
  draft: D;
  /** The discard question is open. */
  discarding: boolean;
  /** The sheet has been let go: saved, discarded, or closed unchanged. */
  closed: boolean;
  saving: boolean;
  /** The last Save did not reach the server; the words are as typed. */
  failed: boolean;
  /** Save has checked once: the field lines show from here, on each change. */
  checked: boolean;
}

export type SheetAction<D> =
  | { type: "edit"; patch: Partial<D> }
  | { type: "request-close" }
  | { type: "keep-editing" }
  | { type: "discard" }
  | { type: "checked" }
  | { type: "saving" }
  | { type: "failed" }
  | { type: "saved" };

/** `typed`: words already in the fields as the sheet opens (a capture's start). */
export function initialSheetState<D>(
  initial: D,
  typed?: Partial<D>,
): SheetState<D> {
  return {
    initial,
    draft: { ...initial, ...typed },
    discarding: false,
    closed: false,
    saving: false,
    failed: false,
    checked: false,
  };
}

/** Unsaved words: any field differs from what opened, ignoring the ends' spaces. */
export function isDirty<D extends object>(state: SheetState<D>): boolean {
  const before = state.initial as Record<string, unknown>;
  const now = state.draft as Record<string, unknown>;
  return Object.keys(now).some(
    (key) => String(now[key] ?? "").trim() !== String(before[key] ?? "").trim(),
  );
}

export function sheetReducer<D extends object>(
  state: SheetState<D>,
  action: SheetAction<D>,
): SheetState<D> {
  switch (action.type) {
    case "edit":
      return { ...state, draft: { ...state.draft, ...action.patch } };
    case "request-close":
      // × or Escape: unsaved words ask first; none, and the sheet goes.
      return isDirty(state)
        ? { ...state, discarding: true }
        : { ...state, closed: true };
    case "keep-editing":
      return { ...state, discarding: false };
    case "discard":
      return { ...state, discarding: false, closed: true };
    case "checked":
      return { ...state, checked: true };
    case "saving":
      return { ...state, checked: true, saving: true, failed: false };
    case "failed":
      return { ...state, saving: false, failed: true };
    case "saved":
      return { ...state, saving: false, failed: false, closed: true };
  }
}

/**
 * One Save: check, then write. A refused check writes nothing and shows the
 * field's line; a write that throws keeps the draft and shows the failed
 * line, and the next Save calls the write again.
 */
export async function submitSheet<D extends object, I>(
  state: SheetState<D>,
  check: (draft: D) => SheetCheck<I>,
  write: (input: I) => Promise<unknown>,
  dispatch: (action: SheetAction<D>) => void,
): Promise<"invalid" | "saved" | "failed"> {
  const result = check(state.draft);
  if (!result.ok) {
    dispatch({ type: "checked" });
    return "invalid";
  }
  dispatch({ type: "saving" });
  try {
    await write(result.input);
    dispatch({ type: "saved" });
    return "saved";
  } catch {
    dispatch({ type: "failed" });
    return "failed";
  }
}

export interface UseReadingSheetOptions<D extends object, I> {
  initial: D;
  /** Words already typed as it opens (a capture's start). */
  typed?: Partial<D>;
  check: (draft: D) => SheetCheck<I>;
  hasWords: (draft: D) => boolean;
  write: (input: I) => Promise<unknown>;
  /** Every write waits while this is true (D-USE-129). */
  offline: boolean;
  /** Called once the sheet is let go, to close it. */
  onClosed: () => void;
}

/** The sheets' state, over `sheetReducer`, for one opening of one sheet. */
export function useReadingSheet<D extends object, I>({
  initial,
  typed,
  check,
  hasWords,
  write,
  offline,
  onClosed,
}: UseReadingSheetOptions<D, I>) {
  const [state, dispatch] = React.useReducer(sheetReducer<D>, null, () =>
    initialSheetState(initial, typed),
  );
  const stateRef = React.useRef(state);
  stateRef.current = state;

  React.useEffect(() => {
    if (state.closed) onClosed();
  }, [state.closed, onClosed]);

  const verdict = check(state.draft);
  const canSave = hasWords(state.draft) && !offline && !state.saving;

  const save = React.useCallback(() => {
    if (!canSave) return Promise.resolve("invalid" as const);
    return submitSheet(stateRef.current, check, write, dispatch);
  }, [canSave, check, write]);

  return {
    draft: state.draft,
    edit: (patch: Partial<D>) => dispatch({ type: "edit", patch }),
    dirty: isDirty(state),
    /** The field's line, once Save has checked; it clears as the field changes. */
    line: state.checked && !verdict.ok ? verdict : null,
    failed: state.failed,
    saving: state.saving,
    discarding: state.discarding,
    canSave,
    hasWords: hasWords(state.draft),
    save,
    requestClose: () => dispatch({ type: "request-close" }),
    keepEditing: () => dispatch({ type: "keep-editing" }),
    discard: () => dispatch({ type: "discard" }),
  };
}
