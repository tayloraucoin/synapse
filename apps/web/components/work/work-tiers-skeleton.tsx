import { Skeleton } from "@syn/ui";

/**
 * Today's tiers while they read (USE-57; loading.md, D-USE-57): a heading
 * bar and two rows, twice, each row a circle in the lead slot, a title bar
 * and a shorter meta bar. Still, never shimmering (A-14). Props only.
 */
export function WorkTiersSkeleton({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      data-work-tiers-skeleton
      className="flex flex-col gap-(--space-6)"
    >
      {[0, 1].map((group) => (
        <div key={group} className="flex flex-col gap-(--space-2)">
          <Skeleton className="h-3.5 w-24" />
          {[0, 1].map((row) => (
            <div key={row} className="flex items-start">
              <span className="flex size-(--target) shrink-0 items-center justify-center">
                <Skeleton className="size-3 rounded-full" />
              </span>
              <div className="flex flex-1 flex-col gap-(--space-2) py-(--space-3)">
                <Skeleton className="h-3.5 w-3/5" />
                <Skeleton className="h-3 w-2/5" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
