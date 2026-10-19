import { Suspense } from "react";
import type { Metadata } from "next";
import { DAYS_COPY } from "./_components/copy";
import { DaysScreen } from "./_components/days-screen";

export const metadata: Metadata = { title: DAYS_COPY.title };

/**
 * Set my days (USE-39): the usual week and this week, on fixtures through
 * the set-up hooks. Pushed from the avatar menu; no tab bar below 1024.
 */
export default function DaysPage() {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <Suspense>
        <DaysScreen />
      </Suspense>
    </main>
  );
}
