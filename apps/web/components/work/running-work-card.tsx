"use client";

import {
  Button,
  cn,
  CountdownFace,
  FiringToggle,
  Text,
  type CountdownOverLevel,
} from "@syn/ui";
import { WORK_PARTS_COPY } from "./copy";
import type { WorkRowView } from "./view";
import { WorkRowMeta } from "./work-row";

/**
 * RunningWorkCard — the item in hand inside a Work block (USE-59; Today's
 * running, paused and over-the-range states): Start turned Next's card into
 * this in its own tier and place. A 1.5 px verdigris edge while work time
 * runs (Taylor's hands, D-USE-49), the hairline when its own Pause holds it.
 * The ring, the 22 px emoji and title, the meta; then WORK TIME, the clock
 * and its line; then Pause (or Resume), Prompt sent (grey with a clay edge
 * and dot, dark rust words: waiting on AI) and Done in ink.
 *
 * Phone: the clock over the buttons at 84 / fill / 84 (D-USE-51). From 768
 * the buttons sit right of the clock. Every figure is the caller's, read at
 * the page's one tick from the derived clock; the card counts nothing.
 */
export interface RunningWorkCardProps {
  row: WorkRowView;
  figures: {
    label: string;
    figure: string;
    over: { word: string; level: CountdownOverLevel } | null;
    line: string;
    held: boolean;
  };
  words: {
    pause: string;
    resume: string;
    promptSent: string;
    done: string;
    doneName: string;
    /** The card's name: "<title>, in hand". */
    label: string;
  };
  onPause?: () => void;
  onResume?: () => void;
  onPromptSent?: () => void;
  onDone?: () => void;
  onOpen?: (id: string) => void;
  className?: string;
}

const LABEL_TONE: Record<CountdownOverLevel, string> = {
  ink: "text-foreground",
  warning: "text-warning-text",
  danger: "text-destructive-text",
};

export function RunningWorkCard({
  row,
  figures,
  words,
  onPause,
  onResume,
  onPromptSent,
  onDone,
  onOpen,
  className,
}: RunningWorkCardProps) {
  const { held, over } = figures;
  return (
    <div
      role="group"
      aria-label={words.label}
      data-running-work-card={held ? "paused" : "running"}
      className={cn(
        "bg-background flex flex-col gap-(--space-3) rounded-(--radius-sheet) border-[1.5px] py-(--space-3) pe-(--space-4)",
        held ? "border-border" : "border-accent-mark",
        className,
      )}
    >
      <div className="flex items-start">
        <div className="flex size-(--target) shrink-0 items-center justify-center">
          <FiringToggle
            pressed={false}
            onPressedChange={() => onPromptSent?.()}
            label={WORK_PARTS_COPY.fire(row.title)}
            disabled={onPromptSent === undefined}
            className="disabled:cursor-default disabled:opacity-100"
          />
        </div>
        <div className="min-w-0 flex-1 pt-(--space-2)">
          <button
            type="button"
            data-open
            onClick={() => onOpen?.(row.id)}
            className="flex w-full cursor-pointer items-start gap-(--space-2) text-start"
          >
            <span
              aria-hidden="true"
              className="font-emoji inline-flex h-(--lh-heading) w-5.5 shrink-0 items-center justify-center text-(length:--fs-title) leading-none"
            >
              {row.emoji}
            </span>
            <Text as="span" variant="heading" weight={500} className="min-w-0">
              {row.title}
            </Text>
          </button>
          <WorkRowMeta row={row} />
        </div>
      </div>

      <div className="wide:flex-row wide:items-end wide:justify-between flex flex-col gap-(--space-3) ps-(--space-3)">
        <div className="flex flex-col gap-(--space-1)">
          <Text
            as="p"
            variant="caption"
            weight={600}
            className={cn(
              "tracking-widest uppercase",
              held
                ? "text-muted-foreground"
                : over
                  ? LABEL_TONE[over.level]
                  : "text-accent-text",
            )}
          >
            {figures.label}
          </Text>
          <CountdownFace
            figure={figures.figure}
            over={over}
            className={held ? "text-muted-foreground" : undefined}
          />
          <Text
            as="p"
            variant="caption"
            tone="muted"
            className="pt-(--space-1) tabular-nums"
          >
            {figures.line}
          </Text>
        </div>
        <div className="flex gap-(--space-2)">
          <Button
            variant="secondary"
            size="lg"
            onClick={held ? onResume : onPause}
            className="bg-background wide:w-28 w-21 px-(--space-2)"
          >
            {held ? words.resume : words.pause}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={onPromptSent}
            className="bg-surface text-firing-text border-category-clay-dot hover:bg-surface wide:w-38 wide:flex-none min-w-0 flex-1 px-(--space-2)"
          >
            <span
              aria-hidden="true"
              className="bg-category-clay-dot size-2 rounded-full"
            />
            {words.promptSent}
          </Button>
          <Button
            size="lg"
            aria-label={words.doneName}
            onClick={onDone}
            className="wide:w-28 w-21 px-(--space-2)"
          >
            {words.done}
          </Button>
        </div>
      </div>
    </div>
  );
}
