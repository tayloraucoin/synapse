"use client";

import * as React from "react";

import { Button, Checkbox, Label, Tag, Text } from "@syn/ui";
import { STARTER_HABITS } from "@syn/constants";

import { trpc } from "@/lib/trpc/client";

import { STARTER_SET_COPY as COPY } from "./copy";

/**
 * "Start from a small set" — the inline chooser from Epic 1 FR-02, offered
 * from LB-01's empty state as well.
 *
 * INLINE, NOT A SHEET. The document says so twice ("Reveals an inline chooser
 * (not a sheet)"), and the reason holds: this is a list of examples to skim,
 * and putting it behind a scrim would make picking three things feel like a
 * commitment rather than a shortcut.
 *
 * NONE ARE PRE-SELECTED. These are suggestions, and a pre-ticked list is the
 * product deciding someone's mornings for them. Already-added examples show as
 * *Added* and cannot be picked twice.
 *
 * SET-7 reuses this component whole for FR-02; it lives here because LB-01 is
 * the first caller.
 */
export function StarterSetChooser({
  existingTitles,
  onAdded,
  onClose,
}: {
  /** Titles already in the library — those rows read *Added*. */
  existingTitles: readonly string[];
  onAdded?: (created: number) => void;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const add = trpc.habit.createFromStarterSet.useMutation();
  const [selected, setSelected] = React.useState<readonly string[]>([]);

  const already = React.useMemo(
    () => new Set(existingTitles.map((title) => title.toLowerCase())),
    [existingTitles],
  );

  function toggle(title: string): void {
    setSelected((current) =>
      current.includes(title)
        ? current.filter((value) => value !== title)
        : [...current, title],
    );
  }

  async function addSelected(): Promise<void> {
    if (selected.length === 0) return;
    const result = await add.mutateAsync({ titles: [...selected] });
    await utils.habit.list.invalidate();
    setSelected([]);
    onAdded?.(result.created);
  }

  return (
    <div className="flex flex-col gap-(--space-3)">
      <ul className="flex flex-col gap-(--space-2)">
        {STARTER_HABITS.map((habit) => {
          const added = already.has(habit.title.toLowerCase());
          const id = `starter-${habit.title.replace(/\s+/g, "-").toLowerCase()}`;

          return (
            <li
              key={habit.title}
              className="flex items-center gap-(--space-3)"
            >
              <Checkbox
                id={id}
                checked={selected.includes(habit.title)}
                disabled={added || add.isPending}
                onCheckedChange={() => {
                  toggle(habit.title);
                }}
              />
              <Label htmlFor={id} className="flex-1 flex-wrap">
                <span>{habit.title}</span>
                <Text as="span" variant="secondary" tone="secondary">
                  {COPY.suggestion(
                    habit.rangeMin,
                    habit.rangeMax,
                    habit.importance,
                  )}
                </Text>
                {habit.wakeAnchor ? <Tag>{COPY.wakeAnchorMark}</Tag> : null}
                {added ? <Tag>{COPY.added}</Tag> : null}
              </Label>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center gap-(--space-2)">
        <Button
          onClick={() => void addSelected()}
          disabled={selected.length === 0}
          busy={add.isPending}
        >
          {COPY.addSelected(selected.length)}
        </Button>
        <Button variant="ghost" onClick={onClose}>
          {COPY.close}
        </Button>
      </div>
    </div>
  );
}
