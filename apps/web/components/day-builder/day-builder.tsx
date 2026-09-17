"use client";

import * as React from "react";

import { LoadingText } from "@syn/ui";

import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { BuilderFrame } from "./builder-frame";
import { DAY_BUILDER_COPY as COPY } from "./copy";
import { ScreenNameDays } from "./screens/13a-name-days";
import { ScreenShapeTimes } from "./screens/13b-shape-times";
import { ScreenTraining } from "./screens/13c-training";
import { ScreenGettingReady } from "./screens/13d-getting-ready";
import { ScreenMorning } from "./screens/13e-morning";
import { ScreenBreaks } from "./screens/13f-breaks";
import { ScreenEvening } from "./screens/13g-evening";
import { ScreenWindDown } from "./screens/13h-wind-down";
import { ScreenReview } from "./screens/13i-review";
import { BUILDER_SCREENS, useDayBuilder, type BuilderScreen } from "./use-day-builder";

/**
 * The day builder — UX v1.2 §4.13 (RUN-12): nine screens, one thing each.
 *
 * ONE PLAN, HELD BY `useDayBuilder`; every screen writes its part as it
 * goes and *Next* only moves. 13c is skipped without a trace when there are
 * no workouts. *Save Day A* (13i) calls `dayPlan.complete`; a plan left
 * before that stays a draft and the list says so. Back on 13a returns to
 * the list. Offline, the builder is read-only with the standard line.
 */
export function DayBuilder({
  planId,
  initialScreen = "a",
  onExit,
  embedded = false,
}: {
  planId: string;
  initialScreen?: BuilderScreen;
  /** Back from 13a, and after *Save Day A*. */
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
  const [saving, setSaving] = React.useState(false);

  const workouts = React.useMemo(() => api.habitsOf((habit) => habit.type === "workout"), [api]);
  const screens = React.useMemo(
    () => BUILDER_SCREENS.filter((key) => key !== "c" || workouts.length > 0),
    [workouts.length],
  );
  const index = Math.max(0, screens.indexOf(screen));
  const disabled = !online;

  const go = (next: BuilderScreen) => {
    api.setLine(null);
    setScreen(next);
  };
  const back = () => {
    if (index === 0) onExit();
    else go(screens[index - 1] ?? "a");
  };
  const forward = () => {
    const next = screens[index + 1];
    if (next !== undefined) go(next);
  };

  const save = async () => {
    if (api.plan === null) return;
    api.setLine(null);
    setSaving(true);
    try {
      await complete.mutateAsync({ id: api.plan.id, noWork: api.plan.work === null });
      await utils.dayPlan.list.invalidate();
      onExit();
    } catch (error) {
      const code = error instanceof Error ? error.message : "";
      api.setLine(COPY.completeRefused[code] ?? COPY.saveError);
    } finally {
      setSaving(false);
    }
  };

  const plan = api.plan;
  const name = plan?.name ?? "";
  const caption = COPY.caption(name, index + 1, screens.length);

  const heading = (() => {
    switch (screen) {
      case "a":
        return COPY.a.heading;
      case "b":
        return COPY.b.heading(name);
      case "c":
        return COPY.c.heading;
      case "d":
        return COPY.d.heading;
      case "e":
        return COPY.e.heading;
      case "f":
        return COPY.f.heading;
      case "g":
        return COPY.g.heading;
      case "h":
        return COPY.h.heading;
      case "i":
        return COPY.i.heading(name);
    }
  })();

  const body = (() => {
    switch (screen) {
      case "a":
        return COPY.a.body;
      case "c":
        return COPY.c.body;
      case "d":
        return COPY.d.body;
      case "f":
        return COPY.f.body;
      case "g":
        return COPY.g.body;
      default:
        return undefined;
    }
  })();

  const primaryLabel = (() => {
    switch (screen) {
      case "d":
        return COPY.nextWithMinutes(prepTotal);
      case "e":
        return COPY.nextWithMinutes(morningTotal);
      case "i":
        return COPY.saveDay(name);
      default:
        return COPY.next;
    }
  })();

  const skip = (() => {
    switch (screen) {
      case "c":
        return {
          label: COPY.c.notOnThisDay,
          onSkip: () => {
            void api.patch({ training: [] }).then(forward);
          },
        };
      case "f":
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
          if (screen === "i") void save();
          else forward();
        },
        busy: saving,
        disabled: plan === null,
      }}
    >
      {plan === null ? (
        <LoadingText />
      ) : (
        <>
          {screen === "a" ? <ScreenNameDays api={api} disabled={disabled} /> : null}
          {screen === "b" ? <ScreenShapeTimes api={api} disabled={disabled} /> : null}
          {screen === "c" ? <ScreenTraining api={api} workouts={workouts} disabled={disabled} /> : null}
          {screen === "d" ? <ScreenGettingReady api={api} disabled={disabled} onTotal={setPrepTotal} /> : null}
          {screen === "e" ? <ScreenMorning api={api} disabled={disabled} onTotal={setMorningTotal} /> : null}
          {screen === "f" ? <ScreenBreaks api={api} disabled={disabled} /> : null}
          {screen === "g" ? <ScreenEvening api={api} disabled={disabled} /> : null}
          {screen === "h" ? <ScreenWindDown api={api} disabled={disabled} /> : null}
          {screen === "i" ? <ScreenReview api={api} disabled={disabled} onGo={go} /> : null}
        </>
      )}
    </BuilderFrame>
  );
}
