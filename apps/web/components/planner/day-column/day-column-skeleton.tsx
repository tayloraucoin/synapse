import { Skeleton } from "@syn/ui";
import { DAY_COLUMN_GUTTER_PX } from "./day-column";

/**
 * DayColumnSkeleton — the day on its way (USE-27; D-USE-77, as Review the
 * day's loading): still bands in a day's shape from the column's edge, no
 * hour labels, no now line, no edge. Never shimmering (A-14), no spinner.
 * Announced by its region, not by each band.
 */
const BANDS = ["h-22", "h-22", "h-11", "h-60", "h-24"] as const;

export function DayColumnSkeleton({ label }: { label: string }) {
  return (
    <section
      aria-busy="true"
      aria-label={label}
      style={{
        paddingInlineStart: `calc(var(--space-4) + ${DAY_COLUMN_GUTTER_PX}px)`,
      }}
      className="flex flex-col gap-(--space-1) pe-(--space-4) pt-(--space-4)"
    >
      {BANDS.map((height, index) => (
        <Skeleton
          key={index}
          className={`${height} w-full rounded-(--radius-control)`}
        />
      ))}
    </section>
  );
}
