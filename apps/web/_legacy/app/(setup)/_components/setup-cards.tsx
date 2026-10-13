"use client";

import * as React from "react";

import { Button, SkeletonRow, Text } from "@syn/ui";
import type { HabitSummaryView } from "@syn/types";

import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import { useCardEntries } from "./use-card-entries";

/**
 * The cards as a list that appends — the builder's B4 (workouts) and
 * Settings → Focuses (DAY-13 moved it here from v1.2's screen 10, unchanged).
 *
 * A CARD NEVER REMOUNTS ON ITS FIRST WRITE (UX v1.3 §10.2; DAY-2). Every
 * card — a row the list had, or one added here — is one entry of
 * `useCardEntries` with one key for its life; when an added card's create
 * lands, the entry's `habit` goes from null to the row on the same
 * instance. The card treats that as nothing: its draft, its open state and
 * its `idRef` are its own. `data-draft` carries the key, so the same DOM
 * node can be checked across the create.
 */
export function SetupCards({
  rows,
  loading,
  addLabel,
  disabled,
  renderCard,
  footer,
}: {
  rows: HabitSummaryView[];
  loading: boolean;
  addLabel: string;
  disabled: boolean;
  renderCard: (
    entry: { habit: HabitSummaryView | null; added: boolean; index: number },
    callbacks: { onCreated: (id: string) => void; onRemoved: () => void; onDiscard: () => void },
  ) => React.ReactNode;
  footer?: React.ReactNode;
}) {
  const utils = trpc.useUtils();
  const { entries, add, created, removed } = useCardEntries(rows);
  const refresh = () => void utils.habit.list.invalidate();

  return (
    <div className="flex flex-col gap-(--space-3)">
      {loading ? (
        <SkeletonRow />
      ) : entries.length === 0 ? (
        <Text as="p" variant="secondary" tone="secondary">
          {COPY.nothingYet}
        </Text>
      ) : null}

      {entries.map((entry, index) => (
        <div key={entry.key} data-draft={entry.key}>
          {renderCard(
            { habit: entry.row, added: entry.added, index },
            {
              onCreated: (id) => created(entry.key, id),
              onRemoved: () => {
                removed(entry.key);
                refresh();
              },
              onDiscard: () => removed(entry.key),
            },
          )}
        </div>
      ))}

      <Button
        variant="secondary"
        className="w-full wide:w-auto wide:self-start"
        disabled={disabled}
        onClick={add}
      >
        {addLabel}
      </Button>

      {footer}
    </div>
  );
}
