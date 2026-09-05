/**
 * Badge — a short word beside a thing.
 *
 * Two variants only: `outline` (hairline) and `text` (bare). There is no
 * filled variant and no count — see badge.variants.ts for why.
 *
 * TOKEN BINDINGS: --hairline border, --ink text, --text-secondary for `text`.
 * A category chip overrides the colours with the category's own hue pairing
 * (100 background / 700 text in light, 800 / 200 in dark).
 */
import { type VariantProps } from "class-variance-authority"
import { cn } from "../../../lib/cn"
import { Slot } from "radix-ui"
import { badgeVariants } from "./badge.variants"


function Badge({
  className,
  variant = "outline",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
