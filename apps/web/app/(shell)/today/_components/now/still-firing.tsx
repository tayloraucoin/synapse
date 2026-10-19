"use client";

import * as React from "react";
import { useWorkClock } from "@syn/hooks";
import { Button, HueSquare, Text, toastUndo } from "@syn/ui";
import { BLOCK_HUE } from "@/components/planner";
import { WorkRow } from "@/components/work";
import { useDataSource } from "@/lib/data/source";
import { stillFiringRows } from "@/lib/data/still-firing";
import type { NowBlockView } from "@/lib/data/use-now";
import { useTodayWork, useWorkLoop } from "@/lib/data/use-today-work";
import { WORK_COPY } from "../work/copy";
import { NOW_COPY as COPY } from "./copy";

/**
 * Still firing, from Work (USE-110; interactions/firing.md step 5, D-USE-57):
 * on the next block's Now, under its header, a section with the Work colour
 * square and "Still firing, from Work", each item fired and neither brought
 * back nor done, then "Tap the mark when it's back; it waits in Primary for
 * the 13:00 Work block. Done works from here too." The mark brings it back
 * (no sound, no caption, work time stays paused); Done is the tiers' Done,
 * with its Undo. Firing keeps counting into this block; nothing reports a
 * miss. The section leaves once nothing fires.
 */
export function StillFiring({
  dateKey,
  from,
}: {
  dateKey: string;
  from: NonNullable<NowBlockView["firingFrom"]>;
}) {
  const source = useDataSource();
  const now = useWorkClock(source.now);
  const work = useTodayWork(dateKey, now);
  const loop = useWorkLoop(dateKey, work.view);
  const [said, setSaid] = React.useState("");
  const rows = work.view ? stillFiringRows(work.view) : [];
  if (rows.length === 0) {
    return (
      <p aria-live="polite" className="sr-only">
        {said}
      </p>
    );
  }
  const tier = rows.every((entry) => entry.word === rows[0]!.word)
    ? rows[0]!.word
    : null;
  const headingId = "now-still-firing";

  async function done(id: string, title: string) {
    const undo = await loop.done(id);
    if (undo) {
      toastUndo({
        text: WORK_COPY.doneToast(title),
        onUndo: () => void undo(),
      });
    }
  }

  return (
    <section
      aria-labelledby={headingId}
      data-still-firing
      className="border-hairline flex flex-col gap-(--space-2) border-b pb-(--space-3)"
    >
      <div className="flex items-center gap-(--space-2) pt-(--space-2)">
        <HueSquare hue={BLOCK_HUE.work} />
        <Text as="h3" id={headingId} variant="secondary" weight={600}>
          {COPY.stillFiring.heading(from.name)}
        </Text>
      </div>
      <ul className="flex flex-col">
        {rows.map(({ row }) => (
          <li key={row.id} className="flex items-center gap-(--space-2)">
            <WorkRow
              row={row}
              className="min-w-0 flex-1"
              onToggleFiring={(id, fire) => {
                if (fire) return;
                setSaid(WORK_COPY.saidBack(row.title));
                void loop.bringBack(id);
              }}
            />
            <Button
              variant="secondary"
              size="sm"
              aria-label={COPY.stillFiring.doneName(row.title)}
              onClick={() => void done(row.id, row.title)}
              className="shrink-0"
            >
              {COPY.stillFiring.done}
            </Button>
          </li>
        ))}
      </ul>
      <Text as="p" variant="caption" tone="muted">
        {COPY.stillFiring.line(tier, from.name, from.nextWorkAt)}
      </Text>
      <p aria-live="polite" className="sr-only">
        {said}
      </p>
    </section>
  );
}
