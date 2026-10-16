"use client";

import * as React from "react";
import { Button, ChecklistIcon, cn, Input, Text, TimeField } from "@syn/ui";
import type { ReviewAllDay } from "@/lib/data/use-review-day";
import { REVIEW_CHECKLIST_COPY as COPY } from "./checklist-copy";

/**
 * Making the checklist (USE-40; review-the-day/states/
 * sunday-making-the-checklist.md): the list glyph and the day's name, then
 * "Checklist · all day" with Set a time; each kept row on a hairline with
 * its box; the row being typed with a dashed box and an ink underline; the
 * helper line under it.
 *
 * RETURN KEEPS FOCUS. The typed row is one field that never unmounts:
 * Return hands its words up, empties it and leaves the caret where it was,
 * so the next row is already open (C-USE-review-the-day-sunday-making-the-
 * checklist-1). An empty Return makes nothing.
 *
 * Set a time opens a start and an end in place [ASSUMPTION: no board draws
 * the picker; 10:00 to 13:00 to start, as the Now checklist board]; Set
 * gives the block that span and it moves onto the rail.
 *
 * The kept rows' boxes are marks here [ASSUMPTION]: checking is Now's and
 * the strip's, and dragging to reorder is Block view's ticket.
 */
export interface ChecklistEditorProps {
  checklist: ReviewAllDay;
  /** Words already in the typed row (a scenario's capture). */
  initialDraft?: string;
  onAdd: (title: string) => void;
  onSpan: (startsAt: string, endsAt: string) => void;
  pending: boolean;
}

/** The New block sheet's name limit [ASSUMPTION: a row is named like an item]. */
const ROW_MAX = 80;

export function ChecklistEditor({
  checklist,
  initialDraft = "",
  onAdd,
  onSpan,
  pending,
}: ChecklistEditorProps) {
  const [draft, setDraft] = React.useState(initialDraft);
  const [timing, setTiming] = React.useState(false);
  const [startsAt, setStartsAt] = React.useState<string>(
    COPY.defaultSpan.startsAt,
  );
  const [endsAt, setEndsAt] = React.useState<string>(COPY.defaultSpan.endsAt);
  const fieldRef = React.useRef<HTMLInputElement>(null);
  const helperId = React.useId();

  React.useEffect(() => {
    fieldRef.current?.focus();
  }, []);

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const title = draft.trim();
    if (title === "") return;
    onAdd(title);
    setDraft("");
  }

  return (
    <section
      data-checklist-editor
      aria-label={COPY.region(checklist.name)}
      className="flex flex-col px-(--space-4) pt-(--space-4)"
    >
      <div className="flex items-center gap-(--space-2)">
        <ChecklistIcon aria-hidden="true" className="size-5 shrink-0" />
        <Text as="h2" variant="heading">
          {checklist.name}
        </Text>
      </div>
      <div className="flex items-center gap-(--space-2) pb-(--space-2)">
        <Text as="span" variant="caption" tone="muted">
          {COPY.allDay}
        </Text>
        <button
          type="button"
          aria-expanded={timing}
          onClick={() => setTiming((open) => !open)}
          className="flex min-h-(--target) items-center text-(length:--fs-caption) font-medium text-link focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {COPY.setTime}
        </button>
      </div>

      {timing ? (
        <div className="flex flex-col gap-(--space-3) border-t border-hairline py-(--space-3)">
          <TimeField
            label={COPY.starts}
            value={startsAt}
            onChange={setStartsAt}
          />
          <TimeField
            label={COPY.ends}
            value={endsAt}
            min={startsAt}
            onChange={setEndsAt}
          />
          <Button
            variant="secondary"
            className="self-start"
            disabled={pending || endsAt <= startsAt}
            onClick={() => onSpan(startsAt, endsAt)}
          >
            {COPY.set}
          </Button>
        </div>
      ) : null}

      <ul className="flex flex-col">
        {checklist.rows.map((row) => (
          <li
            key={row.id}
            className="flex min-h-(--target) items-center gap-(--space-3) border-t border-hairline"
          >
            <span
              aria-hidden="true"
              className={cn(
                "size-5 shrink-0 rounded-(--radius) border border-input",
                row.checked ? "bg-input" : "bg-paper",
              )}
            />
            <Text
              as="span"
              variant="body"
              truncate
              className={row.checked ? "text-muted-foreground" : undefined}
            >
              {row.label}
              {row.checked ? (
                <span className="sr-only">, {COPY.done}</span>
              ) : null}
            </Text>
          </li>
        ))}
      </ul>

      <div className="flex min-h-(--target) items-center gap-(--space-3) border-t border-b border-hairline border-b-foreground">
        <span
          aria-hidden="true"
          className="size-5 shrink-0 rounded-(--radius) border border-dashed border-input"
        />
        <Input
          ref={fieldRef}
          value={draft}
          maxLength={ROW_MAX}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          aria-label={COPY.field}
          aria-describedby={helperId}
          enterKeyHint="next"
          classes={{ root: "min-w-0 flex-1" }}
          // The row's own underline is the field's edge.
          className="rounded-none border-0 bg-transparent px-0 hover:border-0"
        />
      </div>
      <Text
        as="p"
        id={helperId}
        variant="caption"
        tone="muted"
        className="pt-(--space-3)"
      >
        {COPY.helper}
      </Text>
    </section>
  );
}
