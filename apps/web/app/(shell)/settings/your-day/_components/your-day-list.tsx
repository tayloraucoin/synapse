"use client";

import * as React from "react";

import { SettingsRow, SkeletonBlock } from "@syn/ui";
import type { BlockKind, WorkDays } from "@syn/types";
import { formatClockFromMinutes, clockToMinutes } from "@syn/utils";

import { trpc } from "@/lib/trpc/client";
import {
  settingsYourDayBlockRoute,
  settingsYourDayOrderRoute,
  settingsYourDayScreenRoute,
} from "@/lib/routes";

import { YOUR_DAY_COPY as COPY } from "./copy";

/**
 * Settings → Your day — UX v1.3 §4.6 (DAY-8): "The first-run screens,
 * without the frame, as a list … the block-kind rows open the block editor
 * for that kind".
 *
 * V1.3'S ROWS, IN THE DOCUMENT'S ORDER. The fact screens and the builder's
 * lists open embedded; *First thing* opens B8's screen, links and all
 * (DAY-12); *Getting ready · Morning
 * routine · After work · Evenings · Wind-down* open the block editor for
 * prep, morning, transition, activity and wind-down; *Block order* is its own
 * list. *Free-time activities* and *Each morning* (DAY-12) complete v1.3's
 * list; *Work start*, *Work-day types* and *Wake* are retired and their
 * routes redirect, and *Before the day* redirects to *First thing*.
 *
 * A VALUE NEVER SPINS (cross-cutting G5): while the account loads each row
 * shows a `SkeletonBlock` where its value goes.
 */
export function YourDayList() {
  const me = trpc.user.me.useQuery();
  const fixtures = trpc.fixture.list.useQuery({ includeArchived: false });
  const templates = trpc.template.list.useQuery({ includeArchived: false });
  const passages = trpc.passage.list.useQuery();
  const plans = trpc.dayPlan.list.useQuery(undefined);
  const activities = trpc.habit.list.useQuery({ includeArchived: false, blockKind: "activity" });

  const value = (text: string | null | undefined): React.ReactNode =>
    text === undefined ? <SkeletonBlock heightPx={16} className="max-w-32" /> : (text ?? undefined);

  const data = me.data;
  const countOf = (kind: BlockKind) =>
    templates.data === undefined
      ? undefined
      : COPY.templates(templates.data.filter((template) => template.kind === kind).length);

  const blockRow = (title: string, kind: BlockKind) => (
    <SettingsRow key={kind} title={title} description={value(countOf(kind))} href={settingsYourDayBlockRoute(kind)} />
  );

  return (
    <ul className="flex flex-col">
      <SettingsRow
        title={COPY.rows.shape}
        description={value(
          data === undefined ? undefined : data.scheduleShape === null ? null : COPY.shapes[data.scheduleShape],
        )}
        href={settingsYourDayScreenRoute("shape")}
      />
      <SettingsRow
        title={COPY.rows.workDays}
        description={value(data === undefined ? undefined : workDaysLabel(data.workDays))}
        href={settingsYourDayScreenRoute("work-days")}
      />
      {/* RUN-12: the day plans and the builder, embedded. */}
      <SettingsRow
        title={COPY.rows.yourDays}
        description={value(plans.data === undefined ? undefined : COPY.days(plans.data.length))}
        href={settingsYourDayScreenRoute("your-days")}
      />
      {/* v1.3 §4.6 (DAY-12): B8's screen — passages, links, the quote, the three lines. */}
      <SettingsRow
        title={COPY.rows.firstThing}
        description={value(
          data === undefined || passages.data === undefined
            ? undefined
            : orientLabel(passages.data.length, data.quotesOptIn, [
                data.orientAskGratitude,
                data.orientAskIntention,
                data.orientAskVisualisation,
              ]),
        )}
        href={settingsYourDayScreenRoute("first-thing")}
      />
      <SettingsRow title={COPY.rows.morningHabits} href={settingsYourDayScreenRoute("morning-habits")} />
      <SettingsRow title={COPY.rows.ranked} href={settingsYourDayScreenRoute("ranked")} />
      <SettingsRow
        title={COPY.rows.freeTime}
        description={value(activities.data === undefined ? undefined : COPY.activities(activities.data.habits.filter((habit) => habit.type === "habit").length))}
        href={settingsYourDayScreenRoute("free-time")}
      />
      <SettingsRow
        title={COPY.rows.training}
        description={value(countOf("training"))}
        href={settingsYourDayScreenRoute("training")}
      />
      <SettingsRow
        title={COPY.rows.commitments}
        description={value(fixtures.data === undefined ? undefined : COPY.fixtures(fixtures.data.length))}
        href={settingsYourDayScreenRoute("commitments")}
      />
      {/* DYN-18: the screen, not the editor — its ghost row reaches the editor. */}
      <SettingsRow
        title={COPY.rows.closingTheDay}
        description={value(
          data === undefined
            ? undefined
            : data.lightsOutTime === null
              ? null
              : `${clock(data.lightsOutTime)}${data.journalEnabled ? ` · ${COPY.journalOn}` : ""}`,
        )}
        href={settingsYourDayScreenRoute("closing-the-day")}
      />
      <SettingsRow
        title={COPY.rows.focuses}
        description={value(countOf("work"))}
        href={settingsYourDayScreenRoute("focuses")}
      />
      {blockRow(COPY.rows.gettingReady, "prep")}
      {blockRow(COPY.rows.morningRoutine, "morning")}
      {blockRow(COPY.rows.afterWork, "transition")}
      {blockRow(COPY.rows.evenings, "activity")}
      {blockRow(COPY.rows.windDown, "wind_down")}
      <SettingsRow
        title={COPY.rows.eachMorning}
        description={value(data === undefined ? undefined : COPY.modes[data.morningMode])}
        href={settingsYourDayScreenRoute("each-morning")}
      />
      <SettingsRow title={COPY.rows.blockOrder} href={settingsYourDayOrderRoute()} />
    </ul>
  );
}

/** "7:00" from the stored "07:00:00". */
function clock(stored: string): string {
  return formatClockFromMinutes(clockToMinutes(stored.slice(0, 5)));
}

/**
 * "Mon–Fri · Sat usually · Sun sometimes" — runs of *always*, then the
 * *usually* days (v1.3 R49; DAY-8), then the *sometimes* days.
 */
function workDaysLabel(days: WorkDays | null): string | null {
  if (days === null) return null;
  const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const keys = ["0", "1", "2", "3", "4", "5", "6"] as const;
  const always = keys.filter((key) => days[key] === "always").map((key) => Number(key));
  const usually = keys.filter((key) => days[key] === "usually").map((key) => names[Number(key)]);
  const sometimes = keys.filter((key) => days[key] === "sometimes").map((key) => names[Number(key)]);

  const runs: string[] = [];
  let start: number | null = null;
  for (let day = 0; day <= 7; day += 1) {
    const on = day < 7 && always.includes(day);
    if (on && start === null) start = day;
    if (!on && start !== null) {
      const end = day - 1;
      runs.push(end === start ? names[start]! : end === start + 1 ? `${names[start]}, ${names[end]}` : `${names[start]}–${names[end]}`);
      start = null;
    }
  }

  const parts = [runs.join(", ")];
  if (usually.length > 0) parts.push(`${usually.join(", ")} usually`);
  if (sometimes.length > 0) parts.push(`${sometimes.join(", ")} sometimes`);
  const label = parts.filter((part) => part !== "").join(" · ");
  return label === "" ? COPY.nothing : label;
}

/** "passage · both" — what the morning shows before the day. */
/** UX v1.2 (RUN-9): "2 passages · a quote · 3 lines" — what the morning opens on. */
function orientLabel(passages: number, quote: boolean, lines: readonly boolean[]): string {
  const parts: string[] = [];
  if (passages > 0) parts.push(COPY.passages(passages));
  if (quote) parts.push(COPY.aQuote);
  const on = lines.filter(Boolean).length;
  if (on > 0) parts.push(COPY.lines(on));
  return parts.length === 0 ? COPY.nothing : parts.join(" · ");
}
