"use client";

import { useRouter } from "next/navigation";

import { DayList, DayListHeader } from "@/components/day-list";
import { PageFrame } from "@/components/page-frame";
import { QuickPick, QuickPickHeader, type QuickPickView } from "@/components/quick-pick";
import { trpc, type RouterOutputs } from "@/lib/trpc/client";

type DayView = RouterOutputs["day"]["get"];

/**
 * Today, in one of its two states — UX v1.1 R6 (DYN-14).
 *
 * UNCONFIRMED → the quick-pick; CONFIRMED → the list. The switch is here,
 * on the client, so *Set the day* becomes the list without a full reload:
 * the confirm invalidates `day.get`, this re-reads it, and the branch flips.
 * Until DYN-15 renders the day by block, the confirmed state is USE-2's list
 * over the confirmed day (`parts` is still populated by `getDay`).
 */
export function TodayScreen({
  dateKey,
  initialDay,
  initialPick,
}: {
  dateKey: string;
  initialDay: DayView;
  initialPick: QuickPickView | null;
}) {
  const router = useRouter();
  const day = trpc.day.get.useQuery({ date: dateKey }, { initialData: initialDay });
  const view = day.data ?? initialDay;

  if (view.confirmedAt === null && initialPick !== null) {
    return (
      <PageFrame dayKey={dateKey} header={<QuickPickHeader date={dateKey} />}>
        <QuickPick
          initial={initialPick}
          timeZone={view.timezone}
          onSet={async () => {
            await day.refetch();
            router.refresh();
          }}
        />
      </PageFrame>
    );
  }

  return (
    <PageFrame dayKey={dateKey} header={<DayListHeader day={view} />}>
      <DayList dateKey={dateKey} initial={view} />
    </PageFrame>
  );
}
