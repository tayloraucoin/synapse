/**
 * ArchivedSection — the collapsed tail of a setup list (v2 handoff §5.5).
 *
 * Archived things are not deleted things, and the difference has to be visible
 * without being loud: a closed disclosure at the end of the list, with the
 * count in the label so nobody opens it to find out it is empty.
 *
 * Renders nothing at zero. A section headed "Show archived (0)" is a promise
 * of content that is not there.
 *
 * The children are the caller's muted `ListRow`s, each carrying its own
 * *Restore* action — this component owns the disclosure, not the rows.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../primitives/layout/collapsible";
import { TextDisclosureButton } from "../../control/text-disclosure-button";
import { ARCHIVED_SECTION_COPY } from "./copy";

export interface ArchivedSectionProps {
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function ArchivedSection({
  count,
  children,
  defaultOpen = false,
  className,
}: ArchivedSectionProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  if (count === 0) return null;

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn("pt-(--space-4)", className)}
    >
      <CollapsibleTrigger asChild>
        <TextDisclosureButton
          expanded={open}
          collapsedLabel={ARCHIVED_SECTION_COPY.show(count)}
          expandedLabel={ARCHIVED_SECTION_COPY.hide(count)}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}
