import { cn, Skeleton } from "@syn/ui";
import { DAY_COLUMN_GUTTER_PX } from "./day-column";

/**
 * DayColumnSkeleton — the day on its way (USE-27; D-USE-77, as Review the
 * day's loading): still bands in a day's shape from the column's edge, no
 * hour labels, no now line, no edge. Never shimmering (A-14), no spinner.
 * Announced by its region, not by each band.
 *
 * `meals` draws the meal bands as dashed outlines, as Review the day's
 * loading does (USE-34): Wellness, Training and Work filled, Breakfast and
 * Lunch dashed.
 */
const BANDS = [
  { height: "h-22", meal: false },
  { height: "h-22", meal: false },
  { height: "h-11", meal: true },
  { height: "h-60", meal: false },
  { height: "h-24", meal: true },
] as const;

export function DayColumnSkeleton({
  label,
  meals = false,
}: {
  label: string;
  meals?: boolean;
}) {
  return (
    <section
      aria-busy="true"
      aria-label={label}
      style={{
        paddingInlineStart: `calc(var(--space-4) + ${DAY_COLUMN_GUTTER_PX}px)`,
      }}
      className="flex flex-col gap-(--space-1) pe-(--space-4) pt-(--space-4)"
    >
      {BANDS.map((band, index) =>
        meals && band.meal ? (
          <div
            key={index}
            aria-hidden="true"
            className={cn(
              band.height,
              "w-full rounded-(--radius-control) border border-dashed border-border",
            )}
          />
        ) : (
          <Skeleton
            key={index}
            className={cn(band.height, "w-full rounded-(--radius-control)")}
          />
        ),
      )}
    </section>
  );
}
