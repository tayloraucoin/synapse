"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useIsSplit } from "@syn/ui";
import { useDataSource, useIsOffline } from "@/lib/data/source";
import { useDaysPlace } from "@/lib/data/use-days";
import { useFirstTime } from "@/lib/data/use-first-time";
import { usePlannerWrites } from "@/lib/data/use-planner-writes";
import { useWeek } from "@/lib/data/use-week";
import { isInstallOffered, useInstallState } from "@/lib/pwa/use-install-state";
import { installSheetRoute, todayRoute } from "@/lib/routes";
import { DAYS_COPY as COPY } from "./copy";
import { InstallOffer } from "./day-parts";
import { DayView } from "./day-view";
import { DaysHeader, DaysSaveStatus } from "./days-header";
import { WeekView } from "./week-view";

/**
 * Set my days (USE-39; set-my-days/index.md): pushed from the avatar menu,
 * it opens on the week (B) and a day pushes from it (A) with "‹ Week"
 * (D-USE-49). Every edit saves as made through one write queue, and the
 * header's SaveStatus reads it. Below 1024 and every width for now, the
 * phone's push; the 1024 list-detail is part 2's (USE-42).
 */
export function DaysScreen() {
  const place = useDaysPlace();
  const writes = usePlannerWrites();
  const offline = useIsOffline();
  const { scenario } = useDataSource();
  const offer = useInstallOffer();

  // Hidden offline (D-USE-82); while loading and on error the day leaves it out.
  const save = offline ? null : (
    <DaysSaveStatus
      status={writes.saveStatus}
      onRetry={() => void writes.retry()}
      hold={scenario.setUp?.holdSaved ?? false}
    />
  );

  if (place.day === null) {
    return (
      <div className="flex flex-col">
        <DaysHeader
          crumb={{
            label: COPY.now,
            href: todayRoute(),
            ariaLabel: COPY.backToNow,
          }}
          title={COPY.title}
          save={save}
          focusKey="week"
        />
        <div className="pt-(--space-4)">
          <WeekView
            place={place}
            onWeek={place.showWeek}
            onDay={place.openDay}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col">
      <DayView
        place={{ ...place, day: place.day }}
        writes={writes}
        save={save}
        onDay={place.openDay}
        offer={offer}
      />
    </div>
  );
}

/**
 * The install offer, once (install-offer.md): after a first day is set,
 * below 1024 and not installed. How, or leaving Set my days, ends it for
 * good; after that it is only in the avatar menu.
 */
function useInstallOffer(): React.ReactNode {
  const router = useRouter();
  const pathname = usePathname();
  const { scenario } = useDataSource();
  const [seen, markSeen] = useFirstTime("install-offer");
  const install = useInstallState(scenario.install);
  const atDesk = useIsSplit();
  const usual = useWeek("usual");
  const daySet = usual.week?.days.some((day) => day.bounds !== null) ?? false;
  const shown = !seen && daySet && isInstallOffered(install, atDesk);

  // Leaving Set my days ends it. The mark waits a tick, so a development
  // re-mount (StrictMode) does not count as leaving.
  const shownRef = React.useRef(shown);
  shownRef.current = shown;
  const markRef = React.useRef(markSeen);
  markRef.current = markSeen;
  React.useEffect(() => {
    const pending = leaving.current;
    if (pending !== null) window.clearTimeout(pending);
    return () => {
      leaving.current = window.setTimeout(() => {
        if (shownRef.current) markRef.current();
      }, 0);
    };
  }, []);

  if (!shown) return null;
  return (
    <InstallOffer
      onHow={() => {
        markSeen();
        router.push(installSheetRoute(`${pathname}${window.location.search}`));
      }}
    />
  );
}

const leaving: { current: number | null } = { current: null };
