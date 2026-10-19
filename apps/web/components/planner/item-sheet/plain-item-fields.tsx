"use client";

import * as React from "react";
import {
  cn,
  ItemIcon,
  MinutesStepper,
  Switch,
  Text,
  Textarea,
  TimeField,
} from "@syn/ui";
import { clockFromMinutes, clockToMinutes } from "@syn/utils";
import type { ItemSheetView } from "@/lib/data/use-item-sheet";
import { BLOCK_HUE, HUE_CHIP } from "../block-hue";
import { clock, ITEM_SHEET_COPY as COPY } from "./copy";

/**
 * PlainItemFields — the Item sheet's body on a plain item (USE-64;
 * item-sheet/states/default.md, at-a-set-time.md): the scope line, the icon
 * tile and the name, then Length, At a set time (with its Time row when on)
 * and Notes on hairlines, and the footer line. No Save: each field hands its
 * change up as it is made. Props only.
 */
export interface PlainItemFieldsProps {
  view: ItemSheetView;
  notes: string;
  titleRef: React.Ref<HTMLHeadingElement>;
  /** The icon tile, so back from the icon step returns focus to it. */
  iconRef: React.Ref<HTMLButtonElement>;
  onIcon: () => void;
  onLength: (lengthMin: number) => void;
  onAtTime: (atTime: string | null) => void;
  onNotes: (text: string) => void;
}

/** The icon's name as the tile reads it: the emoji, or the glyph's word. */
function iconName(view: ItemSheetView): string {
  const { icon } = view.item;
  if (icon === null) return "none";
  if (icon.kind === "emoji") return icon.value;
  if (icon.kind === "image") return "photo";
  return icon.value.replaceAll("-", " ");
}

const ROW = "border-hairline border-t py-(--space-3)";

export function PlainItemFields({
  view,
  notes,
  titleRef,
  iconRef,
  onIcon,
  onLength,
  onAtTime,
  onNotes,
}: PlainItemFieldsProps) {
  const { item, block, previous, date } = view;
  const ids = { atTime: React.useId(), atTimeLine: React.useId() };
  // The time shown while it saves: the switch and the field answer at once.
  const [pinned, setPinned] = React.useState<string | null>(item.atTime);
  React.useEffect(() => setPinned(item.atTime), [item.atTime]);
  const on = pinned !== null;
  const ends =
    pinned === null
      ? null
      : clockFromMinutes(clockToMinutes(pinned) + item.lengthMin);

  return (
    <div className="flex flex-col">
      <Text as="p" variant="secondary" tone="secondary">
        {COPY.scope(block.name, block.startsAt, block.endsAt)}
      </Text>

      <div className="flex items-center gap-(--space-3) py-(--space-3)">
        <button
          ref={iconRef}
          type="button"
          aria-label={COPY.icon(iconName(view))}
          onClick={onIcon}
          className={cn(
            "inline-flex size-(--target) shrink-0 items-center justify-center rounded-(--radius)",
            "focus-visible:ring-ring outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            HUE_CHIP[BLOCK_HUE[block.kind]],
          )}
        >
          <ItemIcon icon={item.icon} size={24} />
        </button>
        <Text
          ref={titleRef}
          as="h2"
          variant="heading"
          tabIndex={-1}
          className="min-w-0 outline-none"
        >
          {item.title}
        </Text>
      </div>

      <div className={ROW}>
        <MinutesStepper
          label={COPY.length}
          value={item.lengthMin}
          onCommit={onLength}
          min={1}
          max={600}
          step={5}
          stepLabels={{ decrease: COPY.shorter, increase: COPY.longer }}
          inline
        />
      </div>

      <div className={cn(ROW, "flex items-center gap-(--space-3)")}>
        <div className="flex min-w-0 flex-1 flex-col">
          <Text as="label" htmlFor={ids.atTime} variant="body" weight={500}>
            {COPY.atSetTime}
          </Text>
          <Text
            as="span"
            id={ids.atTimeLine}
            variant="caption"
            tone="secondary"
          >
            {on
              ? COPY.staysAtTime
              : COPY.follows(
                  previous?.title ?? null,
                  block.name,
                  item.plannedAt,
                )}
          </Text>
        </div>
        <Switch
          id={ids.atTime}
          checked={on}
          aria-describedby={ids.atTimeLine}
          onCheckedChange={(checked) => {
            // On, it stays where the day has it now; nothing moves yet.
            const next = checked ? (item.plannedAt ?? block.startsAt) : null;
            setPinned(next);
            onAtTime(next);
          }}
        />
      </div>

      {on && pinned !== null ? (
        <div className="flex min-h-14 items-center gap-(--space-3) py-(--space-2)">
          <Text as="span" variant="body" weight={500} className="flex-1">
            {COPY.time}
          </Text>
          {ends === null ? null : (
            <Text
              as="span"
              variant="secondary"
              tone="secondary"
              className="whitespace-nowrap"
            >
              {COPY.ends(ends)}
            </Text>
          )}
          <TimeField
            label={<span className="sr-only">{COPY.time}</span>}
            name={COPY.time}
            value={pinned}
            formatValue={clock}
            onChange={(value) => {
              if (value === "") return;
              setPinned(value);
              onAtTime(value);
            }}
            className="w-36 shrink-0"
          />
        </div>
      ) : null}

      <div className={ROW}>
        <Textarea
          label={COPY.notes}
          placeholder={COPY.notesPlaceholder}
          value={notes}
          onChange={(event) => onNotes(event.target.value)}
          autoGrow
          rows={2}
        />
      </div>

      <Text
        as="p"
        variant="caption"
        tone="secondary"
        className="border-hairline border-t pt-(--space-3)"
      >
        {COPY.footer(date)}
      </Text>
    </div>
  );
}
