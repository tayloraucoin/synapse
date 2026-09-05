/**
 * Skeleton — the loading placeholder.
 *
 * NO SHIMMER, no pulse. Official spec §5.9: "Skeleton rows in neutral-200, no
 * shimmer… Reduced-motion identical." A shimmer animates a thing that has not
 * loaded, which draws the eye to an absence and reads as activity where there
 * is none. It is also the one loading treatment that must look the same under
 * `prefers-reduced-motion`, and the cheapest way to guarantee that is to not
 * move at all.
 *
 * `aria-hidden`: a skeleton is not content. The region it fills carries the
 * loading state for assistive tech.
 *
 * TOKEN BINDINGS: neutral-200 light / neutral-700 dark.
 */
import { cn } from "../../../lib/cn";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "rounded-(--radius) bg-neutral-200 dark:bg-neutral-700",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
