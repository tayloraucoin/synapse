"use client";

import { EllipsesMenu, ItemIcon, ListRow, Tag, Text } from "@syn/ui";
import type { SlotView } from "@syn/types";

import { iconImageUrl } from "@/lib/assets/icon-url";

import { TEMPLATE_COPY as COPY } from "./copy";

/**
 * One slot on the canvas — Epic 1 TP-02 read 4.
 *
 * FIXED AND FLEXIBLE, NEVER HARD AND SOFT. The schema's words never reach a
 * screen (official spec §10.2); this is one of the two places the mapping
 * happens, and the other is the sheet's segmented control.
 *
 * MOVE UP AND MOVE DOWN ARE HIDDEN UNLESS THE SLOT IS GROUPED. Outside a
 * bracket the order is the clock's, so offering to reorder would be offering
 * something the next read undoes.
 */
export function SlotRow({
  slot,
  onEdit,
  onDuplicate,
  onRemove,
  onMove,
  disabled = false,
}: {
  slot: SlotView;
  onEdit: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onMove: (direction: "up" | "down") => void;
  disabled?: boolean;
}) {
  const grouped = slot.multitask !== "none";

  return (
    <ListRow
      as="li"
      leading={
        <ItemIcon
          icon={slot.icon}
          size={24}
          imageUrl={iconImageUrl(slot.icon)}
        />
      }
      title={slot.title}
      meta={
        <span className="flex flex-wrap items-center gap-(--space-2)">
          <span>{describeTime(slot)}</span>
          <span>{`${slot.durationMin} min`}</span>
          <span>{slot.priority}</span>
          {slot.overridden ? <Tag>{COPY.overridden}</Tag> : null}
          <Text as="span" variant="caption" tone="secondary">
            {slot.scheduling === "hard" ? COPY.fixed : COPY.flexible}
          </Text>
        </span>
      }
      onClick={onEdit}
      trailing={
        <EllipsesMenu
          label={`More actions for ${slot.title}`}
          disabled={disabled}
          items={[
            { label: COPY.moveUp, onClick: () => onMove("up"), hidden: !grouped },
            {
              label: COPY.moveDown,
              onClick: () => onMove("down"),
              hidden: !grouped,
            },
            { label: COPY.duplicate, onClick: onDuplicate },
            { label: COPY.remove, onClick: onRemove },
          ]}
        />
      }
    />
  );
}

/** "at 7:20" · "within 1:00–4:00" · "anytime". */
function describeTime(slot: SlotView): string {
  if (slot.timeMode === "unscheduled") return COPY.modeAnytime;
  if (slot.timeMode === "window") {
    return `${COPY.modeWithin} ${slot.startClock ?? ""}–${slot.endClock ?? ""}`;
  }
  return `${COPY.modeAt} ${slot.startClock ?? ""}`;
}
