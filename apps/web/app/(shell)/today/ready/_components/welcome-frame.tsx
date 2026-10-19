"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  Button,
  cn,
  ReviewIcon,
  ScheduleIcon,
  Text,
  TodayIcon,
  type LucideIcon,
} from "@syn/ui";
import type { WelcomeRow, WelcomeView } from "@syn/utils";
import { OfflineLine } from "@/components/planner";
import { BLOCK_HUE, HUE_DOT } from "@/components/planner/block-hue";
import { DayBar } from "@/components/planner/day-bar";
import { useIsOffline } from "@/lib/data/source";
import { useStartedOnDevice } from "@/lib/data/use-day-entry";
import { useTodayKey } from "@/lib/data/use-morning";
import { useWelcome } from "@/lib/data/use-welcome";
import { todayReviewRoute, todayRoute } from "@/lib/routes";
import {
  arrived,
  fadeNavigate,
  takeStill,
} from "../../_components/fade-navigate";
import { clockLabel } from "../../_components/now/copy";
import { useDayEntryGate } from "../../../_components/day-entry-gate";
import { dateLabelOf } from "../../../orient/_components/date-label";
import { WELCOME_COPY as COPY } from "./copy";

/**
 * The Ready, go welcome (USE-43; interactions/ready-go/, D-USE-71): the
 * focused screen between Review the day and Now. Top to bottom: "‹ Review
 * the day"; the date over "The day is set."; Orient's line when it has
 * words (or, the first go ever, the tabs it teaches); the day as one bar;
 * First (or Now, a block under way) in Block complete's style; one button
 * on a fade that starts the block in hand.
 *
 * NOTHING MOVES ON BY ITSELF (D-USE-71): no timer, no auto-advance; only
 * Start leaves. Start remembers the day as started on this device and goes
 * to /today; a reopen before it shows the welcome again, after it Now.
 *
 * It fades in from Review the day, its sections rising 8 px one after
 * another, one `--dur-state` apart; from the keyboard or under reduced
 * motion they land in place (opacity only, at zero). Focus lands on the
 * title. Focused at every width (D-USE-39): one column capped at
 * `--content-text`, the button right-aligned at 240 at the desk.
 */

const TAB_ICON: Record<(typeof COPY.tabs)[number]["tab"], LucideIcon> = {
  today: TodayIcon,
  schedule: ScheduleIcon,
  review: ReviewIcon,
};

function caption(view: WelcomeView): string {
  const start = view.start;
  if (start === null) return "";
  if (start.form === "list") return COPY.oneList;
  const at = clockLabel(start.startsAt);
  return start.form === "under-way" ? COPY.pickUp(at) : COPY.early(at);
}

function startLabel(view: WelcomeView): string {
  const start = view.start;
  if (start === null) return COPY.loading;
  return start.form === "list" ? COPY.openList : COPY.start(start.name);
}

export function WelcomeFrame() {
  const router = useRouter();
  const dateKey = useTodayKey();
  const { entered } = useDayEntryGate("welcome", dateKey);
  const { view, today } = useWelcome(dateKey);
  const { markStarted } = useStartedOnDevice(dateKey);
  const offline = useIsOffline();
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const [still] = React.useState(takeStill);
  const ready = entered && view !== undefined;

  React.useEffect(() => {
    if (!ready) return;
    headingRef.current?.focus();
    // The fade from Review the day takes its picture now; the sections rise.
    arrived();
  }, [ready]);

  // Leaving for Now: the fade's new picture is Now's.
  React.useEffect(() => () => arrived(), []);

  // Not shown until the day's answer is the welcome: after Start it goes on.
  if (!entered) return null;

  /** A path with this screen's query kept, so `?state=` travels. */
  const kept = (path: string) => `${path}${window.location.search}`;

  function onStart(event: React.MouseEvent) {
    markStarted();
    fadeNavigate(() => router.push(kept(todayRoute())), {
      keyboard: event.detail === 0,
    });
  }

  /** The nth section's rise: 8 px and opacity, one `--dur-state` apart. */
  const rise = (index: number) =>
    still
      ? {}
      : {
          className: "motion-safe:animate-rise motion-reduce:animate-fade-in",
          style: { animationDelay: `calc(var(--dur-state) * ${index})` },
        };

  let section = 0;

  return (
    <main id="main" className="flex h-dvh flex-col bg-background">
      {offline ? <OfflineLine text={COPY.offline} /> : null}
      <div className="mx-auto flex min-h-0 w-full flex-1 flex-col split:max-w-(--content-text)">
        <div className="min-h-0 flex-1 overflow-y-auto px-(--space-4) pt-(--space-4) pb-(--space-8)">
          <div className="flex flex-col gap-(--space-6)">
            <header className="flex flex-col gap-(--space-3)">
              <Breadcrumb
                label={COPY.back}
                href={kept(todayReviewRoute())}
                ariaLabel={COPY.backLabel}
              />
              <div {...rise(section++)}>
                <Text
                  as="p"
                  variant="caption"
                  tone="muted"
                  className="tracking-wide uppercase"
                >
                  {dateLabelOf(dateKey)}
                </Text>
                <Text
                  as="h1"
                  variant="review-headline"
                  ref={headingRef}
                  tabIndex={-1}
                  className="outline-none"
                >
                  {COPY.title}
                </Text>
              </div>
            </header>

            {view?.orientLine ? (
              <section aria-labelledby="welcome-orient" {...rise(section++)}>
                <Text
                  as="h2"
                  id="welcome-orient"
                  variant="caption"
                  tone="muted"
                  className="mb-(--space-2)"
                >
                  {COPY.orient}
                </Text>
                <blockquote className="m-0 border-s-2 border-border ps-(--space-3)">
                  <Text as="p" variant="review-sentence" className="italic">
                    {view.orientLine}
                  </Text>
                </blockquote>
              </section>
            ) : null}

            {view !== undefined && today !== undefined ? (
              <>
                <section aria-labelledby="welcome-day" {...rise(section++)}>
                  <Text
                    as="h2"
                    id="welcome-day"
                    variant="caption"
                    tone="muted"
                    className="mb-(--space-2)"
                  >
                    {COPY.day}
                  </Text>
                  <DayBar
                    label={COPY.day}
                    from={view.bar.from}
                    to={view.bar.to}
                    nowAt={view.bar.nowMin}
                    segments={view.bar.segments.map((segment) => ({
                      id: segment.blockId,
                      label: segment.label,
                      initial: segment.initial,
                      kindColor:
                        BLOCK_HUE[segment.kind as keyof typeof BLOCK_HUE] ??
                        "slate",
                      startMin: segment.startMin,
                      endMin: segment.endMin,
                      faded: segment.faded,
                    }))}
                  />
                </section>

                {view.rows.length > 0 ? (
                  <section aria-labelledby="welcome-first" {...rise(section++)}>
                    <Text
                      as="h2"
                      id="welcome-first"
                      variant="caption"
                      tone="muted"
                      className="mb-(--space-1)"
                    >
                      {view.heading === "now" ? COPY.now : COPY.first}
                    </Text>
                    <ul className="m-0 flex list-none flex-col p-0">
                      {view.rows.map((row) => (
                        <WelcomeRowItem
                          key={row.blockId}
                          row={row}
                          kind={
                            today.occurrences.blocks.find(
                              (occurrence) =>
                                occurrence.block.id === row.blockId,
                            )?.block.kind
                          }
                        />
                      ))}
                    </ul>
                  </section>
                ) : null}

                {view.teaching ? (
                  <section
                    aria-labelledby="welcome-teaching"
                    {...rise(section++)}
                  >
                    <Text
                      as="h2"
                      id="welcome-teaching"
                      variant="caption"
                      tone="muted"
                      className="mb-(--space-2)"
                    >
                      {COPY.teaching}
                    </Text>
                    <ul className="m-0 flex list-none flex-col gap-(--space-2) p-0">
                      {COPY.tabs.map((tab) => {
                        const Icon = TAB_ICON[tab.tab];
                        return (
                          <li
                            key={tab.tab}
                            className="flex items-center gap-(--space-3)"
                          >
                            <Icon
                              aria-hidden="true"
                              className="size-5 shrink-0 text-foreground"
                            />
                            <Text
                              as="span"
                              variant="body"
                              weight={600}
                              className="w-20 shrink-0"
                            >
                              {tab.name}
                            </Text>
                            <Text as="span" variant="secondary" tone="muted">
                              {tab.line}
                            </Text>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ) : null}
              </>
            ) : null}
          </div>
        </div>

        {/* D-USE-25: the button floats on a fade to the background. */}
        <footer className="relative flex flex-col gap-(--space-2) px-(--space-4) pt-(--space-3) pb-[max(env(safe-area-inset-bottom),var(--space-4))] split:items-end split:border-t split:border-border">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-full h-(--space-8) bg-linear-to-b from-transparent to-background split:hidden"
          />
          <Button
            size="lg"
            className="w-full font-semibold split:w-60"
            disabled={view === undefined || view.start === null}
            onClick={onStart}
          >
            {view === undefined ? COPY.loading : startLabel(view)}
          </Button>
          {view !== undefined && view.start !== null ? (
            <Text
              as="p"
              variant="caption"
              tone="muted"
              className="text-center split:w-60"
            >
              {caption(view)}
            </Text>
          ) : null}
        </footer>
      </div>
    </main>
  );
}

function WelcomeRowItem({
  row,
  kind,
}: {
  row: WelcomeRow;
  kind: string | undefined;
}) {
  const hue = BLOCK_HUE[kind as keyof typeof BLOCK_HUE] ?? "slate";
  const time = row.allDay
    ? COPY.allDay
    : row.underWay
      ? COPY.underWay(clockLabel(row.endsAt))
      : row.lead
        ? COPY.span(clockLabel(row.startsAt), clockLabel(row.endsAt))
        : clockLabel(row.startsAt);
  return (
    <li className="flex min-h-(--row-min) items-center gap-(--space-3) border-b border-border last:border-b-0">
      <span
        aria-hidden="true"
        className={cn(
          "size-2 shrink-0 rounded-full",
          row.lead ? HUE_DOT[hue] : "border border-muted-foreground",
        )}
      />
      <Text
        as="span"
        variant="body"
        tone={row.lead ? "ink" : "muted"}
        weight={row.lead ? 600 : 400}
        className="min-w-0 flex-1 truncate"
      >
        {row.lead ? row.name : COPY.then(row.name)}
      </Text>
      <Text
        as="span"
        variant="secondary"
        tone={row.lead ? "ink" : "muted"}
        tabular
        className="shrink-0"
      >
        {time}
      </Text>
    </li>
  );
}
