"use client";

import * as React from "react";

import { DAY_PLAN_NAME_MAX, UNDO_SHORT_MS } from "@syn/constants";
import type { IconValue, Weekday } from "@syn/types";
import { Button, EmojiSlotButton, Input, Text, WeekdayChips } from "@syn/ui";

import { trpc } from "@/lib/trpc/client";

import { WEEKDAY_LONG } from "../clock";
import { DAY_BUILDER_COPY as COPY } from "../copy";
import type { DayBuilderApi } from "../use-day-builder";

/**
 * B1 — name and days (UX v1.3 §4.4 B1; v1.2 §4.13a, renamed by DAY-9).
 *
 * ON THE FIRST PLAN, one muted line under the body: start with the first
 * work day of the week — the rest can start from this one. The chips arrive
 * preselected for the *Always · Usually · Sometimes* days (RUN-5's create,
 * widened by DAY-5); a later plan arrives with none.
 *
 * THE NAME WRITES ON BLUR AND ENTER; the glyph and every chip write at once.
 * A chip another plan holds says so beneath it and, on the tap, MOVES: the
 * service takes the day from the other plan (one weekday, one plan — RUN-5),
 * the response says which, and the line reads *Thursday moves from Day A.*
 * with an undo that moves it back — both plans written, this one first.
 */
export function ScreenNameDays({ api, disabled }: { api: DayBuilderApi; disabled: boolean }) {
  const plan = api.plan;
  const others = trpc.dayPlan.list.useQuery(undefined);
  const update = trpc.dayPlan.update.useMutation();
  const utils = trpc.useUtils();

  const [name, setName] = React.useState(plan?.name ?? "");
  React.useEffect(() => {
    if (plan !== null) setName(plan.name);
  }, [plan]);

  const [moved, setMoved] = React.useState<{ weekday: number; fromPlanId: string; fromPlanName: string } | null>(null);
  const timer = React.useRef<number | null>(null);
  React.useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const heldBy = React.useMemo(() => {
    const notes: Partial<Record<Weekday, string>> = {};
    const byId = new Map<number, { id: string; name: string }>();
    for (const other of others.data ?? []) {
      if (plan !== null && other.id === plan.id) continue;
      for (const weekday of other.weekdays) {
        notes[weekday] = COPY.b01.heldBy(other.name);
        byId.set(weekday, { id: other.id, name: other.name });
      }
    }
    return { notes, byId };
  }, [others.data, plan]);

  if (plan === null) return null;

  const commitName = () => {
    const next = name.trim();
    if (next === "" || next === plan.name) {
      setName(plan.name);
      return;
    }
    void api.patch({ name: next });
  };

  const onDays = async (next: Weekday[]) => {
    const added = next.find((weekday) => !plan.weekdays.includes(weekday));
    const from = added === undefined ? undefined : heldBy.byId.get(added);
    const result = await api.patch({ weekdays: next });
    const entry = result.find((row) => row.weekday === added);
    if (entry !== undefined && from !== undefined) {
      setMoved({ weekday: entry.weekday, fromPlanId: from.id, fromPlanName: entry.fromPlanName });
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setMoved(null), UNDO_SHORT_MS);
    }
    await utils.dayPlan.list.invalidate();
  };

  const undo = async () => {
    if (moved === null) return;
    const entry = moved;
    setMoved(null);
    const other = (others.data ?? []).find((row) => row.id === entry.fromPlanId);
    await api.patch({ weekdays: plan.weekdays.filter((weekday) => weekday !== entry.weekday) });
    if (other !== undefined) {
      await update.mutateAsync({
        id: other.id,
        patch: { weekdays: [...other.weekdays, entry.weekday as Weekday].sort((a, b) => a - b) },
      });
    }
    await utils.dayPlan.list.invalidate();
  };

  return (
    <div className="flex flex-col gap-(--space-5)">
      {plan.sortOrder === 0 ? (
        <Text as="p" variant="secondary" tone="secondary">
          {COPY.b01.helper}
        </Text>
      ) : null}

      <div className="flex items-end gap-(--space-3)">
        <EmojiSlotButton
          icon={plan.icon}
          onChange={(icon: IconValue) => void api.patch({ icon })}
          label={COPY.b01.chooseAnIcon}
          disabled={disabled}
        />
        <Input
          label={COPY.b01.name}
          value={name}
          maxLength={DAY_PLAN_NAME_MAX}
          disabled={disabled}
          onChange={(event) => setName(event.target.value)}
          onBlur={commitName}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              event.currentTarget.blur();
            }
          }}
          classes={{ root: "min-w-0 flex-1" }}
        />
      </div>

      <WeekdayChips
        label={COPY.b01.whichDays}
        indexing="monday"
        value={plan.weekdays}
        onChange={(next) => void onDays(next)}
        notes={heldBy.notes}
        disabled={disabled}
      />

      {moved === null ? null : (
        <div role="status" className="flex items-center justify-between gap-(--space-3)">
          <Text as="span" variant="secondary" tone="secondary">
            {COPY.b01.moved(WEEKDAY_LONG[moved.weekday] ?? "", moved.fromPlanName)}
          </Text>
          <Button variant="ghost" size="sm" onClick={() => void undo()} disabled={disabled}>
            {COPY.b01.undo}
          </Button>
        </div>
      )}
    </div>
  );
}
