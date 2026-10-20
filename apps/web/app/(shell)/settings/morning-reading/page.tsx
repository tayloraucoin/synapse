import { Suspense } from "react";
import type { Metadata } from "next";
import { MORNING_READING_COPY, MorningReadingPage } from "@/components/account";

export const metadata: Metadata = { title: MORNING_READING_COPY.title };

/**
 * `/settings/morning-reading` (USE-151; D-USE-119): the passages and links
 * Orient reads, through `useMorningReading`. Opened from Settings, after
 * Connections; Orient does not link here.
 */
export default function MorningReadingRoutePage() {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <Suspense>
        <MorningReadingPage />
      </Suspense>
    </main>
  );
}
