"use client";

import * as React from "react";

import {
  BudgetLine,
  Button,
  CheckboxField,
  HelperText,
  ItemIcon,
  ListRow,
  PickerList,
  QuickChipRow,
  SegmentedControl,
  SelectRow,
  SelectRowList,
  Text,
  cn,
} from "@syn/ui";
import type { TrainingPlacement } from "@syn/types";
import { formatClock, weekdayForDayKey } from "@syn/utils";

import { ConfirmYesterdayPanel } from "@/components/confirm-yesterday";

import { QUICK_PICK_COPY as COPY } from "./copy";
import { SummaryRow } from "./summary-row";
import type { QuickPickApi } from "./use-quick-pick";

/**
 * The quick-pick's sections — UX v1.1 §5.3, one per open question, each
 * already answered with today's default, each collapsed to a summary row.
 * A section with nothing to ask is not rendered (the parent decides).
 */

export function LastNightSection({ pick, disabled }: { pick: QuickPickApi; disabled: boolean }) {
  const count = pick.lastNightTicked.size;
  return (
    <SummaryRow
      id="qp-last-night"
      title={COPY.lastNight}
      summary={`${count} of ${pick.view.lastNight.length}`}
      open={pick.open.has("lastNight")}
      onToggle={() => pick.toggleOpen("lastNight")}
    >
      <ConfirmYesterdayPanel
        items={pick.view.lastNight}
        ticked={pick.lastNightTicked}
        disabled={disabled}
        showCaption={false}
        onToggle={(id, on) =>
          pick.setLastNightTicked((current) => {
            const next = new Set(current);
            if (on) next.add(id);
            else next.delete(id);
            return next;
          })
        }
      />
    </SummaryRow>
  );
}

export function WorkingTodaySection({ pick, disabled }: { pick: QuickPickApi; disabled: boolean }) {
  return (
    <SummaryRow
      id="qp-working"
      title={COPY.workingToday}
      summary={pick.working ? COPY.yes : COPY.no}
      open={pick.open.has("working")}
      onToggle={() => pick.toggleOpen("working")}
    >
      <SegmentedControl
        label={COPY.workingToday}
        value={pick.working ? "yes" : "no"}
        onChange={(next) => pick.setWorking(next === "yes")}
        options={[
          { value: "yes" as const, label: COPY.yes },
          { value: "no" as const, label: COPY.no },
        ]}
        disabled={disabled}
      />
    </SummaryRow>
  );
}

export function RoutineSection({ pick, disabled }: { pick: QuickPickApi; disabled: boolean }) {
  const routine = pick.view.routine;
  if (routine === null || routine.mode === "auto_trim") return null;

  if (routine.mode === "variants") {
    const chosen = routine.variants?.find((variant) => variant.id === pick.variantId) ?? null;
    return (
      <SummaryRow
        id="qp-routine"
        title={COPY.routine}
        summary={chosen?.name ?? COPY.decideInTheMorning}
        open={pick.open.has("routine")}
        onToggle={() => pick.toggleOpen("routine")}
      >
        <PickerList
          groups={[
            {
              heading: COPY.routine,
              items: (routine.variants ?? []).map((variant) => ({
                id: variant.id,
                title: variant.name,
                meta:
                  variant.weeklyTarget === null
                    ? undefined
                    : COPY.variantLeft(variant.remaining, variant.weeklyTarget),
              })),
            },
          ]}
          value={pick.variantId}
          onSelect={(id) => pick.setVariantId(id === "" ? null : id)}
          searchLabel={COPY.routine}
          emptyText={COPY.decideInTheMorning}
          presentation="inline"
          className={disabled ? "pointer-events-none opacity-50" : undefined}
        />
      </SummaryRow>
    );
  }

  const menu = routine.menu;
  if (!menu) return null;
  return (
    <SummaryRow
      id="qp-routine"
      title={COPY.routine}
      summary={COPY.routineSummary(pick.ticked.size, pick.chosenMin)}
      open={pick.open.has("routine")}
      onToggle={() => pick.toggleOpen("routine")}
    >
      <ul className="flex flex-col">
        {menu.items.map((item) => (
          <li key={item.id} className="flex flex-col gap-(--space-1)">
            <div className="flex min-h-11 items-center justify-between gap-(--space-3)">
              <CheckboxField
                checked={pick.ticked.has(item.id)}
                disabled={disabled}
                onCheckedChange={(next) =>
                  pick.setTicked((current) => {
                    const after = new Set(current);
                    if (next === true) after.add(item.id);
                    else after.delete(item.id);
                    return after;
                  })
                }
              >
                <span className="flex items-center gap-(--space-2)">
                  <ItemIcon icon={item.icon} size={20} />
                  {item.title}
                </span>
              </CheckboxField>
              <Text as="span" variant="caption" tone="secondary" className="tabular-nums">
                {`${pick.lengthOf(item.id)} min`}
              </Text>
            </div>
            {/* UX v1.2 §3.5, §5.3 (RUN-13): the versions as tabs under the title; a tap sets the row's minutes. */}
            {item.versions !== null && item.versions.length >= 2 ? (
              <div role="tablist" aria-label={COPY.version} className="flex flex-wrap gap-(--space-1) ps-(--space-8)">
                {item.versions.map((version) => {
                  const current = pick.lengthOf(item.id) === version.minutes;
                  return (
                    <button
                      key={version.key}
                      type="button"
                      role="tab"
                      aria-selected={current}
                      disabled={disabled || !pick.ticked.has(item.id)}
                      onClick={() => pick.setLength(item.id, version.minutes)}
                      className={cn(
                        "h-8 rounded-(--radius) border px-(--space-2) text-(length:--fs-caption) tabular-nums",
                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        current ? "bg-primary text-primary-foreground border-transparent" : "border-hairline text-text-secondary",
                        (disabled || !pick.ticked.has(item.id)) && "opacity-40",
                      )}
                    >
                      {`${version.label} · ${version.minutes}`}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      <BudgetLine chosenMin={pick.chosenMin} availableMin={pick.availableMin} sticky />
      <Button
        variant="ghost"
        size="sm"
        className="self-start"
        aria-current={pick.adjusting ? "true" : undefined}
        disabled={disabled || pick.ticked.size === 0}
        busy={pick.fitting}
        onClick={() => void pick.shortenToFit()}
      >
        {COPY.shortenToFit}
      </Button>
    </SummaryRow>
  );
}

export function BeforeWorkSection({ pick, disabled }: { pick: QuickPickApi; disabled: boolean }) {
  const prep = pick.view.prep;
  if (prep === null || prep.alternates.length === 0) return null;
  const summary = prep.alternates
    .map((group) => group.members.find((member) => member.slotId === pick.alternates.get(group.groupId))?.title ?? "")
    .filter((title) => title !== "")
    .join(" · ");
  return (
    <SummaryRow
      id="qp-prep"
      title={COPY.beforeWork}
      summary={summary}
      open={pick.open.has("prep")}
      onToggle={() => pick.toggleOpen("prep")}
    >
      {prep.alternates.map((group) => (
        <SegmentedControl
          key={group.groupId}
          label={group.members.map((member) => member.title).join(" / ")}
          value={pick.alternates.get(group.groupId) ?? group.chosen}
          onChange={(next) => pick.setAlternates((current) => new Map(current).set(group.groupId, next))}
          options={group.members.map((member) => ({
            value: member.slotId,
            label: COPY.member(member.title, member.durationMin),
          }))}
          stacked="auto"
          disabled={disabled}
        />
      ))}
    </SummaryRow>
  );
}

export function TrainingSection({ pick, disabled }: { pick: QuickPickApi; disabled: boolean }) {
  const training = pick.view.training;
  if (training === null || (training.todays === null && training.swaps.length === 0)) return null;
  const weekday = weekdayForDayKey(pick.view.date);
  const workoutTitle = pick.workout?.title ?? COPY.noWorkoutToday;
  const placementWord = pick.placement === null ? null : COPY.placements[pick.placement];
  const summary = pick.notToday ? COPY.notToday : COPY.trainingSummary(workoutTitle, placementWord);

  return (
    <SummaryRow
      id="qp-training"
      title={COPY.training}
      summary={summary}
      open={pick.open.has("training")}
      onToggle={() => pick.toggleOpen("training")}
    >
      <div className="flex items-center justify-between gap-(--space-3)">
        <Text as="span">{pick.workout ? COPY.todaysIs(weekday, pick.workout.title) : COPY.noWorkoutToday}</Text>
        <SegmentedControl
          label={COPY.training}
          value={pick.swapping ? "swap" : "still"}
          onChange={(next) => pick.setSwapping(next === "swap")}
          options={[
            { value: "still" as const, label: COPY.still },
            { value: "swap" as const, label: COPY.swap },
          ]}
          disabled={disabled}
        />
      </div>
      {pick.swapping ? (
        <PickerList
          groups={[
            {
              heading: COPY.swap,
              items: training.swaps.map((swap) => ({
                id: swap.id,
                icon: swap.icon,
                title: swap.title,
                meta: swap.weeklyTarget === null ? undefined : COPY.variantLeft(swap.remaining, swap.weeklyTarget),
              })),
            },
          ]}
          value={pick.workoutId}
          onSelect={(id) => {
            pick.setWorkoutId(id === "" ? null : id);
            pick.setNotToday(false);
          }}
          searchLabel={COPY.swap}
          emptyText={COPY.noWorkoutToday}
          presentation="inline"
        />
      ) : null}
      {pick.trade !== null && pick.trade.tradesWithDay !== null && !pick.notToday ? (
        <Text as="p" variant="caption" tone="secondary">
          {COPY.tradesWith(pick.trade.tradesWithDay, pick.trade.title)}
        </Text>
      ) : null}
      {pick.workout !== null ? (
        <QuickChipRow
          label={COPY.when}
          chips={[
            ...training.placements.map((value) => ({ label: COPY.placements[value], value })),
            { label: COPY.notToday, value: "not_today" },
          ]}
          selected={pick.notToday ? "not_today" : pick.placement}
          onSelect={(value) => {
            if (value === "not_today") {
              pick.setNotToday(true);
              return;
            }
            pick.setNotToday(false);
            pick.setPlacement(value as TrainingPlacement);
          }}
          disabled={disabled}
        />
      ) : null}
    </SummaryRow>
  );
}

export function WorkSection({ pick, disabled }: { pick: QuickPickApi; disabled: boolean }) {
  const work = pick.view.work;
  if (work === null || (work.focuses.length === 0 && !work.askAnchor)) return null;
  const chosen = work.focuses.find((focus) => focus.id === pick.focusId) ?? null;
  const summary = [
    work.focuses.length > 0 ? `${COPY.focus} · ${chosen?.title ?? COPY.decideInTheMorning}` : null,
    work.askAnchor ? (pick.anchorIsHard ? COPY.routineGetsCut : COPY.workWaits) : null,
  ]
    .filter((part): part is string => part !== null)
    .join(" · ");

  return (
    <SummaryRow
      id="qp-work"
      title={COPY.work}
      summary={summary}
      open={pick.open.has("work")}
      onToggle={() => pick.toggleOpen("work")}
    >
      {work.focuses.length > 0 ? (
        <PickerList
          groups={[
            {
              heading: COPY.focus,
              items: work.focuses.map((focus) => ({
                id: focus.id,
                icon: focus.icon,
                title: focus.title,
                meta: focus.weeklyTarget === null ? undefined : COPY.focusLeft(focus.remaining, focus.weeklyTarget),
              })),
            },
          ]}
          value={pick.focusId}
          onSelect={(id) => pick.setFocusId(id === "" ? null : id)}
          noneLabel={COPY.decideInTheMorning}
          searchLabel={COPY.focus}
          emptyText={COPY.decideInTheMorning}
          presentation="inline"
          className={disabled ? "pointer-events-none opacity-50" : undefined}
        />
      ) : null}
      {work.askAnchor ? (
        <SegmentedControl
          label={COPY.work}
          value={pick.anchorIsHard ? "hard" : "soft"}
          onChange={(next) => pick.setAnchorIsHard(next === "hard")}
          options={[
            { value: "soft" as const, label: COPY.workWaits },
            { value: "hard" as const, label: COPY.routineGetsCut },
          ]}
          disabled={disabled}
        />
      ) : null}
    </SummaryRow>
  );
}

/**
 * *Free time* — UX v1.3 §5.3, TD-26 (DAY-12). Under *Build each morning*,
 * when the day's evening waits on a pool: its members as `SelectRow`s,
 * nothing preselected, and *Decide later* as a ghost row PRESSED BY DEFAULT.
 * Choosing any un-presses it; pressing it clears them. *Set the day* sends
 * the choice with the confirm; *Decide later* leaves the block pooled for the
 * Today row. The evening is chosen, never inferred.
 */
export function FreeTimeSection({ pick, disabled }: { pick: QuickPickApi; disabled: boolean }) {
  const section = pick.view.freeTime;
  if (section === null) return null;
  const chosen = section.members.filter((member) => pick.freeTime.has(member.habitId));
  const later = chosen.length === 0;
  return (
    <SummaryRow
      id="qp-free-time"
      title={COPY.freeTime}
      summary={later ? COPY.decideLater : COPY.freeTimeSummary(chosen.map((member) => member.title))}
      open={pick.open.has("freeTime")}
      onToggle={() => pick.toggleOpen("freeTime")}
    >
      <div className="flex flex-col gap-(--space-2)">
        <SelectRowList>
          {section.members.map((member) => (
            <SelectRow
              key={member.habitId}
              icon={member.icon}
              title={member.title}
              detail={COPY.usually(member.durationMin)}
              selected={pick.freeTime.has(member.habitId)}
              disabled={disabled}
              onToggle={(selected) =>
                pick.setFreeTime((current) => {
                  const next = new Set(current);
                  if (selected) next.add(member.habitId);
                  else next.delete(member.habitId);
                  return next;
                })
              }
            />
          ))}
        </SelectRowList>
        <Button
          variant="ghost"
          aria-pressed={later}
          disabled={disabled}
          onClick={() => pick.setFreeTime(new Set())}
          className={cn("w-full justify-start", later && "font-medium")}
        >
          {COPY.decideLater}
        </Button>
      </div>
    </SummaryRow>
  );
}

export function FixturesSection({ pick, timeZone }: { pick: QuickPickApi; timeZone: string }) {
  if (pick.view.fixtures.length === 0) return null;
  return (
    <section className="flex flex-col gap-(--space-2) pt-(--space-3)">
      <Text as="h3" variant="caption" tone="secondary">
        {COPY.alreadyInPlace}
      </Text>
      <ul className="flex flex-col">
        {pick.view.fixtures.map((item) => (
          <ListRow
            key={item.id}
            as="li"
            leading={<ItemIcon icon={item.icon} />}
            title={item.title}
            meta={item.scheduledStart === null ? undefined : formatClock(item.scheduledStart, timeZone)}
          />
        ))}
      </ul>
    </section>
  );
}

export function PickError({ message }: { message: string | null }) {
  return message === null ? null : <HelperText error>{message}</HelperText>;
}
