"use client";

import * as React from "react";
import { NEW_BLOCK_KINDS } from "@syn/constants";
import { cn, Text } from "@syn/ui";
import { BLOCK_HUE, HUE_CHIP, HUE_DOT, type BlockHue } from "../block-hue";
import { NEW_BLOCK_COPY as COPY } from "./copy";
import { KIND_WORDS, type NewBlockKind } from "./form";

/**
 * KindPicker (USE-46; D-USE-34): the seven kinds as one radio group "Kind",
 * each a 36 px pill with its colour dot and its word, so colour is never
 * alone. The picked chip takes its kind's soft fill and edge. Native radios,
 * so the arrow keys move the pick. They wrap to a first line and a half.
 */

/** The kind's edge: its dot colour, as a border. Whole names for Tailwind. */
const HUE_EDGE: Record<BlockHue, string> = {
  leaf: "border-category-leaf-dot",
  sky: "border-category-sky-dot",
  clay: "border-category-clay-dot",
  rose: "border-category-rose-dot",
  amber: "border-category-amber-dot",
  slate: "border-category-slate-dot",
  plum: "border-category-plum-dot",
  moss: "border-category-moss-dot",
  yellow: "border-category-yellow-dot",
};

export interface KindPickerProps {
  value: NewBlockKind;
  onChange: (kind: NewBlockKind) => void;
}

export function KindPicker({ value, onChange }: KindPickerProps) {
  const name = React.useId();
  const labelId = React.useId();
  return (
    <div className="flex flex-col gap-(--space-2) pb-(--space-3)">
      <Text as="span" id={labelId} variant="secondary" tone="secondary">
        {COPY.kind}
      </Text>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="flex flex-wrap gap-(--space-2)"
      >
        {NEW_BLOCK_KINDS.map((kind) => {
          const hue = BLOCK_HUE[kind];
          const picked = kind === value;
          return (
            <label
              key={kind}
              className={cn(
                "inline-flex h-9 cursor-pointer items-center gap-(--space-2) rounded-full border px-(--space-3)",
                "text-(length:--fs-secondary) text-ink",
                "focus-within:ring-ring focus-within:ring-2 focus-within:ring-offset-2",
                "transition-colors duration-(--dur-state) ease-(--ease-settle)",
                picked ? [HUE_CHIP[hue], HUE_EDGE[hue]] : "border-hairline",
              )}
            >
              <input
                type="radio"
                name={name}
                value={kind}
                checked={picked}
                onChange={() => onChange(kind)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={cn("size-2 shrink-0 rounded-full", HUE_DOT[hue])}
              />
              {KIND_WORDS[kind]}
            </label>
          );
        })}
      </div>
    </div>
  );
}
