/**
 * Checkbox — the 20px mark. Checked is an ink fill with a paper check.
 *
 * THE TARGET IS THE PARENT. This visual is 20px; the 44px target comes from
 * the row that contains it — `CheckboxField` beside this file, or the item
 * row's own 44px hit area (official spec §9.7). A bare Checkbox with no
 * enclosing label is a 20px target and a defect.
 *
 * TOKEN BINDINGS: border --input, surface --paper, checked --primary (ink),
 * mark --primary-foreground.
 */
"use client"

import * as React from "react"
import { cn } from "../../../lib/cn"
import { CheckIcon } from "lucide-react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-5 shrink-0 rounded-(--radius) border border-input bg-paper outline-none",
        "transition-colors duration-(--dur-state) ease-(--ease-settle)",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-ink",
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-4" strokeWidth={2.5} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox };
