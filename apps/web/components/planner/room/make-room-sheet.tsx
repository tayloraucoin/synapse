"use client";

import * as React from "react";
import { Checkbox, cn, MinutesStepper, Text } from "@syn/ui";
import type { MakeRoomRow, MakeRoomView, RoomSource } from "@/lib/data/room";
import { ROOM_COPY } from "./copy";
import { RoomSheetFrame } from "./room-sheet-frame";

const COPY = ROOM_COPY.makeRoom;

/**
 * Make room (USE-41; make-room/states/sheet.md; D-USE-11, D-USE-16,
 * D-USE-66): an addition with no room the engine could guess. From the
 * block it lands in or from the other blocks, a multi-select on hairlines:
 * an item with its length and, picked, "35 min, now 28 min" and a stepper
 * for the minutes it gives (up to what the engine lets it give); a gap with
 * its free minutes; travel, set times and Orient shown italic and muted in
 * a dashed, disabled box, never ticked. The foot reads the engine's
 * "<found> of <needed> min found". Decide for me is drawn and disabled:
 * Phase 1 has no AI (D-USE-66). Make room takes a tap once the minutes are
 * found; × adds nothing and takes nothing.
 */
export interface MakeRoomSheetProps {
  view: MakeRoomView | null;
  onSource: (source: RoomSource) => void;
  onToggle: (key: string) => void;
  onStep: (key: string, minutes: number) => void;
  onApply: () => void;
  onClose: () => void;
}

function rowTitle(row: MakeRoomRow): string {
  if (row.kind !== "gap") return row.title;
  if (row.where === "after") {
    return row.before
      ? COPY.gapBefore(row.before)
      : COPY.gapAtEnd(row.blockName);
  }
  return COPY.gapIn(row.blockName);
}

function rowLine(row: MakeRoomRow): string {
  if (!row.eligible && row.reason) return COPY.locked[row.reason];
  if (row.kind === "gap") return COPY.free(row.lengthMin);
  return COPY.itemLine(row.lengthMin, row.picked === null ? null : row.nowMin);
}

function Row({
  row,
  others,
  onToggle,
  onStep,
}: {
  row: MakeRoomRow;
  others: boolean;
  onToggle: (key: string) => void;
  onStep: (key: string, minutes: number) => void;
}) {
  const id = React.useId();
  const title = rowTitle(row);
  const line = others
    ? COPY.inBlock(rowLine(row), row.blockName)
    : rowLine(row);
  const locked = !row.eligible || row.gives <= 0;

  return (
    <li className="border-hairline flex min-h-(--row-min) items-center gap-(--space-3) border-b py-(--space-2) last:border-b-0">
      {locked ? (
        <span
          aria-hidden="true"
          className="border-input size-5 shrink-0 rounded-(--radius) border border-dashed"
        />
      ) : (
        <Checkbox
          id={id}
          checked={row.picked !== null}
          onCheckedChange={() => onToggle(row.key)}
        />
      )}
      <label
        htmlFor={locked ? undefined : id}
        aria-disabled={locked || undefined}
        className={cn(
          "flex min-h-(--target) min-w-0 flex-1 flex-col justify-center",
          !locked && "cursor-pointer",
        )}
      >
        <Text
          as="span"
          tone={locked ? "muted" : "body"}
          className={cn(locked && "italic")}
        >
          {title}
        </Text>
        <Text as="span" variant="secondary" tone="muted">
          {line}
        </Text>
      </label>
      {row.picked !== null && row.kind === "item" ? (
        <MinutesStepper
          compact
          label={<span className="sr-only">{COPY.stepper(title)}</span>}
          value={row.picked}
          min={1}
          max={row.gives}
          onChange={(minutes) => onStep(row.key, minutes)}
          className="shrink-0 gap-0"
        />
      ) : row.picked !== null ? (
        <Text
          as="span"
          weight={500}
          tabular
          className="shrink-0 pe-(--space-1)"
        >
          {row.picked}
        </Text>
      ) : null}
    </li>
  );
}

export function MakeRoomSheet({
  view,
  onSource,
  onToggle,
  onStep,
  onApply,
  onClose,
}: MakeRoomSheetProps) {
  if (view === null) {
    return null;
  }
  const { addition } = view;
  return (
    <RoomSheetFrame<RoomSource>
      open
      onClose={onClose}
      scope={COPY.scope(addition.title, addition.lengthMin, addition.at)}
      title={COPY.title(addition.lengthMin)}
      segment={{
        label: COPY.sources,
        value: view.source,
        onChange: onSource,
        picked: "raised",
        options: [
          { value: "this_block", label: COPY.fromBlock(view.blockName) },
          { value: "other_blocks", label: COPY.fromOthers },
        ],
      }}
      foot={COPY.found(view.found, view.needed)}
      secondary={{ label: COPY.decide, disabled: true, even: true }}
      primary={{
        label: COPY.apply,
        onClick: onApply,
        disabled: !view.ready,
      }}
    >
      <ul className="flex flex-col">
        {view.rows.map((row) => (
          <Row
            key={row.key}
            row={row}
            others={view.source === "other_blocks"}
            onToggle={onToggle}
            onStep={onStep}
          />
        ))}
      </ul>
    </RoomSheetFrame>
  );
}
