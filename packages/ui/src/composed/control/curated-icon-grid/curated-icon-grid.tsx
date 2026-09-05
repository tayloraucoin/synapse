/**
 * CuratedIconGrid — the curated pane of the icon picker (v2 handoff §5.4).
 *
 * Eighty-odd Lucide glyphs, grouped, each in a 44px cell, with a
 * `ColorSwatchRow` beneath for the tint. The glyph and the tint are two
 * choices because they answer different questions — what is this, and which
 * part of my life is it.
 *
 * Cells are labelled by the glyph's word, never by its Lucide name: a person
 * choosing an icon for "Read" should hear "Book", not "book-open".
 *
 * The grid reads the same table `ItemIcon` renders from
 * (`composed/display/item-icon/curated-glyphs.ts`), so a glyph a person can
 * pick is always a glyph the row can draw.
 */
"use client";

import type { CategoryKey } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";
import { CURATED_GLYPHS } from "../../display/item-icon";
import { ColorSwatchRow, type ColorSwatchValue } from "../color-swatch-row";
import { SearchField } from "../search-field";

export interface CuratedIconGridProps {
  value: string | null;
  onChange: (name: string) => void;
  colorKey: CategoryKey | null;
  onColorKeyChange: (key: CategoryKey | null) => void;
  search?: boolean;
  className?: string;
}

export function CuratedIconGrid({
  value,
  onChange,
  colorKey,
  onColorKeyChange,
  search = true,
  className,
}: CuratedIconGridProps) {
  const groupName = React.useId();
  const [query, setQuery] = React.useState("");

  const needle = query.trim().toLowerCase();
  const matches =
    needle === ""
      ? CURATED_GLYPHS
      : CURATED_GLYPHS.filter(
          (glyph) =>
            glyph.label.toLowerCase().includes(needle) ||
            glyph.group.toLowerCase().includes(needle),
        );

  const groups = React.useMemo(() => {
    const byGroup = new Map<string, typeof CURATED_GLYPHS>();
    for (const glyph of matches) {
      byGroup.set(glyph.group, [...(byGroup.get(glyph.group) ?? []), glyph]);
    }
    return [...byGroup.entries()];
  }, [matches]);

  return (
    <div className={cn("flex flex-col gap-(--space-4)", className)}>
      {search ? (
        <SearchField
          aria-label="Search icons"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery("")}
        />
      ) : null}

      {groups.length === 0 ? (
        <Text as="p" variant="secondary" tone="secondary">
          No icons match that search.
        </Text>
      ) : (
        <div
          role="radiogroup"
          aria-label="Icon"
          className="flex max-h-72 flex-col gap-(--space-3) overflow-y-auto"
        >
          {groups.map(([group, glyphs]) => (
            <div key={group} className="flex flex-col gap-(--space-1)">
              <Text as="span" variant="caption" tone="secondary">
                {group}
              </Text>
              <div className="flex flex-wrap gap-(--space-1)">
                {glyphs.map((glyph) => {
                  const { Icon } = glyph;
                  const selected = glyph.name === value;

                  return (
                    <label
                      key={glyph.name}
                      title={glyph.label}
                      className={cn(
                        "inline-flex size-(--target) cursor-pointer items-center justify-center",
                        "rounded-(--radius)",
                        "transition-colors duration-(--dur-state) ease-(--ease-settle)",
                        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                        selected
                          ? "border-ink border-2"
                          : "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                      )}
                    >
                      <input
                        type="radio"
                        name={groupName}
                        value={glyph.name}
                        checked={selected}
                        onChange={() => onChange(glyph.name)}
                        className="sr-only"
                      />
                      <Icon
                        size={20}
                        strokeWidth={1.75}
                        aria-hidden="true"
                        className="text-text-body"
                      />
                      <span className="sr-only">{glyph.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <ColorSwatchRow
        label="Colour"
        allowNone
        value={colorKey ?? "none"}
        onChange={(next: ColorSwatchValue) =>
          onColorKeyChange(
            next === "none" || next === null ? null : (next as CategoryKey),
          )
        }
      />
    </div>
  );
}
