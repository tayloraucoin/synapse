"use client";

import * as React from "react";

import { DURATION_MAX, DURATION_MIN } from "@syn/constants";
import type { HabitSummaryView, IconValue, SlotView } from "@syn/types";
import {
  Button,
  EllipsesMenu,
  EmojiSlot,
  ListRow,
  MinutesStepper,
  SortableHandle,
  SortableList,
  Text,
} from "@syn/ui";

import { DAY_BUILDER_COPY as COPY } from "./copy";
import type { useListScreen } from "./use-list-screen";

/**
 * A list's rows — 13d and 13h (UX v1.2 §4.13d, §4.13h): handle · glyph ·
 * title · stepper · menu, in the template's order; the walk's own rows
 * (13h's *A few lines* and *Phone away*) rendered in position, muted, not
 * sortable. Beneath a hairline, the habits this list leaves out, with
 * *Include* — a slot appended at the habit's usual length.
 */

export type PlacedRow = {
  key: string;
  icon: IconValue | null;
  title: string;
  detail: string;
  /** Rendered after the slot at this index; -1 for before the first. */
  afterIndex: number;
};

type Row = { id: string; title: string; slot: SlotView };

export function SlotRows({
  list,
  candidates,
  placed = [],
  disabled,
  listLabel,
  leaveOutLabel,
  notOnThisDayLabel,
  includeLabel,
  menuExtra,
  captionOf,
  usualOf,
}: {
  list: ReturnType<typeof useListScreen>;
  /** Every habit the list could hold — the left-out section is these minus the slots'. */
  candidates: readonly HabitSummaryView[];
  placed?: readonly PlacedRow[];
  disabled: boolean;
  listLabel: string;
  leaveOutLabel: string;
  notOnThisDayLabel: string;
  includeLabel: string;
  /** Extra menu rows per slot, before *Leave out*. */
  menuExtra?: (slot: SlotView) => Array<{ label: string; onClick: () => void }>;
  /** A caption under the title — 13h's *confirm in the morning*. */
  captionOf?: (slot: SlotView) => string | null;
  usualOf: (habit: HabitSummaryView) => number;
}) {
  const slots = React.useMemo(() => list.slots ?? [], [list.slots]);
  const onWalk = React.useMemo(() => slots.filter((slot) => slot.role !== "pool"), [slots]);
  const rows: Row[] = React.useMemo(() => onWalk.map((slot) => ({ id: slot.id, title: slot.title, slot })), [onWalk]);
  const inList = new Set(onWalk.map((slot) => slot.habitId));
  const leftOut = candidates.filter((habit) => !inList.has(habit.id));
  const placedAt = (index: number) => placed.filter((row) => row.afterIndex === index);

  const renderPlaced = (row: PlacedRow) => (
    <ListRow
      key={row.key}
      leading={row.icon ?? undefined}
      title={row.title}
      trailing={
        <Text as="span" variant="caption" tone="secondary" className="tabular-nums">
          {row.detail}
        </Text>
      }
      muted
    />
  );

  return (
    <div className="flex flex-col gap-(--space-5)">
      <section className="flex flex-col gap-(--space-2)">
        {placedAt(-1).map(renderPlaced)}
        {list.slots === null ? null : rows.length === 0 ? (
          <Text as="p" variant="secondary" tone="secondary">
            {COPY.d.nothingYet}
          </Text>
        ) : (
          <SortableList
            label={listLabel}
            items={rows}
            disabled={disabled}
            onReorder={(ids) => void list.reorder(rows.map((row) => row.id), ids)}
            renderItem={(item, { handleProps, index }) => {
              const slot = item.slot;
              const other =
                slot.alternates === null
                  ? null
                  : (slots.find((row) => row.id !== slot.id && row.alternates?.group === slot.alternates?.group) ?? null);
              const caption = captionOf?.(slot) ?? null;
              return (
                <div className="flex min-w-0 flex-1 flex-col gap-(--space-2)">
                  <div className="flex min-w-0 items-center gap-(--space-2)">
                    <SortableHandle {...handleProps} />
                    <EmojiSlot icon={slot.icon} />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <Text as="span" variant="row-title" weight={500} truncate>
                        {slot.title}
                      </Text>
                      {other === null ? null : (
                        <Text as="span" variant="caption" tone="secondary" truncate>
                          {`${COPY.d.oneOfTwo} · ${other.title} · ${other.durationMin} min`}
                        </Text>
                      )}
                      {caption === null ? null : (
                        <Text as="span" variant="caption" tone="secondary" truncate>
                          {caption}
                        </Text>
                      )}
                    </span>
                    <MinutesStepper
                      label={COPY.d.lengthOf(slot.title)}
                      value={slot.durationMin}
                      onCommit={(next) => list.setMinutes(slot, next)}
                      min={DURATION_MIN}
                      max={DURATION_MAX}
                      disabled={disabled}
                      compact
                      className="shrink-0 [&>label]:sr-only"
                    />
                    <EllipsesMenu
                      label={slot.title}
                      disabled={disabled}
                      items={[
                        ...(menuExtra?.(slot) ?? []),
                        { label: leaveOutLabel, onClick: () => void list.remove(slot) },
                      ]}
                    />
                  </div>
                  {placedAt(index).map(renderPlaced)}
                </div>
              );
            }}
          />
        )}
      </section>

      {leftOut.length === 0 ? null : (
        <>
          <hr className="border-hairline m-0 border-t" />
          <section className="flex flex-col gap-(--space-2)">
            <Text as="h2" variant="secondary" weight={500} tone="secondary">
              {notOnThisDayLabel}
            </Text>
            {leftOut.map((habit) => (
              <ListRow
                key={habit.id}
                leading={habit.icon}
                title={habit.title}
                trailing={
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    onClick={() => void list.addSlot({ habitId: habit.id, durationMin: usualOf(habit), priorityOverride: 7, scheduling: "hard" })}
                  >
                    {includeLabel}
                  </Button>
                }
              />
            ))}
          </section>
        </>
      )}
    </div>
  );
}
