"use client";

import * as React from "react";
import {
  INTENTION_MAX,
  MORNING_GRATITUDE_MAX,
  VISUALISATION_MAX,
} from "@syn/constants";
import {
  Button,
  DisclosureIcon,
  SaveStatusText,
  ScreenFrame,
  Text,
  Textarea,
  TextDisclosureButton,
} from "@syn/ui";
import { lastNightEntries } from "@syn/utils";
import { useDataSource } from "@/lib/data/source";
import { useTodayKey } from "@/lib/data/use-morning";
import { useDayEntryGate } from "../../_components/day-entry-gate";
import { ORIENT_COPY as COPY } from "./copy";
import { dateLabelOf } from "./date-label";
import { LastNightSheet } from "./last-night-sheet";
import { OrientReading } from "./orient-reading";
import { useOrientFrame, type LineKey } from "./use-orient-frame";

/**
 * Orient (USE-12; D-USE-5, 9, 14, 25, 39, 63), reworked from the legacy
 * frame (DYN-13, RUN-9, DAY-12). One bare column, top to bottom: the date
 * over "Good morning"; the clamped reading with its dots and "Read all"; the
 * links; three optional lines under "Before the day", autosaving; "Read last
 * night's reflections" when an evening was written; "Review the day" on its
 * fade at the foot.
 *
 * WHAT IT NEVER SHOWS: a time, a countdown, a count, the second person,
 * anything red, a header or the tabs. Nothing here reads the clock; the date
 * is the day key's. A late open is this same frame, on purpose.
 *
 * ONLY THE READING FAILS on its own (D-USE-63): the lines always type and
 * save, and "Review the day" always works.
 *
 * Focus on open is the heading, not a field, so no keyboard rises over the
 * reading at 7am.
 */

const FIELDS: ReadonlyArray<{ key: LineKey; label: string; max: number }> = [
  { key: "grateful", label: COPY.grateful, max: MORNING_GRATITUDE_MAX },
  { key: "intention", label: COPY.intention, max: INTENTION_MAX },
  { key: "todayAsISeeIt", label: COPY.todayAsISeeIt, max: VISUALISATION_MAX },
];

export function OrientFrame() {
  const dateKey = useTodayKey();
  const { decided, entered } = useDayEntryGate("orient", dateKey);
  const frame = useOrientFrame(dateKey, entered);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  // A scenario's `view.open` seeds an overlay once, for a capture.
  const seeded = useDataSource().scenario.view?.open;
  const [lastNightOpen, setLastNightOpen] = React.useState(
    seeded === "last-night",
  );
  const lastNightRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (entered) headingRef.current?.focus();
  }, [entered]);

  // The three lines the sheet reads back; none written, no link to it.
  const lastNight = lastNightEntries(frame.lastNight, frame.prompts);

  // Not shown until the day's answer is Orient: a second open goes straight on.
  if (decided === null || !entered) return null;

  const readingState =
    frame.reading.status === "success"
      ? { status: "success" as const, data: frame.reading.data }
      : frame.reading.status === "error"
        ? { status: "error" as const, retry: () => void frame.retryReading() }
        : { status: "pending" as const };

  return (
    <main id="main" className="flex min-h-dvh flex-col bg-background">
      <ScreenFrame
        width="text"
        className="mx-auto flex max-w-(--measure) flex-1 flex-col gap-(--space-6) pb-0 wide:max-w-(--content-text) wide:pb-0"
      >
        <header className="flex flex-col gap-(--space-1)">
          <Text as="p" variant="caption" tone="muted">
            {dateLabelOf(dateKey)}
          </Text>
          <Text as="h1" ref={headingRef} tabIndex={-1} className="outline-none">
            {COPY.title}
          </Text>
        </header>

        <OrientReading
          state={readingState}
          readerOpenAtStart={seeded === "passage"}
        />

        <section
          aria-labelledby="before-the-day"
          className="flex flex-col gap-(--space-3)"
        >
          <div className="flex items-baseline justify-between gap-(--space-3)">
            <Text as="h2" id="before-the-day" variant="secondary" weight={600}>
              {COPY.beforeTheDay}
            </Text>
            <SaveStatusText status={frame.status} onRetry={frame.retrySave} />
          </div>
          {FIELDS.map((field) => (
            <Textarea
              key={field.key}
              label={field.label}
              value={frame.lines[field.key]}
              maxLength={field.max}
              rows={1}
              autoGrow
              onChange={(event) => frame.onLine(field.key, event.target.value)}
              onBlur={frame.onBlur}
              classes={{
                label: "mb-(--space-1) text-muted-foreground",
                // About five lines, then it scrolls inside (D-USE-14).
                textarea:
                  "min-h-(--target) max-h-[calc(var(--lh-body)*5+var(--space-6))] overflow-y-auto px-(--space-3)",
              }}
            />
          ))}
        </section>

        {frame.lastNight !== null && lastNight.length > 0 ? (
          <TextDisclosureButton
            ref={lastNightRef}
            expanded={lastNightOpen}
            aria-haspopup="dialog"
            onClick={() => setLastNightOpen(true)}
            collapsedLabel={
              <span className="inline-flex items-center gap-(--space-1)">
                {COPY.lastNight}
                <DisclosureIcon aria-hidden="true" className="size-4" />
              </span>
            }
            expandedLabel={COPY.lastNight}
            classes={{ root: "self-start text-muted-foreground" }}
          />
        ) : null}
        {frame.lastNight !== null ? (
          <LastNightSheet
            open={lastNightOpen && lastNight.length > 0}
            onOpenChange={setLastNightOpen}
            onDate={frame.lastNight.onDate}
            entries={lastNight}
            returnFocusRef={lastNightRef}
          />
        ) : null}

        {/* D-USE-25: the button floats on a fade to the background. */}
        <div className="sticky bottom-0 mt-auto bg-linear-to-b from-transparent to-background pt-(--space-8) pb-[max(env(safe-area-inset-bottom),var(--space-4))]">
          <Button
            size="lg"
            className="w-full font-semibold"
            onClick={frame.review}
          >
            {COPY.review}
          </Button>
        </div>
      </ScreenFrame>
    </main>
  );
}
