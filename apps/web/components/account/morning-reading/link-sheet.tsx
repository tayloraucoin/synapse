"use client";

/**
 * LinkSheet — add or edit a link (USE-153; states/add-link.md, edit-link.md,
 * link-invalid.md; D-USE-120, D-USE-126).
 *
 * Title and Link with its hint; the kind is derived from the URL by the
 * server and never chosen, and nothing is fetched. A link that is neither
 * `https:` nor `spotify:` shows the approved line in ink under the field,
 * the field's border in ink, never red; nothing is written. The line shows
 * on Save and from then on each change, clearing as the link parses.
 */
import * as React from "react";
import { Input } from "@syn/ui";
import type { LinkRecord } from "@syn/validators";
import {
  ReadingSheetFrame,
  type ReadingSheetSeed,
} from "./reading-sheet-frame";
import { READING_SHEET_COPY as COPY } from "./sheet-copy";
import {
  checkLink,
  linkDraftOf,
  linkHasWords,
  useReadingSheet,
  type LinkDraft,
  type ReadingLinkSave,
} from "./use-reading-sheet";

export interface LinkSheetProps {
  open: boolean;
  /** Null: Add a link. */
  row: LinkRecord | null;
  save: (input: ReadingLinkSave) => Promise<unknown>;
  offline: boolean;
  onClose: () => void;
  /** A capture's start (`?state=`): the words typed and what was pressed. */
  seed?: ReadingSheetSeed<LinkDraft>;
}

export function LinkSheet({
  open,
  row,
  save,
  offline,
  onClose,
  seed,
}: LinkSheetProps) {
  const id = row?.id ?? null;
  const check = React.useCallback(
    (draft: LinkDraft) => checkLink(id, draft),
    [id],
  );
  const sheet = useReadingSheet({
    initial: linkDraftOf(row),
    typed: seed?.draft,
    check,
    hasWords: linkHasWords,
    write: save,
    offline,
    onClosed: onClose,
  });
  const lineFor = (field: keyof LinkDraft) =>
    sheet.line?.ok === false && sheet.line.field === field
      ? sheet.line.message
      : undefined;

  return (
    <ReadingSheetFrame
      open={open}
      title={row === null ? COPY.addLink : COPY.editLink}
      sheet={sheet}
      offline={offline}
      seed={seed}
      discardLine={
        row === null ? COPY.discardNewLink : COPY.discardLink(row.title)
      }
    >
      <Input
        label={COPY.title}
        placeholder={COPY.linkTitlePlaceholder}
        value={sheet.draft.title}
        autoComplete="off"
        error={lineFor("title")}
        onChange={(event) => sheet.edit({ title: event.target.value })}
      />
      <Input
        mode="url"
        label={COPY.link}
        placeholder={COPY.linkPlaceholder}
        value={sheet.draft.url}
        helperText={COPY.linkHint}
        error={lineFor("url")}
        onChange={(event) => sheet.edit({ url: event.target.value })}
        onKeyDown={(event) => {
          if (event.key === "Enter") void sheet.save();
        }}
      />
    </ReadingSheetFrame>
  );
}
