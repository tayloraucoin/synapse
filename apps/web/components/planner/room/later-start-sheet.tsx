"use client";

import * as React from "react";
import type { StoredBlockKind } from "@syn/types";
import { Button, Checkbox, cn, ExpandIcon, LockedIcon, Text } from "@syn/ui";
import { clockFromMinutes } from "@syn/utils";
import type {
  CutBlock,
  CutView,
  LaterStartAsk,
  LaterStartTab,
  SlideView,
} from "@/lib/data/room";
import { BLOCK_HUE, HUE_DOT } from "../block-hue";
import { clockLabel } from "../day-column/copy";
import { ROOM_COPY } from "./copy";
import { RoomSheetFrame } from "./room-sheet-frame";

const COPY = ROOM_COPY.later;

/**
 * A later start (USE-41; later-start/states/cut-some.md, slide.md): opened
 * once over Review the day when Orient opened 15 minutes or more past Up
 * at. "Up at 8:10 · planned from 7:00", never the second person, nothing
 * marked missed.
 *
 * CUT SOME lists the blocks from after Orient, two at a time: each with its
 * span and "Cut the block", then its items with their lengths, a ticked one
 * struck through; an item with a shorter one in its library links to the
 * Item sheet's Swap; a block's drives are one italic line, as they go with
 * the workout. The foot is the engine's: what is cut of the shortfall and
 * where the next blocks land.
 *
 * SLIDE THE DAY BACK lists each block's old start struck through beside its
 * new one, a set time that stays where it is with the block that splits
 * around it, and where the day now ends.
 *
 * Not now and × write nothing: the late frame stays as drawn.
 */
export interface LaterStartSheetProps {
  open: boolean;
  ask: LaterStartAsk | null;
  tab: LaterStartTab;
  onTab: (tab: LaterStartTab) => void;
  cut: CutView | null;
  slide: SlideView | null;
  onToggle: (id: string) => void;
  onToggleBlock: (blockId: string) => void;
  onShowMore: () => void;
  /** Whether an item's library holds a shorter one: its Swap link shows. */
  canSwap: (itemId: string) => boolean;
  /** To the Item sheet's Swap on that item. */
  onSwap: (itemId: string) => void;
  onApply: () => void;
  onClose: () => void;
}

function ShowLater({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      className="text-ink -ms-(--space-3) h-(--target) gap-(--space-2) self-start"
      onClick={onClick}
    >
      <ExpandIcon aria-hidden="true" className="size-4" />
      {COPY.showLater}
    </Button>
  );
}

function CutGroup({
  block,
  onToggle,
  onToggleBlock,
  canSwap,
  onSwap,
}: {
  block: CutBlock;
  onToggle: (id: string) => void;
  onToggleBlock: (blockId: string) => void;
  canSwap: (itemId: string) => boolean;
  onSwap: (itemId: string) => void;
}) {
  const headId = React.useId();
  return (
    <section aria-labelledby={headId} className="flex flex-col">
      <div className="border-hairline flex min-h-(--target) items-center gap-(--space-2) border-b">
        <Text
          as="h3"
          id={headId}
          variant="secondary"
          weight={600}
          className="flex-1"
        >
          {COPY.blockHead(block.name, block.startsAt, block.endsAt)}
        </Text>
        <Button
          variant="ghost"
          size="sm"
          className="text-link -me-(--space-2)"
          aria-pressed={block.allTicked}
          aria-label={COPY.cutBlockLabel(block.name)}
          onClick={() => onToggleBlock(block.id)}
        >
          {COPY.cutBlock}
        </Button>
      </div>
      <ul className="flex flex-col">
        {block.rows.map((row) => {
          const id = `cut-${row.id}`;
          const swap = row.eligible && canSwap(row.id);
          return (
            <li
              key={row.id}
              className="flex min-h-(--target) items-center gap-(--space-3)"
            >
              <Checkbox
                id={id}
                checked={row.ticked}
                disabled={!row.eligible}
                onCheckedChange={() => onToggle(row.id)}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <label
                  htmlFor={id}
                  className={cn(
                    "flex min-h-(--target) cursor-pointer items-center justify-between gap-(--space-2)",
                    !row.eligible && "cursor-default",
                  )}
                >
                  <Text
                    as="span"
                    tone={row.ticked ? "muted" : "body"}
                    className={cn(row.ticked && "line-through")}
                    truncate
                  >
                    {row.title}
                  </Text>
                  <Text as="span" variant="secondary" tone="muted" tabular>
                    {ROOM_COPY.length(row.lengthMin)}
                  </Text>
                </label>
                {swap ? (
                  <button
                    type="button"
                    onClick={() => onSwap(row.id)}
                    className="text-muted-foreground -mt-(--space-2) min-h-6 cursor-pointer self-start text-(length:--fs-caption) underline-offset-2 hover:underline"
                  >
                    {COPY.swap} ›
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      {block.travel ? (
        <Text as="p" tone="muted" className="py-(--space-2) ps-8 italic">
          {COPY.travel(block.travel.count, block.travel.with)}
        </Text>
      ) : null}
    </section>
  );
}

function SlideList({
  slide,
  onShowMore,
}: {
  slide: SlideView;
  onShowMore: () => void;
}) {
  return (
    <div className="flex flex-col">
      <Text
        as="h3"
        variant="secondary"
        weight={600}
        className="border-hairline border-b pb-(--space-2)"
      >
        {COPY.slideHead(slide.minutes)}
      </Text>
      <ul className="flex flex-col">
        {slide.rows.map((row) => (
          <li
            key={row.id}
            aria-label={COPY.slideRow(row.name, row.from, row.to)}
            className="border-hairline flex min-h-(--target) items-center gap-(--space-3) border-b"
          >
            <span
              aria-hidden="true"
              className={cn(
                "h-5 w-0.75 shrink-0 rounded-full",
                HUE_DOT[BLOCK_HUE[row.kind as StoredBlockKind]],
              )}
            />
            <Text as="span" className="flex-1" aria-hidden="true">
              {row.name}
            </Text>
            <Text
              as="span"
              variant="secondary"
              tone="muted"
              tabular
              className="line-through"
              aria-hidden="true"
            >
              {clockLabel(row.from)}
            </Text>
            <Text
              as="span"
              weight={600}
              tabular
              className="w-12 text-end"
              aria-hidden="true"
            >
              {clockLabel(row.to)}
            </Text>
          </li>
        ))}
        {slide.setTimes.map((held) => (
          <li
            key={held.id}
            className="border-hairline flex min-h-(--target) items-start gap-(--space-3) border-b py-(--space-2)"
          >
            <LockedIcon
              aria-hidden="true"
              className="text-ink mt-1 size-3.5 shrink-0"
            />
            <div className="flex min-w-0 flex-col">
              <Text as="span">{held.title}</Text>
              <Text as="span" variant="caption" tone="muted">
                {COPY.setTime(held.at, held.block)}
              </Text>
            </div>
          </li>
        ))}
      </ul>
      {slide.more ? <ShowLater onClick={onShowMore} /> : null}
    </div>
  );
}

export function LaterStartSheet({
  open,
  ask,
  tab,
  onTab,
  cut,
  slide,
  onToggle,
  onToggleBlock,
  onShowMore,
  canSwap,
  onSwap,
  onApply,
  onClose,
}: LaterStartSheetProps) {
  if (ask === null) return null;
  const foot =
    tab === "cut"
      ? cut?.summary
        ? COPY.cutFoot(cut.summary.cut, cut.summary.short, cut.slides)
        : COPY.pastMidnight
      : slide?.dayEnd
        ? COPY.slideFoot(slide.minutes, slide.dayEnd.to)
        : COPY.pastMidnight;
  const applies =
    tab === "cut" ? cut?.plan != null : slide !== null && !slide.refused;

  return (
    <RoomSheetFrame<LaterStartTab>
      open={open}
      onClose={onClose}
      scope={COPY.scope(
        clockFromMinutes(ask.wokeAt),
        clockFromMinutes(ask.upAt),
      )}
      title={COPY.title}
      line={COPY.line(ask.short)}
      segment={{
        label: COPY.ways,
        value: tab,
        onChange: onTab,
        picked: "outlined",
        options: [
          { value: "cut", label: COPY.cut },
          { value: "slide", label: COPY.slide },
        ],
      }}
      foot={foot}
      secondary={{ label: COPY.notNow, onClick: onClose }}
      primary={{
        label: tab === "cut" ? COPY.applyCut : COPY.applySlide,
        onClick: onApply,
        disabled: !applies,
      }}
    >
      {tab === "cut" && cut ? (
        <div className="flex flex-col gap-(--space-3)">
          {cut.blocks.map((block) => (
            <CutGroup
              key={block.id}
              block={block}
              onToggle={onToggle}
              onToggleBlock={onToggleBlock}
              canSwap={canSwap}
              onSwap={onSwap}
            />
          ))}
          {cut.more ? <ShowLater onClick={onShowMore} /> : null}
        </div>
      ) : null}
      {tab === "slide" && slide ? (
        <SlideList slide={slide} onShowMore={onShowMore} />
      ) : null}
    </RoomSheetFrame>
  );
}
