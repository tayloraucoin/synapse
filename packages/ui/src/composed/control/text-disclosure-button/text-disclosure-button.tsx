/**
 * TextDisclosureButton — the flush text toggle (v2 handoff §6.1, reuse CC).
 *
 * CC's component with its typography swapped for Synapse's. It is a plain text
 * button, not a ghost Button, so a disclosure inside a list does not read as
 * an action of the same weight as the rows around it. The chevron is
 * deliberately absent — the label itself changes ("Show archived" ⇄ "Hide
 * archived"), which is the honest affordance and the one that survives a
 * screen reader (official spec §9.9: an icon never carries the meaning alone).
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";

export interface TextDisclosureButtonClasses {
  root?: string;
}

export interface TextDisclosureButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  expanded: boolean;
  collapsedLabel: React.ReactNode;
  expandedLabel: React.ReactNode;
  classes?: TextDisclosureButtonClasses;
}

export function TextDisclosureButton({
  expanded,
  collapsedLabel,
  expandedLabel,
  classes,
  className,
  type = "button",
  ...props
}: TextDisclosureButtonProps) {
  return (
    <button
      type={type}
      aria-expanded={expanded}
      className={cn(
        "text-[length:var(--fs-secondary)] leading-(--lh-secondary) font-medium",
        "text-ink underline-offset-4",
        "min-h-(--target) px-0 py-(--space-2) text-left hover:underline",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
        classes?.root,
        className,
      )}
      {...props}
    >
      {expanded ? expandedLabel : collapsedLabel}
    </button>
  );
}
