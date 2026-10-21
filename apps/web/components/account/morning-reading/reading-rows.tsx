"use client";

/**
 * Settings › Morning reading's rows (USE-151; states/list.md,
 * list-off-open.md). Props only.
 *
 * A passage row: the grip, then one button (title over its first line in
 * Newsreader, or the first line alone when untitled; D-USE-133) that opens
 * the passage, then ···. A link row: the grip, the 20 px kind glyph, the
 * title over its host at 13 px (D-USE-131, this row's own, not
 * LinkCallout's caption), then ···. An off row: title and first line,
 * faint, with "Turn on" and "Delete" under them, never ···.
 *
 * The grip carries `SortableList`'s handle; ··· is the caller's `menu`
 * (USE-152's `RowMenu`; unset, a plain ··· that opens the row). A row whose
 * menu is open is tinted (row-menu.md); a row held mid-drag is raised,
 * outlined and inset (reorder.md). Offline they wait, faint (D-USE-129).
 */
import * as React from "react";
import {
  BrandGlyph,
  cn,
  MoreIcon,
  ReorderIcon,
  SortableHandle,
  Text,
  type SortableHandleProps,
} from "@syn/ui";
import type { LinkRecord, PassageRecord } from "@syn/validators";
import { MORNING_READING_COPY as COPY } from "./copy";

const FOCUS =
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

const ICON_BUTTON = cn(
  "inline-flex size-(--target) shrink-0 items-center justify-center rounded-(--radius)",
  "text-text-secondary hover:text-ink",
  "disabled:pointer-events-none disabled:opacity-40",
  FOCUS,
);

/** The passage's first line, its Markdown marks dropped, for the row and its name. */
export function firstLineOf(bodyMd: string): string {
  const line =
    bodyMd
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l !== "") ?? "";
  return line
    .replace(/^(#{1,6}\s+|>\s*|[-*+]\s+|\d+\.\s+)/, "")
    .replace(/(\*\*|__|\*|_|`|~~)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
}

/** `open.spotify.com`, from the stored address; nothing is fetched. */
export function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}

/** What a row's grip, ··· and Off buttons name: the title, or the first line. */
export function nameOf(row: PassageRecord | LinkRecord): string {
  return "bodyMd" in row ? (row.title ?? firstLineOf(row.bodyMd)) : row.title;
}

function Grip({
  handleProps,
  name,
  waiting,
}: {
  handleProps: SortableHandleProps;
  name: string;
  waiting: boolean;
}) {
  return (
    <SortableHandle
      {...handleProps}
      aria-label={COPY.move(name)}
      className={cn(handleProps.className, waiting && "opacity-40")}
    >
      <ReorderIcon aria-hidden="true" className="size-4" />
    </SortableHandle>
  );
}

/** ··· until USE-152's menu: it opens the row, as the menu's Edit will. */
function More({
  name,
  menu,
  waiting,
  onOpen,
}: {
  name: string;
  menu?: React.ReactNode;
  waiting: boolean;
  onOpen: () => void;
}) {
  if (menu) return <>{menu}</>;
  return (
    <button
      type="button"
      aria-label={COPY.more(name)}
      disabled={waiting}
      onClick={onOpen}
      className={ICON_BUTTON}
    >
      <MoreIcon aria-hidden="true" className="size-4" />
    </button>
  );
}

const ROW = cn(
  "border-hairline flex min-h-(--row-min) min-w-0 flex-1 items-center border-b",
  "has-[[aria-expanded=true]]:bg-surface",
);

/** The lift as the board draws it: raised, outlined, inset. */
const LIFTED =
  "mx-(--space-2) rounded-(--radius) border border-border bg-surface shadow-menu";

const OPEN = cn(
  "flex min-w-0 flex-1 flex-col items-start py-(--space-2) text-start",
  "rounded-(--radius-sm)",
  FOCUS,
);

export interface ReadingRowProps<T> {
  row: T;
  handleProps: SortableHandleProps;
  /** The row's ···, from USE-152; unset, a ··· that opens the row. */
  menu?: React.ReactNode;
  /** Held mid-drag, for the `reorder` capture. */
  lifted?: boolean;
  /** Offline: the grip and ··· wait (D-USE-129). */
  waiting: boolean;
  onOpen: (row: T) => void;
}

export function PassageRow({
  row,
  handleProps,
  menu,
  lifted = false,
  waiting,
  onOpen,
}: ReadingRowProps<PassageRecord>) {
  const first = firstLineOf(row.bodyMd);
  const name = nameOf(row);
  return (
    <div className={cn(ROW, lifted && LIFTED)}>
      <Grip handleProps={handleProps} name={name} waiting={waiting} />
      <button
        type="button"
        className={OPEN}
        aria-label={row.title ? `${row.title}, ${first}` : first}
        onClick={() => onOpen(row)}
      >
        {row.title ? (
          <Text
            as="span"
            variant="body"
            weight={500}
            truncate
            className="w-full"
          >
            {row.title}
          </Text>
        ) : null}
        <Text
          as="span"
          variant="body"
          tone="muted"
          truncate
          className="w-full font-serif"
        >
          {first}
        </Text>
      </button>
      <More
        name={name}
        menu={menu}
        waiting={waiting}
        onOpen={() => onOpen(row)}
      />
    </div>
  );
}

export function LinkRow({
  row,
  handleProps,
  menu,
  lifted = false,
  waiting,
  onOpen,
}: ReadingRowProps<LinkRecord>) {
  const host = hostOf(row.url);
  return (
    <div className={cn(ROW, lifted && LIFTED)}>
      <Grip handleProps={handleProps} name={row.title} waiting={waiting} />
      <button
        type="button"
        className={cn(OPEN, "flex-row items-center gap-(--space-3)")}
        aria-label={host ? `${row.title}, ${host}` : row.title}
        onClick={() => onOpen(row)}
      >
        <BrandGlyph
          kind={row.kind === "spotify" ? "spotify" : "link"}
          className="size-5 shrink-0"
        />
        <span className="flex min-w-0 flex-1 flex-col">
          <Text as="span" variant="body" weight={500} truncate>
            {row.title}
          </Text>
          {host ? (
            <Text as="span" variant="secondary" tone="muted" truncate>
              {host}
            </Text>
          ) : null}
        </span>
      </button>
      <More
        name={row.title}
        menu={menu}
        waiting={waiting}
        onOpen={() => onOpen(row)}
      />
    </div>
  );
}

const TEXT_BUTTON = cn(
  "min-h-(--target) min-w-(--target) rounded-(--radius-sm) px-0 text-start",
  "text-ink hover:underline underline-offset-4",
  "disabled:pointer-events-none disabled:opacity-40",
  FOCUS,
);

/** An off row (list-off-open.md): faint words, Turn on and Delete in ink. */
export function OffRow({
  row,
  waiting,
  onTurnOn,
  onDelete,
}: {
  row: PassageRecord | LinkRecord;
  waiting: boolean;
  onTurnOn?: () => void;
  onDelete?: () => void;
}) {
  const name = nameOf(row);
  const passage = "bodyMd" in row;
  // A passage's first line in Newsreader; a link's host at 13 px.
  const second = passage ? firstLineOf(row.bodyMd) : hostOf(row.url);
  return (
    <li className="border-hairline flex flex-col border-b ps-(--target) pt-(--space-3) last:border-b-0">
      <div className="flex min-w-0 flex-col">
        {row.title ? (
          <Text as="span" variant="body" tone="muted" truncate>
            {row.title}
          </Text>
        ) : null}
        {second ? (
          <Text
            as="span"
            variant={passage ? "body" : "secondary"}
            tone="muted"
            truncate
            className={cn(passage && "font-serif")}
          >
            {second}
          </Text>
        ) : null}
      </div>
      <div className="flex gap-(--space-6)">
        <button
          type="button"
          className={TEXT_BUTTON}
          aria-label={COPY.turnOnRow(name)}
          disabled={waiting}
          onClick={onTurnOn}
        >
          <Text
            as="span"
            variant="secondary"
            weight={500}
            className="text-inherit"
          >
            {COPY.turnOn}
          </Text>
        </button>
        <button
          type="button"
          className={TEXT_BUTTON}
          aria-label={COPY.deleteRow(name)}
          disabled={waiting}
          onClick={onDelete}
        >
          <Text
            as="span"
            variant="secondary"
            weight={500}
            className="text-inherit"
          >
            {COPY.delete}
          </Text>
        </button>
      </div>
    </li>
  );
}
