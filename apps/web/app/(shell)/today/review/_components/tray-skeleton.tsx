import { Skeleton } from "@syn/ui";

/**
 * The To-dos tray on its way (USE-34; review-the-day/states/loading.md): two
 * still bars between the tray's hairlines, a short one where "To-dos" sits
 * and a longer one for the first title. Never shimmering (A-14). The tray
 * itself takes over the moment its own query arrives (D-USE-69).
 */
export function TraySkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex min-h-(--target) items-center gap-(--space-3) border-y border-hairline px-(--space-4)"
    >
      <Skeleton className="h-2.5 w-11 rounded-(--radius-control)" />
      <Skeleton className="h-2.5 w-37 rounded-(--radius-control)" />
    </div>
  );
}
