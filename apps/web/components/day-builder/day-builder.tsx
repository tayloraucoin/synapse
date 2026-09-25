"use client";

import * as React from "react";

import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { BuilderFrame } from "./builder-frame";
import { BuilderSkeleton } from "./builder-skeleton";
import { DAY_BUILDER_COPY as COPY } from "./copy";
import { ScreenBreaks } from "./screens/13f-breaks";
import { ScreenReview } from "./screens/13i-review";
import { ScreenNameDays } from "./screens/b01-name-days";
import { ScreenTimes } from "./screens/b02-times";
import { ScreenWork } from "./screens/b03-work";
import { ScreenTraining } from "./screens/b04-training";
import { ScreenGettingReady } from "./screens/b05-getting-ready";
import { ScreenFixed } from "./screens/b06-fixed";
import { ScreenSoFar } from "./screens/b07-so-far";
import { ScreenFirstThing } from "./screens/b08-first-thing";
import { ScreenLandscape } from "./screens/b09-landscape";
import { ScreenRanked } from "./screens/b10-ranked";
import { ScreenMorning } from "./screens/b11-morning";
import { ScreenWindDown } from "./screens/b12-wind-down";
import { BUILDER_SCREENS, useDayBuilder, visibleScreens, type BuilderScreen } from "./use-day-builder";

/**
 * The screens this build can draw. B1–B12 are DAY-9's and DAY-10's; B13 and
 * B17 are v1.2's `13f` and `13i` behind them — THE TEMPORARY TABLE, which
 * DAY-11 (B13–B17) removes. B14–B16 have no v1.2 screen at all; until DAY-11
 * they are left out of the walk and the caption's count, rather than drawn
 * as an empty screen.
 */
const BUILT: ReadonlySet<BuilderScreen> = new Set([
  "b01",
  "b02",
  "b03",
  "b04",
  "b05",
  "b06",
  "b07",
  "b08",
  "b09",
  "b10",
  "b11",
  "b12",
  "b13",
  "b17",
]);

/**
 * The day builder — UX v1.3 §4.4 (R45; DAY-9): seventeen screens in the
 * order a day happens, one thing each.
 *
 * ONE PLAN, HELD BY `useDayBuilder`; every screen writes its part as it
 * goes and *Next* only moves. `visibleScreens` decides which screens this
 * plan shows (the first plan collects the libraries; a later one picks from
 * them); the caption counts those. *Back* is on the action row and in the
 * header, and on B1 returns to *Your days*. Every screen shows three
 * skeleton rows while its data is out (R63). *Save Day A* (the review) calls
 * `dayPlan.complete`; a plan left before that stays a draft and the list
 * says so. Offline, the builder is read-only with the standard line.
 * NOTHING HERE MATERIALISES.
 */
export function DayBuilder({
  planId,
  initialScreen = "b01",
  onExit,
  embedded = false,
}: {
  planId: string;
  initialScreen?: BuilderScreen;
  /** Back from B1, and after *Save Day A*. */
  onExit: () => void;
  embedded?: boolean;
}) {
  const online = useOnline();
  const api = useDayBuilder(planId);
  const complete = trpc.dayPlan.complete.useMutation();
  const utils = trpc.useUtils();
  const [screen, setScreen] = React.useState<BuilderScreen>(initialScreen);
  const [prepTotal, setPrepTotal] = React.useState(0);
  const [morningTotal, setMorningTotal] = React.useState(0);
  const [workReady, setWorkReady] = React.useState(false);
  const [morningReady, setMorningReady] = React.useState(false);
  const [firstThing, setFirstThing] = React.useState({ passages: 0, links: 0 });
  const [habitCount, setHabitCount] = React.useState(0);
  const [saving, setSaving] = React.useState(false);

  const plan = api.plan;
  const workoutCount = React.useMemo(() => api.habitsOf((habit) => habit.type === "workout").length, [api]);
  const screens = React.useMemo(() => {
    if (plan === null) return [];
    const visible = visibleScreens(plan, api.profile, workoutCount).filter((key) => BUILT.has(key));
    // A screen reached outside the walk — B11 by *Change for this day* on a shared routine — joins it in place.
    return visible.includes(screen) ? visible : BUILDER_SCREENS.filter((key) => key === screen || visible.includes(key));
  }, [plan, api.profile, workoutCount, screen]);
  const index = Math.max(0, screens.indexOf(screen));
  const disabled = !online;

  const go = (next: BuilderScreen) => {
    api.setLine(null);
    setScreen(next);
  };
  const back = () => {
    if (index === 0) onExit();
    else go(screens[index - 1] ?? "b01");
  };
  const forward = () => {
    const next = screens[index + 1];
    if (next !== undefined) go(next);
  };

  const save = async () => {
    if (plan === null) return;
    api.setLine(null);
    setSaving(true);
    try {
      await complete.mutateAsync({ id: plan.id, noWork: plan.work === null });
      await utils.dayPlan.list.invalidate();
      onExit();
    } catch (error) {
      const code = error instanceof Error ? error.message : "";
      api.setLine(COPY.completeRefused[code] ?? COPY.saveError);
    } finally {
      setSaving(false);
    }
  };

  const name = plan?.name ?? "";
  const caption = COPY.caption(name, index + 1, Math.max(1, screens.length));

  const heading = (() => {
    switch (screen) {
      case "b01":
        return COPY.b01.heading;
      case "b02":
        return COPY.b02.heading(name);
      case "b03":
        return COPY.b03.heading;
      case "b04":
        return COPY.b04.heading;
      case "b05":
        return COPY.b05.heading;
      case "b06":
        return COPY.b06.heading;
      case "b07":
        return COPY.b07.heading(name);
      case "b08":
        return COPY.b08.heading;
      case "b09":
        return COPY.b09.heading;
      case "b10":
        return COPY.b10.heading;
      case "b11":
        return COPY.b11.heading;
      case "b12":
        return COPY.b12.heading;
      case "b13":
        return COPY.f.heading;
      default:
        return COPY.i.heading(name);
    }
  })();

  const body = (() => {
    switch (screen) {
      case "b01":
        return COPY.b01.body;
      case "b05":
        return COPY.b05.body;
      case "b06":
        return COPY.b06.body;
      case "b07":
        return COPY.b07.body;
      case "b08":
        return COPY.b08.body;
      case "b09":
        return COPY.b09.body;
      case "b10":
        return COPY.b10.body;
      case "b13":
        return COPY.f.body;
      default:
        return undefined;
    }
  })();

  const primaryLabel = (() => {
    switch (screen) {
      case "b05":
        return COPY.nextWithMinutes(prepTotal);
      case "b08":
        return COPY.b08.next(firstThing.passages, firstThing.links);
      case "b09":
        return COPY.b09.next(habitCount);
      case "b11":
        return COPY.nextWithMinutes(morningTotal);
      case "b17":
        return COPY.saveDay(name);
      default:
        return COPY.next;
    }
  })();

  const skip = (() => {
    switch (screen) {
      case "b04":
        return {
          label: COPY.b04.notOnThisDay,
          onSkip: () => {
            void api.patch({ training: [] }).then(forward);
          },
        };
      case "b06":
        return { label: COPY.b06.skip, onSkip: forward };
      case "b08":
        return { label: COPY.b08.skip, onSkip: forward };
      case "b13":
        return {
          label: COPY.f.skip,
          onSkip: () => {
            void api.patch({ breaks: [] }).then(forward);
          },
        };
      default:
        return undefined;
    }
  })();

  const loading = plan === null || api.loading;

  return (
    <BuilderFrame
      caption={caption}
      heading={heading}
      body={body}
      screenKey={`${planId}:${screen}`}
      embedded={embedded}
      onBack={back}
      error={api.line}
      skip={skip}
      primary={{
        label: primaryLabel,
        onClick: () => {
          if (screen === "b17") void save();
          else forward();
        },
        busy: saving,
        disabled: loading || (screen === "b03" && !workReady) || (screen === "b11" && !morningReady),
      }}
    >
      {loading ? (
        <BuilderSkeleton />
      ) : (
        <>
          {screen === "b01" ? <ScreenNameDays api={api} disabled={disabled} /> : null}
          {screen === "b02" ? <ScreenTimes api={api} disabled={disabled} /> : null}
          {screen === "b03" ? <ScreenWork api={api} disabled={disabled} onReady={setWorkReady} /> : null}
          {screen === "b04" ? <ScreenTraining api={api} disabled={disabled} onForward={forward} /> : null}
          {screen === "b05" ? <ScreenGettingReady api={api} disabled={disabled} onTotal={setPrepTotal} /> : null}
          {screen === "b06" ? <ScreenFixed api={api} disabled={disabled} /> : null}
          {screen === "b07" ? <ScreenSoFar api={api} disabled={disabled} onGo={go} /> : null}
          {screen === "b08" ? <ScreenFirstThing api={api} onCounts={setFirstThing} /> : null}
          {screen === "b09" ? <ScreenLandscape onCount={setHabitCount} /> : null}
          {screen === "b10" ? <ScreenRanked /> : null}
          {screen === "b11" ? (
            <ScreenMorning api={api} disabled={disabled} onTotal={setMorningTotal} onReady={setMorningReady} />
          ) : null}
          {screen === "b12" ? <ScreenWindDown api={api} disabled={disabled} onGo={go} /> : null}
          {/* The temporary table — v1.2's screens behind B13 and B17 until DAY-11. */}
          {screen === "b13" ? <ScreenBreaks api={api} disabled={disabled} /> : null}
          {screen === "b17" ? <ScreenReview api={api} disabled={disabled} onGo={go} /> : null}
        </>
      )}
    </BuilderFrame>
  );
}
