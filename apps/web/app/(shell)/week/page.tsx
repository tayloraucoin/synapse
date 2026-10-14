import type { Metadata } from "next";
import { ScreenFrame, Text } from "@syn/ui";
import { TabHeader } from "../_components/tab-header";
import { SHELL_COPY } from "../_components/copy";

const COPY = SHELL_COPY.week;

export const metadata: Metadata = { title: COPY.title };

/** The Week, a placeholder until its surface ticket (USE-4): one muted line. */
export default function WeekPage() {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <TabHeader title={COPY.title} />
      <ScreenFrame>
        <Text as="p" variant="body" tone="muted">
          {COPY.placeholder}
        </Text>
      </ScreenFrame>
    </main>
  );
}
