"use client";

import * as React from "react";
import type { IconValue } from "@syn/types";
import {
  Button,
  cn,
  Input,
  ItemIcon,
  NoIconIcon,
  SegmentedControl,
  Text,
} from "@syn/ui";
import { ADD_EVENT_COPY as COPY } from "./copy";
import type { AddEventForm, EventTag, LandingLine } from "./form";

/**
 * The parts both layouts share (USE-53): the name with its emoji slot, Work
 * or Personal, the landing line tied to Add, and Add itself, faded with
 * "Name needed" while there is no name (D-USE-34). Nothing red.
 */

export function NameField({
  id,
  form,
  inputRef,
  iconRef,
  onTitle,
  onIcon,
  onEnter,
}: {
  id: string;
  form: AddEventForm;
  inputRef: React.RefObject<HTMLInputElement | null>;
  iconRef?: React.RefObject<HTMLButtonElement | null>;
  onTitle: (title: string) => void;
  /** The emoji slot opens the icon picker; unset, the slot is not shown. */
  onIcon?: () => void;
  onEnter: () => void;
}) {
  return (
    <div className="flex items-center gap-(--space-2)">
      {onIcon ? (
        <button
          ref={iconRef}
          type="button"
          aria-label={COPY.icon(iconWord(form.icon))}
          onClick={onIcon}
          className={cn(
            "border-input inline-flex size-(--target) shrink-0 items-center justify-center rounded-(--radius) border",
            "focus-visible:ring-ring outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          )}
        >
          {form.icon === null ? (
            <NoIconIcon
              aria-hidden="true"
              className="text-muted-foreground size-5"
            />
          ) : (
            <ItemIcon icon={form.icon} size={24} />
          )}
        </button>
      ) : null}
      <Input
        ref={inputRef}
        id={id}
        value={form.title}
        maxLength={120}
        onChange={(event) => onTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onEnter();
          }
        }}
        classes={{ root: "min-w-0 flex-1" }}
      />
    </div>
  );
}

export function TagField({
  value,
  onChange,
  labelled = true,
}: {
  value: EventTag;
  onChange: (tag: EventTag) => void;
  /** The phone's "Tag" label shows; the desk's is read only. */
  labelled?: boolean;
}) {
  return (
    <SegmentedControl
      label={
        labelled ? (
          <Text as="span" variant="secondary" tone="secondary">
            {COPY.tag}
          </Text>
        ) : (
          <span className="sr-only">{COPY.tag}</span>
        )
      }
      stacked={false}
      value={value}
      onChange={onChange}
      options={[
        { value: "work", label: COPY.work },
        { value: "personal", label: COPY.personal },
      ]}
    />
  );
}

/** Where it lands and what moves, announced politely as it changes. */
export function LandingText({
  id,
  line,
  className,
}: {
  id: string;
  line: LandingLine;
  className?: string;
}) {
  return (
    <p id={id} role="status" aria-live="polite" className={className}>
      <Text
        as="span"
        variant="secondary"
        tone={line.tone === "ink" ? "ink" : "secondary"}
      >
        {line.text}
      </Text>
    </p>
  );
}

/** Add event, or Name needed on faded ink: still focusable, aria-disabled. */
export function AddButton({
  named,
  label,
  lineId,
  onAdd,
  className,
}: {
  named: boolean;
  label: string;
  lineId: string;
  onAdd: () => void;
  className?: string;
}) {
  return (
    <Button
      className={cn(
        "w-full",
        !named &&
          "bg-fill-muted text-muted-foreground hover:bg-fill-muted cursor-not-allowed",
        className,
      )}
      aria-disabled={named ? undefined : true}
      aria-describedby={lineId}
      onClick={onAdd}
    >
      {named ? label : COPY.nameNeeded}
    </Button>
  );
}

/** The emoji slot's word: the emoji, the glyph's name, or none. */
function iconWord(icon: IconValue | null): string | null {
  if (icon === null) return null;
  if (icon.kind === "emoji") return icon.value;
  if (icon.kind === "image") return "photo";
  return icon.value.replaceAll("-", " ");
}
