"use client";

import * as React from "react";
import { Text } from "@syn/ui";
import { ADD_EVENT_COPY, EventPopover } from "@/components/planner/add-event";
import { useDataSource } from "@/lib/data/source";
import { usePlannerWrites } from "@/lib/data/use-planner-writes";
import { useOpeningWeek } from "@/lib/data/use-week";
import { AboveFooterToaster, useUndoToast } from "@/lib/hooks/use-undo-toast";

/**
 * USE-53's desk popover on `/dev/parts?state=event-popover`, until the
 * Week's day heads mount it: a day head with its "+ Event", the popover open
 * under it with the scenario's fields. Add writes through the fixtures and
 * names where it landed, with Undo.
 */
export function EventPopoverPart() {
  const { scenario } = useDataSource();
  const start = scenario.setUp;
  const writes = usePlannerWrites();
  const { thisWeek } = useOpeningWeek();
  const undoToast = useUndoToast();
  const [open, setOpen] = React.useState(false);
  // Opened after mount, so the server and the first paint agree.
  React.useEffect(() => setOpen(true), []);
  const day = start?.day ?? 2;
  // The scenario's This week is 12 to 18 October.
  const date = `2026-10-${12 + day}`;

  return (
    <div className="flex min-h-dvh flex-col gap-(--space-4) p-(--space-8)">
      <div className="flex items-center gap-(--space-2)">
        <Text as="span" variant="body" weight={600}>
          {`Wed ${12 + day} ›`}
        </Text>
        <EventPopover
          open={open}
          onOpenChange={setOpen}
          target={{ week: thisWeek, day }}
          start={start?.event ?? { startsAt: "14:00" }}
          onDone={({ words, undo }) =>
            undoToast({ text: words, onUndo: () => void writes.undo(undo) })
          }
          trigger={
            <button
              type="button"
              aria-label={ADD_EVENT_COPY.plusEventName(day, date)}
              className="border-ink focus-visible:ring-ring inline-flex h-7 items-center rounded-(--radius-control) border px-(--space-2) text-(length:--fs-caption) outline-none focus-visible:ring-2"
            >
              {ADD_EVENT_COPY.plusEvent}
            </button>
          }
        />
      </div>
      <div className="mt-auto max-w-sm">
        <AboveFooterToaster />
      </div>
    </div>
  );
}
