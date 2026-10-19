import { Suspense } from "react";
import type { Metadata } from "next";
import { DaysBlockScreen } from "./_components/days-block-screen";

export const metadata: Metadata = { title: "Block" };

/**
 * `/days/block/{id}?weekday=mon` (or `?date=`): Block view in editing,
 * opened from Set my days (USE-49; day/block-view/by-kind.md), on fixtures
 * through `useBlockView` and `usePlannerWrites`. A pushed screen, as Set my
 * days is: no tab bar below 1024.
 */
export default async function DaysBlockPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main id="main" className="flex flex-1 flex-col">
      <Suspense>
        <DaysBlockScreen blockId={decodeURIComponent(id)} />
      </Suspense>
    </main>
  );
}
