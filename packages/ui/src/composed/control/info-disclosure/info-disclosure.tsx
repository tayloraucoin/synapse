/**
 * InfoDisclosure — every "what does this do?" (UX v1.3 R60, §10.2, §10.4;
 * DAY-1).
 *
 * "An info glyph with a text label; open, a surface panel of
 * term-and-definition lines." Screen 3's *What does each choice do?* is the
 * first; any screen that has to explain its choices uses this rather than
 * a paragraph under the heading.
 *
 * BESIDE `TextDisclosureButton`, NOT A VARIANT OF IT. The text toggle's
 * contract is no glyph and a label that changes (*Show archived* ⇄ *Hide
 * archived*); this one keeps its label and adds the glyph. Two contracts,
 * two components — a variant would have the toggle growing a glyph it must
 * never show.
 *
 * `button[aria-expanded][aria-controls]` over a `region` labelled by the
 * button; the Lucide `Info` is `aria-hidden` and the label is the name. Each
 * line reads *term, definition*: the term in weight 500, ink; the text in the
 * secondary tone. Focus stays on the button when it toggles. The panel
 * appears at once — a disclosure that animates a paragraph is motion that
 * carries no information. No items: the button alone, with nothing to open.
 */
"use client";

import { Info } from "lucide-react";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";

export interface InfoDisclosureItem {
  term: string;
  text: string;
}

export interface InfoDisclosureClasses {
  root?: string;
  button?: string;
  panel?: string;
}

export interface InfoDisclosureProps {
  /** *What does each choice do?* — the button's name. */
  label: string;
  expanded: boolean;
  onToggle: (expanded: boolean) => void;
  items: readonly InfoDisclosureItem[];
  /** The panel's id; generated when absent. */
  id?: string;
  classes?: InfoDisclosureClasses;
  className?: string;
}

export function InfoDisclosure({
  label,
  expanded,
  onToggle,
  items,
  id: idProp,
  classes,
  className,
}: InfoDisclosureProps) {
  const generatedId = React.useId();
  const panelId = idProp ?? generatedId;
  const buttonId = `${panelId}-button`;
  const hasItems = items.length > 0;
  const open = expanded && hasItems;

  return (
    <div className={cn("flex flex-col gap-(--space-2)", classes?.root, className)}>
      <button
        type="button"
        id={buttonId}
        aria-expanded={open}
        aria-controls={hasItems ? panelId : undefined}
        onClick={() => onToggle(!expanded)}
        className={cn(
          "text-ink inline-flex min-h-(--target) w-fit items-center gap-(--space-2) text-left",
          "text-(length:--fs-secondary) leading-(--lh-secondary) font-medium",
          "underline-offset-4 hover:underline",
          "rounded-(--radius) focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
          classes?.button,
        )}
      >
        <Info aria-hidden="true" strokeWidth={1.5} className="size-5 shrink-0" />
        {label}
      </button>

      {open ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className={cn(
            "bg-surface border-hairline flex flex-col gap-(--space-2) rounded-(--radius) border p-(--space-3)",
            classes?.panel,
          )}
        >
          {items.map((item) => (
            <Text key={item.term} as="p" variant="caption" tone="secondary">
              <span className="text-ink font-medium">{item.term}</span>
              {/* v1.3 §4.3's lines: *Always — a work day.* The dash is the pause the ear hears. */}
              {" — "}
              {item.text}
            </Text>
          ))}
        </div>
      ) : null}
    </div>
  );
}
