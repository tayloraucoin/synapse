import type { Metadata } from "next";
import { TodayBlockScreen } from "./_components/today-block-screen";

export const metadata: Metadata = { title: "Block" };

/**
 * `/today/block/{id}`: Block view from the day (USE-48; day/block-view/), on
 * fixtures through `useBlockView` and `useToday` until the day-records
 * wiring. From Review the day it is focused (no rail, no tabs); from
 * Schedule the tabs stay, Schedule selected; from Now's Edit block, Now
 * (`?from=`, the shell's `isFocusedPath` and `tabForPath`).
 */
export default async function TodayBlockPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main id="main" className="flex flex-1 flex-col">
      <TodayBlockScreen blockId={decodeURIComponent(id)} />
    </main>
  );
}
