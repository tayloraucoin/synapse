import { Suspense } from "react";
import type { Metadata } from "next";
import { SHELL_COPY } from "../_components/copy";
import { WeekScreen } from "./_components/week-screen";

export const metadata: Metadata = { title: SHELL_COPY.week.title };

/**
 * The Week (USE-72): the desk's planning view, on fixtures through
 * `useWeekView`. Below 1024 it is one line to Set my days › This week.
 */
export default function WeekPage() {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <Suspense>
        <WeekScreen />
      </Suspense>
    </main>
  );
}
