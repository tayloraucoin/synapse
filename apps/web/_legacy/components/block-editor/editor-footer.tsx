"use client";

import * as React from "react";

import { Button, Text } from "@syn/ui";
import type { BlockKind } from "@syn/types";

import { BLOCK_EDITOR_COPY as COPY } from "./copy";
import { clockLabel, type WalkResult } from "./use-block-editor";

/**
 * The footer — UX v1.1 §3.11: "*7:03 – 8:15 · 72 min · 0 min slack*", and
 * when the stack runs past its bound, "*runs 8 min past work · 9:08*" in
 * muted text: a number, never a colour and never a clamp (R7, R21). *Show the
 * arithmetic* opens the one sentence that explains where the numbers came
 * from.
 *
 * A placeable kind has no clocks, so the footer is the total alone.
 */

export interface EditorFooterProps {
  kind: BlockKind;
  walk: WalkResult | null;
}

export function EditorFooter({ kind, walk }: EditorFooterProps) {
  const [showing, setShowing] = React.useState(false);

  if (walk === null) return null;

  const timed = walk.startMin !== null && walk.endMin !== null && walk.anchorMin !== null;
  const boundWord = COPY.boundWord(kind);

  const line = !timed
    ? COPY.footerNoClocks(walk.totalMin)
    : walk.overrunMin > 0 && walk.boundMin !== null
      ? COPY.overrun(walk.overrunMin, boundWord, clockLabel(walk.endMin as number))
      : COPY.footer(
          clockLabel(walk.startMin as number),
          clockLabel(walk.endMin as number),
          walk.totalMin,
          walk.slackMin,
        );

  const anchorWord = kind === "prep" || kind === "wind_down" ? "Ends at" : "Starts at";

  return (
    <div className="border-hairline flex flex-col gap-(--space-1) border-t pt-(--space-3)">
      <div className="flex items-baseline justify-between gap-(--space-3)">
        <Text as="p" variant="caption" tone="secondary" className="tabular-nums">
          {line}
        </Text>
        {timed && walk.boundMin !== null ? (
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={showing}
            onClick={() => setShowing((value) => !value)}
          >
            {COPY.showArithmetic}
          </Button>
        ) : null}
      </div>
      {showing && timed && walk.boundMin !== null ? (
        <Text as="p" variant="caption" tone="secondary">
          {COPY.arithmetic(
            anchorWord,
            clockLabel(walk.anchorMin as number),
            walk.totalMin,
            boundWord,
            clockLabel(walk.boundMin),
          )}
        </Text>
      ) : null}
    </div>
  );
}
