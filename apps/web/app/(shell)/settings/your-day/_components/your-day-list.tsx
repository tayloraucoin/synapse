"use client";

import * as React from "react";

import { SettingsRow, SkeletonBlock } from "@syn/ui";
import type { WorkDays } from "@syn/types";
import { formatClockFromMinutes, clockToMinutes } from "@syn/utils";

import { trpc } from "@/lib/trpc/client";
import {
  settingsYourDayBlockRoute,
  settingsYourDayOrderRoute,
  settingsYourDayScreenRoute,
} from "@/lib/routes";

import { YOUR_DAY_COPY as COPY } from "./copy";

/**
 * Settings → Your day — UX v1.1 §4.14: "The first-run screens, without the
 * frame, as a list … Each opens its screen; the block-kind rows open the
 * block editor for that kind".
 *
 * TWELVE ROWS, IN THE DOCUMENT'S ORDER. Rows 1–6 open DYN-10's screens
 * embedded; *Before work* and *Morning routine* open the editor for prep and
 * morning; *Closing the day* opens screen 10 embedded (DYN-18), which carries
 * the wind-down editor as a ghost row; *Training* and *Work focuses* open the
 * training and work editors until DYN-11 re-points them at its own screens;
 * *Block order* is its own list.
 *
 * A VALUE NEVER SPINS (cross-cutting G5): while the account loads each row
 * shows a `SkeletonBlock` where its value goes.
 */
export function YourDayList() {
  const me = trpc.user.me.useQuery();
  const fixtures = trpc.fixture.list.useQuery({ includeArchived: false });
  const templates = trpc.template.list.useQuery({ includeArchived: false });
  const passages = trpc.passage.list.useQuery();

  const value = (text: string | null | undefined): React.ReactNode =>
    text === undefined ? <SkeletonBlock heightPx={16} className="max-w-32" /> : (text ?? undefined);

  const data = me.data;
  const countOf = (kind: "prep" | "morning" | "training" | "wind_down" | "work") =>
    templates.data === undefined
      ? undefined
      : COPY.templates(templates.data.filter((template) => template.kind === kind).length);

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
      <SettingsRow
        title={COPY.rows.workStart}
        description={value(
          data === undefined
            ? undefined
            : data.workStartTime === null
              ? null
              : data.anchorDirection === null
                ? clock(data.workStartTime)
                : `${clock(data.workStartTime)} · ${COPY.gives[data.anchorDirection]}`,
        )}
        href={settingsYourDayScreenRoute("work-start")}
      />
      {/* UX v1.2 §4.16 (RUN-8): the types, one row — *2 types* or *Not yet*. */}
      <SettingsRow
        title={COPY.rows.workDayTypes}
        description={value(
          templates.data === undefined
            ? undefined
            : COPY.types(templates.data.filter((template) => template.kind === "work").length),
        )}
        href={settingsYourDayScreenRoute("work-day-types")}
      />
      <SettingsRow
        title={COPY.rows.commitments}
        description={value(fixtures.data === undefined ? undefined : COPY.fixtures(fixtures.data.length))}
        href={settingsYourDayScreenRoute("commitments")}
      />
      <SettingsRow
        title={COPY.rows.wake}
        description={value(data === undefined ? undefined : clock(data.usualWakeTime))}
        href={settingsYourDayScreenRoute("wake")}
      />
      <SettingsRow
        title={COPY.rows.beforeTheDay}
        description={value(
          data === undefined || passages.data === undefined
            ? undefined
            : orientLabel(passages.data.length, data.quotesOptIn, [
                data.orientAskGratitude,
                data.orientAskIntention,
                data.orientAskVisualisation,
              ]),
        )}
        href={settingsYourDayScreenRoute("before-the-day")}
      />
      <SettingsRow
        title={COPY.rows.beforeWork}
        description={value(countOf("prep"))}
        href={settingsYourDayBlockRoute("prep")}
      />
      <SettingsRow
        title={COPY.rows.morningRoutine}
        description={value(countOf("morning"))}
        href={settingsYourDayBlockRoute("morning")}
      />
      <SettingsRow
        title={COPY.rows.training}
        description={value(countOf("training"))}
        href={settingsYourDayScreenRoute("training")}
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
        title={COPY.rows.workFocuses}
        description={value(countOf("work"))}
        href={settingsYourDayScreenRoute("focuses")}
      />
      <SettingsRow title={COPY.rows.blockOrder} href={settingsYourDayOrderRoute()} />
    </ul>
  );
}

/** "7:00" from the stored "07:00:00". */
function clock(stored: string): string {
  return formatClockFromMinutes(clockToMinutes(stored.slice(0, 5)));
}

/** "Mon–Fri · Sat sometimes" — runs of *always*, then the *sometimes* days. */
function workDaysLabel(days: WorkDays | null): string | null {
  if (days === null) return null;
  const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const keys = ["0", "1", "2", "3", "4", "5", "6"] as const;
  const always = keys.filter((key) => days[key] === "always").map((key) => Number(key));
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
