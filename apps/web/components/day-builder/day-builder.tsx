"use client";

import * as React from "react";

import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { BuilderFrame } from "./builder-frame";
import { BuilderSkeleton } from "./builder-skeleton";
import { DAY_BUILDER_COPY as COPY } from "./copy";
import { ScreenMorning } from "./screens/13e-morning";
import { ScreenBreaks } from "./screens/13f-breaks";
import { ScreenWindDown } from "./screens/13h-wind-down";
import { ScreenReview } from "./screens/13i-review";
import { ScreenNameDays } from "./screens/b01-name-days";
import { ScreenTimes } from "./screens/b02-times";
import { ScreenWork } from "./screens/b03-work";
import { ScreenTraining } from "./screens/b04-training";
import { ScreenGettingReady } from "./screens/b05-getting-ready";
import { ScreenFixed } from "./screens/b06-fixed";
import { ScreenSoFar } from "./screens/b07-so-far";
import { useDayBuilder, visibleScreens, type BuilderScreen } from "./use-day-builder";

/**
 * The screens this build can draw. B1–B7 are DAY-9's; B11, B12, B13 and B17
 * are v1.2's `13e`, `13h`, `13f` and `13i` behind them — THE TEMPORARY
 * TABLE, which DAY-10 (B8–B12) and DAY-11 (B13–B17) shrink to nothing.
 * B8–B10 and B14–B16 have no v1.2 screen at all; until their tickets land
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
  const [saving, setSaving] = React.useState(false);

  const plan = api.plan;
  const workoutCount = React.useMemo(() => api.habitsOf((habit) => habit.type === "workout").length, [api]);
  const screens = React.useMemo(
    () => (plan === null ? [] : visibleScreens(plan, api.profile, workoutCount).filter((key) => BUILT.has(key))),
    [plan, api.profile, workoutCount],
  );
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
      case "b11":
        return COPY.e.heading;
      case "b12":
        return COPY.h.heading;
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
        disabled: loading || (screen === "b03" && !workReady),
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
          {/* The temporary table — v1.2's screens behind B11, B12, B13 and B17 until DAY-10 and DAY-11. */}
          {screen === "b11" ? <ScreenMorning api={api} disabled={disabled} onTotal={setMorningTotal} /> : null}
          {screen === "b12" ? <ScreenWindDown api={api} disabled={disabled} /> : null}
          {screen === "b13" ? <ScreenBreaks api={api} disabled={disabled} /> : null}
          {screen === "b17" ? <ScreenReview api={api} disabled={disabled} onGo={go} /> : null}
        </>
      )}
    </BuilderFrame>
  );
}
