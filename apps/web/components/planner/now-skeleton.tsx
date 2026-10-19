import { Skeleton, SkeletonRow } from "@syn/ui";

/**
 * NowSkeleton — the active block on its way (USE-21; D-USE-57, D-USE-74):
 * still bars in the block's rhythm, a header bar (name and span), a
 * card-shaped block, then two rows (a box, a title bar). Never shimmering
 * (A-14), no spinner, no Done or Start. The header, the tray and the tabs
 * are real around it. Announced by its region, not by each bar.
 */
export function NowSkeleton({ label }: { label: string }) {
  return (
    <section
      aria-busy="true"
      aria-label={label}
      className="flex flex-col gap-(--space-3) px-(--space-4) py-(--space-4)"
    >
      <div className="flex flex-col gap-(--space-2) ps-(--space-3)">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-36 w-full rounded-(--radius-sheet)" />
      <SkeletonRow lines={1} className="px-(--space-2)" />
      <SkeletonRow lines={1} className="px-(--space-2)" />
    </section>
  );
}
