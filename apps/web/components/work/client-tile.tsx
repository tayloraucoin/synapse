import { cn } from "@syn/ui";
import type { ClientHue } from "./view";

/** Whole class names, so Tailwind sees every one. */
const TILE: Record<ClientHue, string> = {
  rose: "bg-category-rose-dot",
  leaf: "bg-category-leaf-dot",
  amber: "bg-category-amber-dot",
  moss: "bg-category-moss-dot",
  slate: "bg-category-slate-dot",
  ink: "bg-foreground",
};

/**
 * The client's letter tile (D-USE-42, D-USE-51): the letter keeps the colour
 * from standing alone. Its name, where shown, is read; the tile is hidden.
 */
export function ClientTile({
  letter,
  hue,
}: {
  letter: string;
  hue: ClientHue;
}) {
  return (
    <span
      aria-hidden="true"
      data-client-tile={hue}
      className={cn(
        "text-background inline-flex size-4 shrink-0 items-center justify-center rounded-(--radius-control) text-(length:--fs-caption) leading-none font-semibold",
        TILE[hue],
      )}
    >
      {letter}
    </span>
  );
}
