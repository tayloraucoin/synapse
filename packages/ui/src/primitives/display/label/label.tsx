/**
 * Label — the field label. 0.875rem ink at weight 500 (official spec §9.4).
 *
 * Always paired with a control through `htmlFor`; `Input`, `Textarea`, and the
 * field wrappers do that wiring so a caller cannot forget it.
 */
"use client"

import * as React from "react"
import { cn } from "../../../lib/cn"
import { Label as LabelPrimitive } from "radix-ui"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        cn(
          "flex items-center gap-(--space-2) select-none",
          "font-sans text-(length:--fs-secondary) leading-none font-medium text-ink",
          "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
          "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        ),
        className
      )}
      {...props}
    />
  )
}

export { Label }
