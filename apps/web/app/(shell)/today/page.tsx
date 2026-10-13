import type { Metadata } from "next";
import { ScreenFrame, Text } from "@syn/ui";
import { TODAY_COPY as COPY } from "./_components/copy";
import { PushCheck } from "./_components/push-check";

export const metadata: Metadata = { title: COPY.title };

/**
 * Today, empty on purpose (USE-1).
 *
 * The old Today went to `_legacy/` with the rest of the app; USE builds the
 * new one on fixtures in wave 2. Until then this is one muted line, plus the
 * push check: notifications have nowhere else to be turned on while Settings
 * is legacy, and the pipeline behind it (`/api/pwa/push/*`, `lib/pwa`) stays
 * live for USE's reminders.
 */
export default function TodayPage() {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <ScreenFrame className="flex flex-col gap-(--space-4)">
        <Text as="p" variant="body" tone="muted">
          {COPY.placeholder}
        </Text>
        <PushCheck />
      </ScreenFrame>
    </main>
  );
}
