/**
 * StateWord — the one-word state in a row (v2 handoff §5.6).
 *
 * One slot, one word. The slot is also where a 5-second inline undo appears
 * after a destructive-feeling toggle, which is why `undo` lives here and not
 * in the row's trailing cluster: a person's eye is already on the word that
 * just changed.
 *
 * COLOUR NEVER ALONE (official spec §9.3). The word carries the state; the
 * tint and the dot only reinforce it. `now` and `soon` are the only kinds that
 * take the accent dot, because the accent means *this moment* — and nothing
 * else in the product may borrow it.
 */
"use client";

import type { StateWordKind } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import {
  STATE_WORDS,
  STATE_WORDS_WITH_DOT,
  STATE_WORDS_WITH_TEXT,
} from "./copy";

const TONE: Record<StateWordKind, string> = {
  now: "text-accent-text",
  soon: "text-accent-text",
  open: "text-accent-text",
  closing: "text-accent-text",
  moved: "text-violet-text",
  from: "text-text-secondary",
  "not-today": "text-text-secondary",
  "add-unit": "text-text-secondary",
  updated: "text-text-secondary",
  pending: "text-text-secondary",
  archived: "text-text-secondary",
  "confirm-later": "text-text-secondary",
  opener: "text-text-secondary",
  closer: "text-text-secondary",
};

export interface StateWordProps {
  kind: StateWordKind;
  /** Completes the phrase — "from Thu", "add pages". */
  text?: string;
  withDot?: boolean;
  /** The 5-second inline undo occupies this slot. */
  undo?: { label: string; onUndo: () => void };
  className?: string;
}

export function StateWord({
  kind,
  text,
  withDot = false,
  undo,
  className,
}: StateWordProps) {
  if (undo !== undefined) {
    return (
      <button
        type="button"
        onClick={undo.onUndo}
        className={cn(
          "text-ink shrink-0 text-(length:--fs-caption) font-medium",
          "underline-offset-4 hover:underline",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          className,
        )}
      >
        {undo.label}
      </button>
    );
  }

  const word = STATE_WORDS[kind];
  const phrase =
    STATE_WORDS_WITH_TEXT.includes(kind) && text !== undefined
      ? `${word} ${text}`
      : word;
  const dot = withDot && STATE_WORDS_WITH_DOT.includes(kind);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-(--space-1)",
        "text-(length:--fs-caption) leading-(--lh-caption) font-medium",
        TONE[kind],
        className,
      )}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className="bg-accent-mark size-1.5 rounded-full"
        />
      ) : null}
      {phrase}
    </span>
  );
}
