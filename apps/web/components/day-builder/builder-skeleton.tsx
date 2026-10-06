import { SkeletonRow } from "@syn/ui";

/**
 * A builder screen while its data is out — UX v1.3 R63, §2 guardrail 6
 * (DAY-9): three `SkeletonRow`s inside the frame, never a blank and never a
 * *Loading* word. `aria-busy` on the region, so assistive tech waits too.
 */
export function BuilderSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-(--space-2)">
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
    </div>
  );
}
