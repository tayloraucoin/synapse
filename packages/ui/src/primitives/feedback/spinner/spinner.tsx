/**
 * Spinner — the only moving thing in the product, and only while something is
 * genuinely in flight.
 *
 * 16px at `currentColor`, so it inherits from whatever it sits in — a busy
 * Button gets paper on ink without the Button saying so.
 *
 * `motion-reduce:animate-none` per official spec §9.6: under reduced motion it
 * stops, and the state is carried by `aria-busy` on the control instead.
 */
import { cn } from "../../../lib/cn"
import { Loader2Icon } from "lucide-react"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin motion-reduce:animate-none", className)}
      {...props}
    />
  )
}

export { Spinner }
