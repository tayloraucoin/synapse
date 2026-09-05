/**
 * ExpanderSection — a collapsed section with a reason (v2 handoff §5.6).
 *
 * LS-02 and LS-03: "3 not assigned today", "cut when shifted". Distinct from
 * `ArchivedSection` because it carries an *explanation* — a person opening
 * "cut when shifted" deserves the sentence saying why those items are there
 * before they see the list.
 *
 * The explanation sits inside the content, not under the trigger, so a closed
 * section is one line and not two.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../primitives/layout/collapsible";
import { Text } from "../../../primitives/typography/text";
import { TextDisclosureButton } from "../../control/text-disclosure-button";

export interface ExpanderSectionProps {
  heading: string;
  explanation: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export function ExpanderSection({
  heading,
  explanation,
  open,
  onOpenChange,
  children,
  className,
}: ExpanderSectionProps) {
  const [uncontrolled, setUncontrolled] = React.useState(false);
  const isOpen = open ?? uncontrolled;

  const setOpen = (next: boolean) => {
    if (open === undefined) setUncontrolled(next);
    onOpenChange?.(next);
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setOpen}
      className={cn("px-(--space-4)", className)}
    >
      <CollapsibleTrigger asChild>
        <TextDisclosureButton
          expanded={isOpen}
          collapsedLabel={heading}
          expandedLabel={heading}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-(--space-2)">
        <Text as="p" variant="secondary" tone="secondary">
          {explanation}
        </Text>
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
