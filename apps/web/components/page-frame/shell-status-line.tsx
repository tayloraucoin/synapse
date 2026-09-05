"use client";

import { useRouter } from "next/navigation";

import { pendingReviewText } from "@syn/ui";

import { StatusLineSlot } from "@/app/(shell)/_components/status-line-slot";
import { trpc } from "@/lib/trpc/client";
import { reviewDayRoute, setupRoute } from "@/lib/routes";

/**
 * The shell's status line, with its sources attached.
 *
 * `StatusLineSlot` is the pure resolver — it decides WHICH line wins. This is
 * the thin layer that tells it what is true, and it exists so the resolver
 * stays storyable and the sources stay replaceable: `lateOffer`,
 * `updateReady`, `timezoneMismatch`, `installOffer` and `permissionOffer` are
 * constants today and become real in USE-6, SYS-5, SYS-2 and SET-9. The props
 * are wired now so those tickets change one line each rather than this file's
 * shape.
 *
 * A FAILED QUERY IS NO LINE, NOT AN ERROR. The chrome is never load-bearing:
 * if `shell.status` is unavailable the page still renders, without a dot and
 * without a line.
 *
 * The pending line's own text is built here rather than taken from the copy
 * table, because official spec §10.5's sentence names the day and the count.
 */
export function ShellStatusLine({ dayKey }: { dayKey?: string }) {
  const router = useRouter();
  const { data } = trpc.shell.status.useQuery(undefined, {
    // The chrome must never take the page down with it.
    retry: false,
  });

  if (!data) return null;

  // A day route scopes the late offer to the day being viewed; every other
  // route scopes it to today. Pages do not plumb this.
  const scopeKey = dayKey ?? data.todayKey;

  const [firstPending] = data.pendingDays;

  return (
    <StatusLineSlot
      dayKey={scopeKey}
      setupIncomplete={data.setupIncomplete}
      onFinishSetup={() => {
        router.push(setupRoute(data.setupStep ?? 1));
      }}
      reviewPending={firstPending !== undefined}
      pendingText={
        firstPending === undefined
          ? undefined
          : pendingReviewText(firstPending.weekday, firstPending.count)
      }
      onOpenReview={
        firstPending === undefined
          ? undefined
          : () => {
              router.push(reviewDayRoute(firstPending.date));
            }
      }
      lateOffer={false}
      updateReady={false}
      timezoneMismatch={undefined}
      installOffer={false}
      permissionOffer={false}
    />
  );
}
