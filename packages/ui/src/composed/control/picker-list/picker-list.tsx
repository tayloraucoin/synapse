/**
 * PickerList — a searchable, grouped list with a trailing *New …* row
 * (v2 handoff §5.4).
 *
 * Built over CC's `SearchField` plus a real `listbox`. NO cmdk (§2.6, §12
 * call 5): cmdk brings its own focus model, its own filtering and its own
 * keyboard map, and the three places this appears need the same one the rest
 * of the product uses.
 *
 * ACTIVE-DESCENDANT, NOT ROVING FOCUS. The input keeps DOM focus the whole
 * time and `aria-activedescendant` names the highlighted option, so typing and
 * arrowing are the same gesture. Moving real focus into the list would close
 * the mobile keyboard on every arrow press.
 *
 * Filtering matches title *and* meta, because in WK-02 the meta is what
 * distinguishes two similarly named templates ("Weekday — 2 of 2").
 *
 * The create row is last and never filtered away: after a search with no
 * results, "New habit" is the only useful thing on screen.
 */
"use client";

import type { IconValue } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";
import { ItemIcon } from "../../display/item-icon";
import { SearchField } from "../search-field";

export interface PickerListItem {
  id: string;
  icon?: IconValue;
  title: string;
  meta?: React.ReactNode;
  /** The single accent dot — WK-02's most-behind template. */
  marker?: boolean;
  disabled?: boolean;
}

export interface PickerListGroup {
  heading: string;
  items: readonly PickerListItem[];
}

export interface PickerListProps {
  groups: readonly PickerListGroup[];
  value: string | null;
  onSelect: (id: string) => void;
  /** Renders a leading "None" row. */
  noneLabel?: string;
  createLabel?: string;
  onCreate?: () => void;
  /** Accessible name for the search box. */
  searchLabel: string;
  /** 'No habits match "{query}"' — the caller owns the noun. */
  emptyText: string;
  presentation?: "inline" | "popover";
  className?: string;
}

const NONE_ID = "__none__";

/** Meta can be a node; only strings are searchable, which is the honest limit. */
function metaText(meta: React.ReactNode): string {
  return typeof meta === "string" ? meta : "";
}

export function PickerList({
  groups,
  value,
  onSelect,
  noneLabel,
  createLabel,
  onCreate,
  searchLabel,
  emptyText,
  presentation = "inline",
  className,
}: PickerListProps) {
  const listId = React.useId();
  const [query, setQuery] = React.useState("");
  const [activeId, setActiveId] = React.useState<string | null>(value);

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle === "") return groups;
    return groups
      .map((group) => ({
        heading: group.heading,
        items: group.items.filter(
          (item) =>
            item.title.toLowerCase().includes(needle) ||
            metaText(item.meta).toLowerCase().includes(needle),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, query]);

  /** Flattened, in visual order — what the arrow keys walk. */
  const walkable = React.useMemo(() => {
    const ids = filtered.flatMap((group) =>
      group.items.filter((item) => item.disabled !== true).map((item) => item.id),
    );
    return noneLabel === undefined && query === "" ? ids : [NONE_ID, ...ids];
  }, [filtered, noneLabel, query]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (walkable.length === 0) return;
    const index = activeId === null ? -1 : walkable.indexOf(activeId);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveId(walkable[Math.min(walkable.length - 1, index + 1)] ?? null);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveId(walkable[Math.max(0, index - 1)] ?? null);
      return;
    }
    if (event.key === "Enter" && activeId !== null) {
      event.preventDefault();
      onSelect(activeId === NONE_ID ? "" : activeId);
    }
  };

  const optionId = (id: string) => `${listId}-${id}`;
  const isEmpty = filtered.length === 0;

  const row = (
    id: string,
    content: React.ReactNode,
    {
      selected,
      disabled = false,
    }: { selected: boolean; disabled?: boolean },
  ) => (
    <li
      key={id}
      id={optionId(id)}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      onClick={() => {
        if (!disabled) onSelect(id === NONE_ID ? "" : id);
      }}
      className={cn(
        "flex min-h-12 cursor-pointer items-center gap-(--space-3) px-(--space-3)",
        "transition-colors duration-(--dur-state) ease-(--ease-settle)",
        activeId === id && "bg-surface",
        selected && "font-medium",
        disabled && "pointer-events-none opacity-40",
      )}
    >
      {content}
    </li>
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-(--space-2)",
        presentation === "popover" &&
          "border-hairline bg-paper rounded-(--radius) border shadow-(--shadow-overlay)",
        className,
      )}
    >
      <SearchField
        aria-label={searchLabel}
        role="combobox"
        aria-expanded
        aria-controls={listId}
        aria-activedescendant={
          activeId === null ? undefined : optionId(activeId)
        }
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onClear={() => setQuery("")}
        onKeyDown={onKeyDown}
      />

      <ul
        id={listId}
        role="listbox"
        aria-label={searchLabel}
        className="divide-hairline max-h-80 divide-y overflow-y-auto"
      >
        {noneLabel === undefined
          ? null
          : row(
              NONE_ID,
              <Text as="span" variant="body" tone="secondary">
                {noneLabel}
              </Text>,
              { selected: value === null },
            )}

        {isEmpty ? (
          <li className="px-(--space-3) py-(--space-4)">
            <Text as="span" variant="secondary" tone="secondary">
              {emptyText}
            </Text>
          </li>
        ) : (
          filtered.map((group) => (
            <li key={group.heading} className="contents">
              <ul role="group" aria-label={group.heading} className="contents">
                {group.items.map((item) =>
                  row(
                    item.id,
                    <>
                      {item.icon === undefined ? null : (
                        <ItemIcon icon={item.icon} size={24} />
                      )}
                      <span className="flex min-w-0 flex-1 flex-col">
                        <Text as="span" variant="body" truncate>
                          {item.title}
                        </Text>
                        {item.meta === undefined ? null : (
                          <Text as="span" variant="caption" tone="secondary">
                            {item.meta}
                          </Text>
                        )}
                      </span>
                      {item.marker === true ? (
                        <span
                          aria-hidden="true"
                          className="bg-accent-mark size-1.5 shrink-0 rounded-full"
                        />
                      ) : null}
                    </>,
                    { selected: item.id === value, disabled: item.disabled },
                  ),
                )}
              </ul>
            </li>
          ))
        )}
      </ul>

      {createLabel === undefined || onCreate === undefined ? null : (
        <button
          type="button"
          onClick={onCreate}
          className={cn(
            "text-ink flex min-h-12 items-center px-(--space-3)",
            "text-(length:--fs-body) font-medium",
            "hover:bg-surface",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none",
          )}
        >
          {createLabel}
        </button>
      )}
    </div>
  );
}
