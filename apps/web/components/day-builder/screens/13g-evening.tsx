"use client";

import * as React from "react";

import type { FixtureView, Weekday } from "@syn/types";
import { Button, ConfirmDialog, SelectRow, SelectRowList, Text } from "@syn/ui";

import { FixtureSheet } from "@/components/fixture-sheet";
import { trpc } from "@/lib/trpc/client";

import { WEEKDAY_LONG, WEEKDAY_SHORT, display, minutesOf } from "../clock";
import { DAY_BUILDER_COPY as COPY } from "../copy";
import type { DayBuilderApi } from "../use-day-builder";

/**
 * 13g — the evening (UX v1.2 §4.13g).
 *
 * MATCHED FIXTURES ARE PRESELECTED — those on any of the plan's weekdays;
 * un-selecting one writes `excludedFixtureIds`, and the fixture keeps its
 * days. *Other days* are the rest, unselected; selecting one ADDS THE
 * PLAN's DAYS TO THE FIXTURE after one line of confirm — a fixture is a
 * weekday fact (v1.1 §3.6), so a plan cannot hold one without its days.
 */
export function ScreenEvening({ api, disabled }: { api: DayBuilderApi; disabled: boolean }) {
  const utils = trpc.useUtils();
  const save = trpc.fixture.save.useMutation();
  const plan = api.plan;
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [confirm, setConfirm] = React.useState<FixtureView | null>(null);
  const [line, setLine] = React.useState<string | null>(null);

  if (plan === null) return null;
  const days = new Set<Weekday>(plan.weekdays);
  const fixtures = api.fixtures.filter((fixture) => !fixture.archived);
  const matched = fixtures.filter((fixture) => fixture.weekdays.some((weekday) => days.has(weekday)));
  const others = fixtures.filter((fixture) => !fixture.weekdays.some((weekday) => days.has(weekday)));
  const excluded = new Set(plan.excludedFixtureIds);

  const detailOf = (fixture: FixtureView) => {
    const at = minutesOf(fixture.atClock);
    return COPY.g.detail(
      fixture.weekdays.map((weekday) => WEEKDAY_SHORT[weekday]).join(" · "),
      at === null ? fixture.atClock : display(at),
      fixture.durationMin,
    );
  };

  const addDays = async (fixture: FixtureView) => {
    setLine(null);
    const weekdays = Array.from(new Set([...fixture.weekdays, ...plan.weekdays])).sort((a, b) => a - b);
    try {
      await save.mutateAsync({
        id: fixture.id,
        title: fixture.title,
        weekdays,
        atClock: fixture.atClock,
        durationMin: fixture.durationMin,
        blockKind: fixture.blockKind === "work" ? "work" : "activity",
        scheduling: fixture.scheduling,
        habitId: fixture.habitId,
        kind: fixture.kind,
        icon: fixture.icon,
      });
      await utils.fixture.list.invalidate();
    } catch {
      setLine(COPY.saveError);
    }
  };

  const missingDays = confirm === null ? [] : plan.weekdays.filter((weekday) => !confirm.weekdays.includes(weekday));

  return (
    <div className="flex flex-col gap-(--space-5)">
      {fixtures.length === 0 ? (
        <Text as="p" variant="secondary" tone="secondary">
          {COPY.g.nothingYet}
        </Text>
      ) : null}

      {matched.length === 0 ? null : (
        <SelectRowList>
          {matched.map((fixture) => (
            <SelectRow
              key={fixture.id}
              icon={fixture.icon}
              title={fixture.title}
              detail={detailOf(fixture)}
              selected={!excluded.has(fixture.id)}
              disabled={disabled}
              error={line}
              onCommitError={() => setLine(COPY.saveError)}
              onToggle={async (selected) => {
                setLine(null);
                const next = new Set(excluded);
                if (selected) next.delete(fixture.id);
                else next.add(fixture.id);
                await api.patch({ excludedFixtureIds: Array.from(next) });
              }}
            />
          ))}
        </SelectRowList>
      )}

      {others.length === 0 ? null : (
        <section className="flex flex-col gap-(--space-2)">
          <Text as="h2" variant="secondary" weight={500} tone="secondary">
            {COPY.g.otherDays}
          </Text>
          <SelectRowList>
            {others.map((fixture) => (
              <SelectRow
                key={fixture.id}
                icon={fixture.icon}
                title={fixture.title}
                detail={detailOf(fixture)}
                selected={false}
                disabled={disabled}
                onToggle={(selected) => {
                  if (selected) setConfirm(fixture);
                  // The tick waits for the confirm; the row reverts on its own.
                  return Promise.reject(new Error("confirm"));
                }}
              />
            ))}
          </SelectRowList>
        </section>
      )}

      <Button variant="secondary" disabled={disabled} onClick={() => setSheetOpen(true)} className="w-full wide:w-auto wide:self-start">
        {COPY.g.addOne}
      </Button>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
        title={confirm === null ? "" : COPY.g.addDaysTitle(missingDays.map((weekday) => WEEKDAY_LONG[weekday]).join(", "), confirm.title)}
        description={COPY.g.addDaysBody}
        confirmLabel={COPY.g.add}
        cancelLabel={COPY.cancel}
        onConfirm={() => {
          const fixture = confirm;
          setConfirm(null);
          if (fixture !== null) void addDays(fixture);
        }}
      />

      <FixtureSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSaved={() => void utils.fixture.list.invalidate()}
      />
    </div>
  );
}
