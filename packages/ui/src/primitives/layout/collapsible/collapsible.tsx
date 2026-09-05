/**
 * Collapsible — the inline expander.
 *
 * `CollapsiblePanel` at the bottom of this file is the prop-based form.
 */
"use client"

import { Collapsible as CollapsiblePrimitive } from "radix-ui"
import { cn } from "../../../lib/cn"

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }

/* ------------------------------------------------------------------ */

export interface CollapsiblePanelClasses {
  root?: string;
  trigger?: string;
  content?: string;
}

export interface CollapsiblePanelProps {
  /** The always-visible row that opens and closes the panel. */
  trigger: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  classes?: CollapsiblePanelClasses;
  className?: string;
}

/**
 * CollapsiblePanel — the prop-based expander behind "3 not assigned today",
 * "cut when shifted", and "Add reflections".
 *
 * Named `CollapsiblePanel` because `Collapsible` above is Radix's root.
 */
function CollapsiblePanel({
  trigger,
  children,
  open,
  onOpenChange,
  defaultOpen,
  classes,
  className,
}: CollapsiblePanelProps) {
  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      defaultOpen={defaultOpen}
      className={cn(className, classes?.root)}
    >
      <CollapsibleTrigger
        className={cn(
          "flex min-h-(--target) w-full items-center justify-between",
          "text-text-secondary hover:text-ink",
          "font-sans text-(length:--fs-secondary)",
          classes?.trigger,
        )}
      >
        {trigger}
      </CollapsibleTrigger>
      <CollapsibleContent className={classes?.content}>
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

export { CollapsiblePanel };
