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

/** 16 on a work row; 20 in Settings' client list; 48 on the client sheet (USE-86). */
const SIZE = {
  sm: "size-4 rounded-(--radius-control) text-(length:--fs-caption)",
  md: "size-5 rounded-(--radius-control) text-(length:--fs-caption)",
  lg: "size-12 rounded-(--radius-md) text-(length:--fs-title)",
} as const;

/**
 * The client's letter tile (D-USE-42, D-USE-51): the letter keeps the colour
 * from standing alone. Its name, where shown, is read; the tile is hidden.
 */
export function ClientTile({
  letter,
  hue,
  size = "sm",
  className,
}: {
  letter: string;
  hue: ClientHue;
  size?: keyof typeof SIZE;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      data-client-tile={hue}
      className={cn(
        "text-background inline-flex shrink-0 items-center justify-center leading-none font-semibold",
        SIZE[size],
        TILE[hue],
        className,
      )}
    >
      {letter}
    </span>
  );
}
