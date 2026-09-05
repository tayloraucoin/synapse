"use client";

import { ShellPageHeader } from "@/components/page-frame";
import { trpc } from "@/lib/trpc/client";
import { settingsHabitsRoute } from "@/lib/routes";

/** LB-03's header — the habit's own title is the screen's `h1`. */
export function HabitDetailHeader({ habitId }: { habitId: string }) {
  const { data } = trpc.habit.get.useQuery({ id: habitId });

  return (
    <ShellPageHeader
      title={data?.title ?? ""}
      showBack
      backFallback={settingsHabitsRoute()}
    />
  );
}
