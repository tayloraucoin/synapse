"use client";

/**
 * MorningReadingPage — Settings › Morning reading (USE-151;
 * ux/account/morning-reading/; D-USE-119, D-USE-122).
 *
 * "‹ Settings" over the h1 and a hairline; under it one read for both
 * sections (D-USE-133): Passages, a rule, Links. Loading draws the headings
 * and their lines with skeleton rows; a failed read is one `RegionRetry`
 * for both, the header and back staying. Offline (D-USE-129) the list shows
 * as last saved under one `StatusLine`, and grips, ···, the add rows and the
 * Off buttons wait; "Off" still opens and a row still opens to read. No
 * primary action (D-USE-127).
 *
 * The seams USE-152 and USE-153 fill: `rows` (the ···, a drop's order, Turn
 * on, Delete and the heading's `SaveStatus`) and `renderSheet`, the slot the
 * passage and link sheets open in. A row or an add row sets the sheet's
 * target; a capture seeds it from the scenario's `view.open`
 * (`sheet:add-passage`, `sheet:edit-link:<id>`, …), and `off-open:<kind>`
 * opens that section's Off list.
 */
import * as React from "react";
import { Breadcrumb, RegionRetry, ScreenFrame, Text } from "@syn/ui";
import type { LinkRecord, PassageRecord, ReadingKind } from "@syn/validators";
import { OfflineLine } from "@/components/planner/offline-line";
import { useDataSource } from "@/lib/data/source";
import { useMorningReading } from "@/lib/data/use-morning-reading";
import { settingsRoute } from "@/lib/routes";
import { MORNING_READING_COPY as COPY } from "./copy";
import { LinkRow, PassageRow } from "./reading-rows";
import { ReadingSection, ReadingSectionSkeleton } from "./reading-section";

/** What the sheet opens on: a new row of a kind, or a row by id. */
export interface ReadingSheetTarget {
  kind: ReadingKind;
  id: string | null;
}

type RowOf<K extends ReadingKind> = K extends "passage"
  ? PassageRecord
  : LinkRecord;

/** USE-152's row seams, per kind; unset, the rows are drawn and wait. */
export interface ReadingRowSeams {
  menu?: (
    kind: ReadingKind,
    row: PassageRecord | LinkRecord,
  ) => React.ReactNode;
  onReorder?: (kind: ReadingKind, ids: string[]) => void;
  onTurnOn?: (kind: ReadingKind, row: PassageRecord | LinkRecord) => void;
  onDelete?: (kind: ReadingKind, row: PassageRecord | LinkRecord) => void;
  status?: (kind: ReadingKind) => React.ReactNode;
}

export interface MorningReadingPageProps {
  rows?: ReadingRowSeams;
  /** USE-153's sheets, open on `target`; `close` returns to the list. */
  renderSheet?: (
    target: ReadingSheetTarget | null,
    close: () => void,
  ) => React.ReactNode;
}

function seededSheet(open: string | undefined): ReadingSheetTarget | null {
  const [what, which, id] = open?.split(":") ?? [];
  if (what !== "sheet") return null;
  if (which === "add-passage") return { kind: "passage", id: null };
  if (which === "add-link") return { kind: "link", id: null };
  if (which === "edit-passage" && id) return { kind: "passage", id };
  if (which === "edit-link" && id) return { kind: "link", id };
  return null;
}

export function MorningReadingPage({
  rows: seams = {},
  renderSheet,
}: MorningReadingPageProps = {}) {
  const source = useDataSource();
  const reading = useMorningReading();
  const open = source.scenario.view?.open;
  const [sheet, setSheet] = React.useState(() => seededSheet(open));
  const heading = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);

  const waiting = reading.offline;
  const list = reading.list;

  function section<K extends ReadingKind>(kind: K) {
    const passage = kind === "passage";
    return {
      id: passage ? "morning-reading-passages" : "morning-reading-links",
      heading: passage ? COPY.passages : COPY.links,
      line: passage ? COPY.passagesLine : COPY.linksLine,
    };
  }

  function rowProps<K extends ReadingKind>(kind: K) {
    return {
      waiting,
      offOpen: open === `off-open:${kind}`,
      status: seams.status?.(kind),
      onReorder: seams.onReorder
        ? (ids: string[]) => seams.onReorder?.(kind, ids)
        : undefined,
      onAdd: () => setSheet({ kind, id: null }),
      onTurnOn: seams.onTurnOn
        ? (row: RowOf<K>) => seams.onTurnOn?.(kind, row)
        : undefined,
      onDelete: seams.onDelete
        ? (row: RowOf<K>) => seams.onDelete?.(kind, row)
        : undefined,
    };
  }

  const openRow = (kind: ReadingKind) => (row: { id: string }) =>
    setSheet({ kind, id: row.id });

  return (
    <ScreenFrame>
      <div className="flex flex-col gap-(--space-4) pb-(--space-8)">
        <header className="border-border flex flex-col gap-(--space-1) border-b pb-(--space-3)">
          <Breadcrumb
            label={COPY.back}
            href={settingsRoute()}
            ariaLabel={COPY.backLabel}
          />
          <h1 ref={heading} tabIndex={-1} className="outline-none">
            <Text as="span" variant="heading" weight={600}>
              {COPY.title}
            </Text>
          </h1>
        </header>

        {waiting ? <OfflineLine text={COPY.offline} /> : null}

        {reading.status === "error" ? (
          <RegionRetry
            label={COPY.failed}
            detail={COPY.failedDetail}
            onRetry={() => void reading.retry()}
          />
        ) : list === undefined ? (
          <>
            <ReadingSectionSkeleton {...section("passage")} rows={3} />
            <hr className="border-border m-0" />
            <ReadingSectionSkeleton {...section("link")} rows={2} />
          </>
        ) : (
          <>
            <ReadingSection
              {...section("passage")}
              {...rowProps("passage")}
              emptyLine={COPY.passagesEmpty}
              addLabel={COPY.addPassage}
              rows={list.passages}
              off={list.passagesOff}
              renderRow={(row, handleProps) => (
                <PassageRow
                  row={row}
                  handleProps={handleProps}
                  menu={seams.menu?.("passage", row)}
                  waiting={waiting}
                  onOpen={openRow("passage")}
                />
              )}
            />
            <hr className="border-border m-0" />
            <ReadingSection
              {...section("link")}
              {...rowProps("link")}
              emptyLine={COPY.linksEmpty}
              addLabel={COPY.addLink}
              rows={list.links}
              off={list.linksOff}
              renderRow={(row, handleProps) => (
                <LinkRow
                  row={row}
                  handleProps={handleProps}
                  menu={seams.menu?.("link", row)}
                  waiting={waiting}
                  onOpen={openRow("link")}
                />
              )}
            />
          </>
        )}
      </div>
      {renderSheet?.(sheet, () => setSheet(null))}
    </ScreenFrame>
  );
}
