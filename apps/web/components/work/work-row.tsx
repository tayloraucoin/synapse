"use client";

import * as React from "react";
import {
  Checkbox,
  cn,
  DisclosureIcon,
  DoneIcon,
  FiringToggle,
  Text,
} from "@syn/ui";
import { ClientTile } from "./client-tile";
import { WORK_PARTS_COPY } from "./copy";
import { PriorityChip } from "./priority-chip";
import type { WorkRowHandlers, WorkRowView } from "./view";

/**
 * WorkRow — a work item on Today, Now and the opened day (USE-10; anatomy in
 * Today's index, the firing and done forms in its working state).
 *
 * A 44 × 44 lead slot (the 10 px ring, the firing mark in its halo, or the
 * done mark); the emoji in its own 18 px slot, 7 px gap (D-USE-48); the
 * title; the meta; the length range, the firing words or the Done record on
 * the right. Four forms:
 *
 * - idle: hover shades `surface` (D-USE-49).
 * - next: shaded `surface` at rest, no border, 12 px vertical padding, the
 *   size chip on `background` inside the shade (D-USE-45, D-USE-49).
 * - firing: rust on grey, never verdigris; the title muted, the meta at 60 %,
 *   "firing · n min" in `firing-text`, two lines on the phone (D-USE-49,
 *   D-USE-51).
 * - done: the done mark, the title receded, the meta trimmed to client,
 *   project and ID, "Took … · fired …" right at the desk and under the title
 *   on the phone (D-USE-48, D-USE-51). Faded, never disabled (P-A07).
 *
 * The phone trims the meta to the tile, project emoji, ID, priority and size
 * (D-USE-51); the desk adds the names, labels and session. One tree, switched
 * in CSS at `split:`. Props only: it prints what it is given.
 */
export interface WorkRowProps extends WorkRowHandlers {
  row: WorkRowView;
  className?: string;
}

const CHIP =
  "inline-flex h-5 shrink-0 items-center gap-(--space-1) rounded-(--radius-control) px-1.5 text-(length:--fs-caption) leading-none";

export function WorkRow({
  row,
  onToggleFiring,
  onOpen,
  onToggleSubIssue,
  className,
}: WorkRowProps) {
  const [subOpen, setSubOpen] = React.useState(false);
  const firing = row.form === "firing";
  const done = row.form === "done";
  const next = row.form === "next";
  const subListId = `${row.id}-sub-issues`;

  return (
    <div
      data-work-row={row.id}
      data-form={row.form}
      className={cn(
        "group/row flex items-start rounded-(--radius-control) pe-(--space-2)",
        "transition-colors duration-(--dur-state) ease-(--ease-settle)",
        next ? "bg-surface py-(--space-3)" : "hover:bg-surface",
        className,
      )}
    >
      <div className="flex size-(--target) shrink-0 items-center justify-center">
        {done ? (
          <span
            aria-hidden="true"
            data-done-mark
            className="bg-muted-foreground text-background inline-flex size-4 items-center justify-center rounded-full"
          >
            <DoneIcon className="size-3" strokeWidth={3} />
          </span>
        ) : (
          <FiringToggle
            pressed={firing}
            onPressedChange={(nextPressed) =>
              onToggleFiring?.(row.id, nextPressed)
            }
            label={
              firing
                ? WORK_PARTS_COPY.bringBack(row.title)
                : WORK_PARTS_COPY.fire(row.title)
            }
            disabled={onToggleFiring === undefined}
            className="disabled:cursor-default disabled:opacity-100"
          />
        )}
      </div>

      <div className="min-w-0 flex-1 py-(--space-2)">
        <button
          type="button"
          onClick={() => onOpen?.(row.id)}
          className="flex w-full cursor-pointer items-start gap-1.75 text-start"
        >
          <span
            aria-hidden="true"
            className="font-emoji inline-flex h-(--lh-body) w-4.5 shrink-0 items-center justify-center text-(length:--fs-body) leading-none"
          >
            {row.emoji}
          </span>
          <Text
            as="span"
            variant="body"
            tone={firing || done ? "muted" : "ink"}
            className="min-w-0"
          >
            {row.title}
          </Text>
          {done ? (
            <span className="sr-only">{`, ${WORK_PARTS_COPY.done}`}</span>
          ) : null}
        </button>

        <WorkRowMeta row={row} />

        {row.subIssues && !done ? (
          <div>
            <button
              type="button"
              aria-expanded={subOpen}
              aria-controls={subListId}
              onClick={() => setSubOpen((open) => !open)}
              className="split:hidden text-muted-foreground inline-flex min-h-8 cursor-pointer items-center gap-(--space-1) text-(length:--fs-caption)"
            >
              <DisclosureIcon
                aria-hidden="true"
                className={cn(
                  "size-3.5 transition-transform duration-(--dur-state)",
                  subOpen && "rotate-90",
                )}
              />
              {row.subIssues.summary}
            </button>
            <ul
              id={subListId}
              aria-label={WORK_PARTS_COPY.subIssues(row.title)}
              className={cn(
                "split:flex flex-col gap-(--space-1) pt-(--space-1)",
                subOpen ? "flex" : "hidden",
              )}
            >
              {row.subIssues.items.map((sub) => (
                <li key={sub.id}>
                  <label className="flex min-h-8 cursor-pointer items-center gap-(--space-2)">
                    <Checkbox
                      checked={sub.done}
                      onCheckedChange={(checked) =>
                        onToggleSubIssue?.(row.id, sub.id, checked === true)
                      }
                    />
                    <Text
                      as="span"
                      variant="secondary"
                      tone={sub.done ? "muted" : "ink"}
                    >
                      {sub.title}
                    </Text>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <WorkRowRight row={row} />
    </div>
  );
}

function Separator({ deskOnly = false }: { deskOnly?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn("text-muted-foreground", deskOnly && "split:inline hidden")}
    >
      ·
    </span>
  );
}

function WorkRowMeta({ row }: { row: WorkRowView }) {
  const firing = row.form === "firing";
  const done = row.form === "done";
  const next = row.form === "next";
  const chipFill = next
    ? "bg-background"
    : "bg-surface group-hover/row:bg-background";

  return (
    <div
      data-work-meta
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-x-(--space-2) gap-y-(--space-1) pt-(--space-1) text-(length:--fs-caption) leading-(--lh-caption)",
        firing && "opacity-60",
      )}
    >
      {row.client ? (
        <span className="inline-flex items-center gap-(--space-1)">
          <ClientTile letter={row.client.letter} hue={row.client.hue} />
          <span className="split:inline hidden">{row.client.name}</span>
          <span className="sr-only split:hidden">{row.client.name}</span>
        </span>
      ) : null}
      {row.client && row.project ? <Separator deskOnly /> : null}
      {row.project ? (
        <span className="inline-flex items-center gap-(--space-1)">
          {row.project.emoji ? (
            <span aria-hidden="true" className="font-emoji leading-none">
              {row.project.emoji}
            </span>
          ) : null}
          <span className="split:inline hidden">{row.project.name}</span>
        </span>
      ) : null}
      {row.project && (row.identifier || row.noLinear) ? (
        <Separator deskOnly />
      ) : null}
      {row.identifier ? (
        <span className="tabular-nums">{row.identifier}</span>
      ) : null}
      {done ? (
        row.doneRecord ? (
          <span className="split:hidden inline-flex items-center gap-(--space-2)">
            <Separator />
            <span className="text-foreground">{row.doneRecord}</span>
          </span>
        ) : null
      ) : (
        <>
          {row.priority ? (
            <PriorityChip level={row.priority.level} word={row.priority.word} />
          ) : null}
          {row.size ? (
            <span className={cn(CHIP, "text-foreground", chipFill)}>
              {row.size}
            </span>
          ) : null}
          {row.labels.map((label) => (
            <span
              key={label.name}
              className={cn(
                CHIP,
                "border-border text-foreground split:inline-flex hidden border",
              )}
            >
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full"
                style={{ backgroundColor: label.color }}
              />
              {label.name}
            </span>
          ))}
          {row.noLinear ? <span>{row.noLinear}</span> : null}
          {row.session ? <span>{row.session}</span> : null}
          {row.worked ? <span>{row.worked}</span> : null}
        </>
      )}
    </div>
  );
}

function WorkRowRight({ row }: { row: WorkRowView }) {
  if (row.form === "firing" && row.firing)
    return (
      <p
        data-firing-words
        className="text-firing-text split:flex-row split:gap-(--space-1) m-0 flex w-21 split:w-auto shrink-0 flex-col items-end pt-(--space-2) text-end text-(length:--fs-label) leading-(--lh-label) tabular-nums"
      >
        <span>{row.firing.word}</span>
        <span aria-hidden="true" className="split:inline hidden">
          ·
        </span>
        <span>{row.firing.time}</span>
      </p>
    );
  if (row.form === "done" && row.doneRecord)
    return (
      <p className="text-muted-foreground split:block m-0 hidden shrink-0 pt-(--space-2) text-end text-(length:--fs-label) leading-(--lh-label) tabular-nums">
        {row.doneRecord}
      </p>
    );
  if (row.length && row.form !== "done")
    return (
      <p className="text-muted-foreground m-0 shrink-0 pt-(--space-2) text-end text-(length:--fs-label) leading-(--lh-label) tabular-nums">
        {row.length}
      </p>
    );
  return null;
}
