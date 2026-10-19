/**
 * FiringMark — the mark that says a prompt is running (Workflow UX v0.1 §3.3,
 * §9; W5, TD-42), restyled for USE (D-USE-47, D-USE-49; USE-10).
 *
 * RUST ON GREY. The dot is `category-clay-dot`, 10px: "processing, please
 * wait". Verdigris means only the person's own hands (the running card), so
 * the mark never takes `now`.
 *
 * TWO FORMS. Bare, the dot itself breathes (a folded lane's head). With
 * `halo`, the dot sits still in a 22px `fill-muted` halo and the halo
 * breathes: the work row's lead slot and `FiringToggle` when pressed.
 *
 * THE ONE THING ON THE BOARD THAT MOVES. The breath runs 1 → 0.35 → 1 over
 * `--dur-breathe`, attached `motion-safe:` ONLY: under reduced motion no
 * animation is attached at all, so the mark is still and at full strength,
 * never frozen dim. The word *firing* beside it carries the state either way.
 *
 * Decorative: `aria-hidden`.
 */
import * as React from "react";
import { cn } from "../../../lib/cn";

export interface FiringMarkProps {
  /** The prompt is running: the mark breathes (when motion is allowed). */
  breathing?: boolean;
  /** USE's form: the still dot in a breathing grey halo (D-USE-49). */
  halo?: boolean;
  /** Applied to the dot. */
  className?: string;
}

export function FiringMark({
  breathing = false,
  halo = false,
  className,
}: FiringMarkProps) {
  const dot = (
    <span
      aria-hidden="true"
      data-firing-mark={halo ? undefined : ""}
      data-breathing={(!halo && breathing) || undefined}
      className={cn(
        "bg-category-clay-dot relative inline-block size-2.5 shrink-0 rounded-full",
        !halo && breathing && "motion-safe:animate-breathe",
        className,
      )}
    />
  );
  if (!halo) return dot;

  return (
    <span
      aria-hidden="true"
      data-firing-mark=""
      data-breathing={breathing || undefined}
      className="relative inline-flex size-5.5 shrink-0 items-center justify-center"
    >
      <span
        className={cn(
          "bg-fill-muted absolute inset-0 rounded-full",
          breathing && "motion-safe:animate-breathe",
        )}
      />
      {dot}
    </span>
  );
}
