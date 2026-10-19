"use client";

import type * as React from "react";

import { ChipPicker, LargeTargetRow, Text, TimeField } from "@syn/ui";
import { WORK_DAY_KINDS } from "@syn/constants";
import type { AnchorDirection, IconValue, WorkDayKind } from "@syn/types";

import { SETUP_COPY as COPY } from "@/app/(setup)/_components/copy";

const KIND_OPTIONS = WORK_DAY_KINDS.map((entry) => ({
  value: entry.key,
  label: entry.title,
  icon: entry.icon as IconValue,
}));

/**
 * The work's four facts — the kind chips, *Working by*, *Until about*, and
 * *what gives* — as one body (UX v1.3 §4.4 B3; DAY-9). Drawn by the
 * builder's B3; DAY-13 moved it here when v1.2's work-day-type card was
 * retired. Controlled: the caller writes.
 *
 * NOTHING PRESELECTED but the values handed in: the chips open on none, the
 * *what gives* rows on none (v1.3 R46 — "Preselect a kind nowhere").
 */
export function WorkFields({
  value,
  onKind,
  onWorkStart,
  onWorkEnd,
  onDirection,
  afterKind,
  disabled = false,
}: {
  value: {
    kind: WorkDayKind | null;
    /** "HH:mm" */
    workStart: string;
    workEnd: string;
    direction: AnchorDirection | null;
  };
  onKind: (kind: WorkDayKind | null) => void;
  onWorkStart: (clock: string) => void;
  onWorkEnd: (clock: string) => void;
  onDirection: (direction: AnchorDirection) => void;
  /** Anything between the chips and the times; B3 has none. */
  afterKind?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <>
      <ChipPicker
        label={COPY.kind}
        options={KIND_OPTIONS}
        value={value.kind}
        onChange={(next) => onKind(next as WorkDayKind | null)}
        disabled={disabled}
      />

      {afterKind}

      <TimeField
        label={COPY.workingBy}
        value={value.workStart}
        onChange={onWorkStart}
        disclosed
        changeLabel={COPY.change}
        doneLabel={COPY.done}
        disabled={disabled}
        required
      />
      <TimeField
        label={COPY.untilAbout}
        value={value.workEnd}
        onChange={onWorkEnd}
        disclosed
        changeLabel={COPY.change}
        doneLabel={COPY.done}
        disabled={disabled}
        required
      />

      <div className="flex flex-col gap-(--space-3)">
        <Text as="h3" variant="body" weight={500}>
          {COPY.whatGives}
        </Text>
        <LargeTargetRow
          layout="stacked"
          label={COPY.whatGives}
          value={value.direction}
          disabled={disabled}
          onChange={(next) => onDirection(next as AnchorDirection)}
          options={[
            { value: "work_waits", label: COPY.gives.work_waits, description: COPY.gives.work_waitsBody },
            { value: "routine_cut", label: COPY.gives.routine_cut, description: COPY.gives.routine_cutBody },
            { value: "depends", label: COPY.gives.depends, description: COPY.gives.dependsBody },
          ]}
          className="[&>span:first-child]:sr-only"
        />
      </div>
    </>
  );
}
