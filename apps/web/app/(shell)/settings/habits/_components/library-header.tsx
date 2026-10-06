"use client";

import { ShellPageHeader } from "@/components/page-frame";
import { useSheet } from "@/lib/hooks/use-sheet";
import { trpc } from "@/lib/trpc/client";

import { LIBRARY_COPY as COPY } from "./copy";

/**
 * LB-01's header: *Habits*, the count, and *Add*.
 *
 * A thin wrapper over the standard header rather than its own `AppHeader`, so
 * the avatar and the back arrow stay wired in one place. What is local here is
 * the count and what *Add* opens.
 *
 * THE COUNT IS THE SUBTITLE, not part of the title, so the `h1` a screen
 * reader announces is the screen's name and not a number that changes under it.
 */
export function LibraryHeader({ backFallback }: { backFallback: string }) {
  const sheet = useSheet("habit");
  const { data } = trpc.habit.list.useQuery({ includeArchived: false });

  const count = data?.habits.length ?? 0;

  return (
    <ShellPageHeader
      title={COPY.title}
      subtitle={count > 0 ? String(count) : undefined}
      showBack
      backFallback={backFallback}
      action={{
        label: COPY.add,
        onClick: () => {
          sheet.openWith();
        },
      }}
    />
  );
}
