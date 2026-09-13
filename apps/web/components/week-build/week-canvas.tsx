"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import {
  Button,
  ConfirmDialog,
  ListRow,
  ScreenFrame,
  SkeletonRow,
  StatusLine,
  Text,
} from "@syn/ui";
import { weekDates, weekdayIndex } from "@syn/utils";

import { useOnline } from "@/lib/hooks/use-online";
import { settingsYourDayRoute } from "@/lib/routes";
import { trpc, type RouterOutputs } from "@/lib/trpc/client";

import { WEEK_COPY as COPY } from "./copy";
import { DaySheet } from "./day-sheet";

type DayPlanView = RouterOutputs["week"]["get"]["days"][number];

/**
 * WK-01 — the week, seven rows, one template each.
 *
 * A WEEK IS NOT A TABLE. Its status is derived from its days (SET-1's ruling),
 * so a week cannot say *planned* after its last template was removed.
 *
 * PAST DAYS ARE MUTED, NOT DISABLED. The row still opens; WK-02 is what
 * decides that a past day's template and start are read-only while its
 * one-offs are not (cross-cutting §8.1). Locking the row here would also lock
 * the one thing a person is still allowed to do with yesterday.
 */
export function WeekCanvas({
  weekKey,
  embedded = false,
  onBuildTemplate,
}: {
  weekKey: string;
  /**
   * What *Build one* does when the account has no templates at all (Epic 1
   * FR-04 / WK-01's empty-templates state).
   *
   * The caller supplies it because the two callers must not do the same thing:
   * the settings screen navigates to the editor, while first run has to stay
   * inside the sequence — a wizard that navigates away at step 4 has lost the
   * person. Omitted, the state is not offered at all.
   */
  onBuildTemplate?: () => void;
  /**
   * SET-7's: first run renders the week inside the step frame, so the canvas
   * drops its own padding and its *Templates* link. The seven rows, the
   * targets line and the day sheet are all unchanged — "WK-01 in full" is the
   * document's phrase, and a link out of a sequence is chrome, not content.
   */
  embedded?: boolean;
}) {
  const router = useRouter();
  const online = useOnline();
  const utils = trpc.useUtils();

  const [openDate, setOpenDate] = React.useState<string | null>(null);
  const [copyOpen, setCopyOpen] = React.useState(false);

  const week = trpc.week.get.useQuery({ week: weekKey });
  const templates = trpc.template.list.useQuery({ includeArchived: false });
  const me = trpc.user.me.useQuery();
  const copy = trpc.week.copyLastWeek.useMutation();
  const prefill = trpc.week.prefill.useMutation();
  const [prefilled, setPrefilled] = React.useState<number | null>(null);

  const days = week.data?.days ?? [];
  const targets = week.data?.targets ?? [];
  const plannedCount = days.filter((day) => day.planned).length;

  // A *sometimes* work day with no plan shows its shape as a question (§3.9).
  const workDays = me.data?.workDays ?? null;
  const isSometimes = (date: string): boolean =>
    workDays !== null && workDays[String(weekdayIndex(date)) as keyof typeof workDays] === "sometimes";

  // Only once the list has actually loaded: offering *Build one* against an
  // undefined query would flash the empty state at someone who has templates.
  const noTemplates =
    templates.isSuccess && (templates.data?.length ?? 0) === 0;

  return (
    <ScreenFrame width="canvas" padded={false} className={embedded ? "px-0" : undefined}>
      <div className="flex flex-col gap-(--space-4)">
        {!online ? <StatusLine variant="offline" placement="inline" /> : null}

        {targets.length === 0 ? null : (
          <ul className="flex flex-wrap items-center gap-(--space-3)">
            {targets.map((target) => (
              <li key={target.templateId} className="flex items-center gap-(--space-2)">
                {target.mostBehind ? (
                  <>
                    <span
                      aria-hidden
                      className="bg-accent-mark size-1.5 shrink-0 rounded-full"
                    />
                    <span className="sr-only">{COPY.mostBehind}</span>
                  </>
                ) : null}
                <Text as="span" variant="caption" tone="secondary">
                  {COPY.targetLine(target.name, target.used, target.target)}
                </Text>
              </li>
            ))}
          </ul>
        )}

        {week.data?.status === "unplanned" ? (
          <Text as="p" variant="body" tone="secondary">
            {COPY.unplannedLead}
          </Text>
        ) : null}

        {noTemplates && onBuildTemplate !== undefined ? (
          <div className="flex flex-wrap items-center gap-(--space-3)">
            <Text as="p" variant="body" tone="secondary">
              {COPY.noTemplatesYet}
            </Text>
            <Button variant="secondary" onClick={onBuildTemplate}>
              {COPY.buildOne}
            </Button>
          </div>
        ) : null}

        {week.isLoading ? (
          <div className="flex flex-col gap-(--space-2)">
            {weekDates(weekKey).map((date) => (
              <SkeletonRow key={date} />
            ))}
          </div>
        ) : (
          /*
           * Stacked on compact, a seven-column grid of the same rows on wide.
           * CSS grid rather than seven flex columns (the ticket leaves this to
           * the dev): the rows keep one DOM order, so the tab order and the
           * reading order stay Monday-first at both widths.
           */
          <ul className="grid grid-cols-1 gap-(--space-2) wide:grid-cols-7">
            {days.map((day) => (
              <ListRow
                key={day.date}
                as="li"
                muted={day.isPast}
                title={
                  <span className="flex items-center gap-(--space-2)">
                    <span>{day.weekday}</span>
                    <Text as="span" variant="caption" tone="secondary">
                      {monthDay(day.date)}
                    </Text>
                  </span>
                }
                tag={day.isToday ? COPY.today : undefined}
                meta={<DayMeta day={day} sometimes={isSometimes(day.date)} />}
                ariaLabel={rowLabel(day, isSometimes(day.date))}
                onClick={() => setOpenDate(day.date)}
              />
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center gap-(--space-3)">
          {/* UX v1.1 §4.13: the profile plans the week; the build reads it. */}
          {week.isSuccess && plannedCount < days.length ? (
            <Button
              variant={plannedCount === 0 ? "secondary" : "ghost"}
              disabled={!online}
              busy={prefill.isPending}
              onClick={() => {
                void prefill.mutateAsync({ week: weekKey }).then(async (result) => {
                  await utils.week.get.invalidate();
                  setPrefilled(result.planned);
                });
              }}
            >
              {COPY.planFromDefaults}
            </Button>
          ) : null}
          {prefilled === null ? null : (
            <Text as="span" variant="caption" tone="secondary" aria-live="polite">
              {COPY.planFromDefaultsDone(prefilled)}
            </Text>
          )}
          {week.data?.lastWeekPlanned ? (
            <Button
              variant="ghost"
              disabled={!online}
              onClick={() => setCopyOpen(true)}
            >
              {COPY.copyLastWeek}
            </Button>
          ) : null}
          {embedded ? null : (
            <Button
              variant="ghost"
              onClick={() => router.push(settingsYourDayRoute())}
            >
              {COPY.templatesLink}
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={copyOpen}
        onOpenChange={setCopyOpen}
        title={COPY.copyTitle}
        description={
          <span className="flex flex-col gap-(--space-1)">
            <span>{COPY.copyBody}</span>
            {plannedCount > 0 ? (
              <span>{COPY.copyOverwriteLine(plannedCount)}</span>
            ) : null}
          </span>
        }
        confirmLabel={COPY.copyConfirm}
        cancelLabel={COPY.cancel}
        busy={copy.isPending}
        onConfirm={() => {
          void copy
            .mutateAsync({ week: weekKey, overwrite: plannedCount > 0 })
            .then(async () => {
              await utils.week.get.invalidate();
              setCopyOpen(false);
            });
        }}
        onCancel={() => setCopyOpen(false)}
      />

      {openDate === null ? null : (
        <DaySheet
          open
          date={openDate}
          onOpenChange={(next) => {
            if (!next) setOpenDate(null);
          }}
        />
      )}
    </ScreenFrame>
  );
}

/**
 * The row's one line — UX v1.1 §4.13: "its shape, its morning, its focus, its
 * workout, and its fixtures — as one line of muted text: *Menu · Viewpoint ·
 * Push · Stand-up 9:30*". What is null is left out; a *sometimes* work day
 * with no plan shows its shape as a question (§3.9).
 */
function lineParts(day: DayPlanView, sometimes: boolean): string[] {
  const parts: string[] = [];
  if (day.shape !== null) parts.push(day.shape === "structured" ? COPY.structured : COPY.unstructured);
  else if (sometimes) parts.push(COPY.shapeUnknown);
  if (day.morningLabel !== null) parts.push(day.morningLabel);
  if (day.shape === "structured") parts.push(day.focusLabel ?? COPY.decideInTheMorning);
  if (day.workoutLabel !== null) parts.push(day.workoutLabel);
  parts.push(...day.fixtureLabels);
  if (day.oneOffCount > 0) parts.push(COPY.oneOffCount(day.oneOffCount));
  return parts;
}

function DayMeta({ day, sometimes }: { day: DayPlanView; sometimes: boolean }) {
  const parts = lineParts(day, sometimes);
  return (
    <Text as="span" variant="caption" tone="secondary">
      {parts.length === 0 ? COPY.nothingPlanned : parts.join(" · ")}
    </Text>
  );
}

/**
 * The row's accessible name, spoken as one sentence — the same facts the
 * line shows, so a screen reader hears one row rather than five fragments.
 */
function rowLabel(day: DayPlanView, sometimes: boolean): string {
  const parts = [`${day.weekday} ${monthDay(day.date)}`];
  if (day.isToday) parts.push(COPY.today);
  const line = lineParts(day, sometimes);
  parts.push(...(line.length === 0 ? [COPY.nothingPlanned] : line));
  return parts.join(", ");
}

/** "3 Sept" — the date without its year, which the header already carries. */
function monthDay(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return dateKey;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

/** "1 – 7 Sept 2026" — the header's title. */
export function weekRangeLabel(weekKey: string): string {
  const dates = weekDates(weekKey);
  const first = dates[0];
  const last = dates[dates.length - 1];
  if (first === undefined || last === undefined) return weekKey;
  return `${monthDay(first)} – ${monthDay(last)}`;
}
