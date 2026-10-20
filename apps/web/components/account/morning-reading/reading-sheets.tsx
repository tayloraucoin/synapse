"use client";

/**
 * ReadingSheets — what the page's sheet slot opens (USE-153): the passage or
 * link sheet on its target, over the list, with `useMorningReading()`'s
 * writes. The sheet stays drawn while it closes, and each opening starts
 * from the row as saved.
 *
 * A capture starts from the scenario's `view.open`: `discard:<id>` is the
 * passage edited and × pressed; `link-invalid:<id>` is a new link with
 * that row's title and words that are not a link, Save pressed;
 * `save-failed:<id>` is Save pressed on the edit sheet, against a write the
 * scenario fails once.
 */
import * as React from "react";
import type { LinkRecord, PassageRecord } from "@syn/validators";
import { useDataSource } from "@/lib/data/source";
import { useMorningReading } from "@/lib/data/use-morning-reading";
import { LinkSheet } from "./link-sheet";
import type { ReadingSheetTarget } from "./morning-reading-page";
import { PassageSheet } from "./passage-sheet";
import type { ReadingSheetSeed } from "./reading-sheet-frame";
import type { LinkDraft, PassageDraft } from "./use-reading-sheet";

/** The boards' typed words for `discard` and `link-invalid` ([placeholder]). */
const CAPTURE = {
  unsavedEnding: ", and tea before any of it.",
  notALink: "morning calm playlist",
};

export interface ReadingSheetsProps {
  target: ReadingSheetTarget | null;
  close: () => void;
}

export function ReadingSheets({ target, close }: ReadingSheetsProps) {
  const source = useDataSource();
  const reading = useMorningReading();
  const open = source.scenario.view?.open;
  const [seedFor, setSeedFor] = React.useState(open);

  // The last target stays drawn while the sheet closes; each opening is new.
  const [shown, setShown] = React.useState({ target, opening: 0 });
  if (target !== null && target !== shown.target) {
    setShown({ target, opening: shown.opening + 1 });
  }
  const current = target ?? shown.target;
  const list = reading.list;
  if (current === null || list === undefined) return null;

  const passages = [...list.passages, ...list.passagesOff];
  const links = [...list.links, ...list.linksOff];
  const key = `${current.kind}:${current.id ?? "new"}:${shown.opening}`;
  const onClose = () => {
    setSeedFor(undefined);
    close();
  };

  if (current.kind === "passage") {
    const row = passages.find((r) => r.id === current.id) ?? null;
    return (
      <PassageSheet
        key={key}
        open={target !== null}
        row={row}
        save={reading.savePassage}
        offline={reading.offline}
        onClose={onClose}
        seed={passageSeed(seedFor, row)}
      />
    );
  }
  const row = links.find((r) => r.id === current.id) ?? null;
  const from = links.find((r) => `link-invalid:${r.id}` === seedFor);
  return (
    <LinkSheet
      key={key}
      open={target !== null}
      row={row}
      save={reading.saveLink}
      offline={reading.offline}
      onClose={onClose}
      seed={linkSeed(from)}
    />
  );
}

function passageSeed(
  open: string | undefined,
  row: PassageRecord | null,
): ReadingSheetSeed<PassageDraft> | undefined {
  if (row === null) return undefined;
  if (open === `discard:${row.id}`) {
    return {
      draft: { bodyMd: row.bodyMd.replace(/\.\s*$/, CAPTURE.unsavedEnding) },
      then: "close",
    };
  }
  if (open === `save-failed:${row.id}`) return { then: "save" };
  return undefined;
}

function linkSeed(
  from: LinkRecord | undefined,
): ReadingSheetSeed<LinkDraft> | undefined {
  if (from === undefined) return undefined;
  return { draft: { title: from.title, url: CAPTURE.notALink }, then: "save" };
}
