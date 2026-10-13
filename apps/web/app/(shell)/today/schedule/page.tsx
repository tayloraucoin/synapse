import type { Metadata } from "next";
import { ScreenFrame, Text } from "@syn/ui";
import { SHELL_COPY } from "../../_components/copy";

const COPY = SHELL_COPY.schedule;

export const metadata: Metadata = { title: COPY.title };

/** Schedule, a placeholder until its surface ticket (USE-4): one muted line. */
export default function SchedulePage() {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <ScreenFrame>
        <Text as="p" variant="body" tone="muted">
          {COPY.placeholder}
        </Text>
      </ScreenFrame>
    </main>
  );
}
