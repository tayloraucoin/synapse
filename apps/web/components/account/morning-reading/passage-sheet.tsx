"use client";

/**
 * PassageSheet — add or edit a passage (USE-153; states/add-passage.md,
 * edit-passage.md, discard.md, save-failed.md, offline-sheet.md; D-USE-120,
 * D-USE-121, D-USE-126, D-USE-128, D-USE-129).
 *
 * Title (optional, 80) and Passage in the house `RichTextEditor` as built,
 * filling the sheet with its five controls at its foot. No Images row: the
 * images a passage already has are kept, as the save sends only its title
 * and body. After Save the sheet closes and the row is the confirmation; no
 * toast. The shell (header, the lines above Save, the discard question) is
 * `ReadingSheetFrame`'s, shared with the link sheet.
 */
import * as React from "react";
import { Input, RichTextEditor, Text } from "@syn/ui";
import type { PassageRecord } from "@syn/validators";
import {
  ReadingSheetFrame,
  type ReadingSheetSeed,
} from "./reading-sheet-frame";
import { READING_SHEET_COPY as COPY } from "./sheet-copy";
import {
  checkPassage,
  passageDraftOf,
  passageHasWords,
  useReadingSheet,
  type PassageDraft,
  type ReadingPassageSave,
} from "./use-reading-sheet";

export interface PassageSheetProps {
  open: boolean;
  /** Null: Add a passage. */
  row: PassageRecord | null;
  save: (input: ReadingPassageSave) => Promise<unknown>;
  offline: boolean;
  onClose: () => void;
  /** A capture's start (`?state=`): the words typed and what was pressed. */
  seed?: ReadingSheetSeed<PassageDraft>;
}

export function PassageSheet({
  open,
  row,
  save,
  offline,
  onClose,
  seed,
}: PassageSheetProps) {
  const id = row?.id ?? null;
  const check = React.useCallback(
    (draft: PassageDraft) => checkPassage(id, draft),
    [id],
  );
  const sheet = useReadingSheet({
    initial: passageDraftOf(row),
    typed: seed?.draft,
    check,
    hasWords: passageHasWords,
    write: save,
    offline,
    onClosed: onClose,
  });
  const lineFor = (field: keyof PassageDraft) =>
    sheet.line?.ok === false && sheet.line.field === field
      ? sheet.line.message
      : undefined;

  return (
    <ReadingSheetFrame
      open={open}
      title={row === null ? COPY.addPassage : COPY.editPassage}
      tall
      sheet={sheet}
      offline={offline}
      seed={seed}
      discardLine={
        row === null
          ? COPY.discardNewPassage
          : COPY.discardPassage(row.title)
      }
    >
      <Input
        label={
          <span className="flex w-full items-baseline justify-between gap-(--space-2)">
            {COPY.title}
            <Text as="span" variant="caption" tone="secondary" weight={400}>
              {COPY.optional}
            </Text>
          </span>
        }
        classes={{ label: "w-full" }}
        placeholder={COPY.untitled}
        value={sheet.draft.title}
        autoComplete="off"
        error={lineFor("title")}
        onChange={(event) => sheet.edit({ title: event.target.value })}
      />
      <RichTextEditor
        label={COPY.passage}
        placeholder={COPY.passagePlaceholder}
        valueMd={sheet.draft.bodyMd}
        onChangeMd={(bodyMd) => sheet.edit({ bodyMd })}
        error={lineFor("bodyMd")}
        fill
        // Passage text in Newsreader, as the rows (C-USE-morning-reading-4).
        className="[&_.prose-passage]:font-serif"
      />
    </ReadingSheetFrame>
  );
}
