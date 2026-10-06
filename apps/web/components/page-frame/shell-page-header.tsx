"use client";

import { useRouter } from "next/navigation";

import { AppHeader } from "@syn/ui";

import { useBack } from "@/lib/hooks/use-back";
import { trpc } from "@/lib/trpc/client";
import { settingsRoute } from "@/lib/routes";

/**
 * The ordinary signed-in header: a title, the avatar that opens Settings, and
 * a back arrow where a screen was pushed over another.
 *
 * IT EXISTS SO A PAGE IS ONE LINE. `PageFrame` takes a header node rather than
 * a title because feature screens need more — a save status, an action, a
 * `DayHeader` as the title node. Most screens need none of that, and twenty
 * of them assembling the same `AppHeader` by hand is twenty chances to drop
 * the avatar or the `tabIndex`.
 *
 * `tabIndex={-1}` ON THE TITLE is what lets a tab switch move focus to the new
 * page's `h1` (cross-cutting §3.4) without adding a stop to the tab order.
 *
 * The name and photo come from `shell.status`, so they stay right after a
 * rename without this component knowing anything about accounts.
 */
export function ShellPageHeader({
  title,
  subtitle,
  action,
  /** Where back goes when there is no in-app history to pop. */
  backFallback,
  showBack = false,
  dateContext,
}: {
  title: React.ReactNode;
  /** A count or a context line. Never the screen's name. */
  subtitle?: React.ReactNode;
  /** The screen's one header action — *Add*, *New*. */
  action?: { label: string; onClick: () => void; busy?: boolean };
  backFallback?: string;
  showBack?: boolean;
  /**
   * Record and plan modes (cross-cutting §8.2): the day being viewed, named,
   * with a way back to today. `todayHref` rather than a callback so a Server
   * Component can pass it.
   */
  dateContext?: { label: string; todayHref: string };
}) {
  const router = useRouter();
  const { data } = trpc.shell.status.useQuery(undefined, { retry: false });
  const goBack = useBack(backFallback ?? settingsRoute());

  return (
    <AppHeader
      title={title}
      subtitle={subtitle}
      action={action}
      onBack={showBack ? goBack : undefined}
      dateContext={
        dateContext === undefined
          ? undefined
          : {
              label: dateContext.label,
              onToday: () => {
                router.push(dateContext.todayHref);
              },
            }
      }
      avatar={{
        name: data?.displayName ?? "",
        imageUrl: data?.avatarPath ? `/api/assets/${data.avatarPath}` : null,
        onOpen: () => {
          router.push(settingsRoute());
        },
      }}
    />
  );
}
