"use client";

import * as React from "react";

import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardSummary,
  ChipPicker,
  CountStepper,
  EmojiSlot,
  EmojiSlotButton,
  HelperText,
  Input,
  MinutesStepper,
  SegmentedControl,
  Switch,
  Text,
  WeekdayChips,
  type Weekday as ChipWeekday,
} from "@syn/ui";
import {
  DURATION_MAX,
  DURATION_MIN,
  TRAVEL_MAX,
  WEEKLY_TARGET_MAX,
  WEEKLY_TARGET_MIN,
  WORKOUT_TITLE_MAX,
  WORKOUT_TYPES,
} from "@syn/constants";
import type { HabitSummaryView, IconValue, WorkoutLocation } from "@syn/types";

import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";

/**
 * WorkoutSetupCard — one workout of the rotation (UX v1.2 §4.10, §3.7; TD-12;
 * RUN-11).
 *
 * Header: the glyph (the picker) · the name. **Type** chips — picking one
 * fills the name and the glyph when they are empty, never over a name the
 * person typed (`nameTouched`) or a glyph they picked (`iconTouched`).
 * **How often** · **Usual days** with *Flexible* · **Length** · **Where**;
 * for *Gym or studio* and *Outside*, **Getting there** · **Getting back** and
 * *Plan for the travel* with its line. **Done** collapses in place to two
 * lines (v1.3 R57, R58): the glyph · *Upper body* · *Edit*, then *2 a week ·
 * Mon Thu · 60 min · gym +15/+15*.
 *
 * IT NEVER REMOUNTS ON ITS FIRST WRITE (v1.3 §10.2; DAY-2). The list keeps
 * this instance through the create (`useCardEntries`); a `habit` prop going
 * from null to the row is ignored by design — `draftFrom` runs once, and
 * `idRef` is already set by the create — so the open state and *Usual days*
 * stay what the person set.
 *
 * CREATE ON THE FIRST FACT (logged). A card appended by *Add a workout* is
 * unsaved and creates nothing; the first thing that makes it a workout — a
 * type picked or a name typed — is `habit.createWorkout`, and every control
 * after that is `habit.patchWorkout` for its one field. A card abandoned
 * with nothing on it leaves no row. Writes made while the create is out
 * queue behind it (RUN-10's promise pattern).
 *
 * THE TRAVEL IS NEVER IN THE LENGTH — on the card or in the summary's
 * *60 min*; the day carries it beside the workout (RUN-6). NOTHING HERE ASKS
 * FOR A TIME: placement is the builder's.
 */

type Where = WorkoutLocation;

type Draft = {
  name: string;
  icon: IconValue | null;
  type: string | null;
  weekly: number;
  days: ChipWeekday[];
  flexible: boolean;
  minutes: number;
  where: Where;
  there: number;
  back: number;
  planTravel: boolean;
};

const TYPE_OPTIONS = WORKOUT_TYPES.map((entry) => ({ value: entry.key, label: entry.title, icon: entry.icon as IconValue }));

function draftFrom(habit: HabitSummaryView | null): Draft {
  return {
    name: habit?.title ?? "",
    icon: habit?.icon ?? null,
    type: habit?.workoutType ?? null,
    weekly: habit?.weeklyTarget ?? 2,
    days: [...(habit?.typicalDays ?? [])] as ChipWeekday[],
    flexible: habit !== null && (habit.typicalDays === null || habit.typicalDays.length === 0),
    minutes: habit?.durationMin ?? 60,
    where: habit?.location ?? "home",
    there: habit?.travel?.thereMin ?? 0,
    back: habit?.travel?.backMin ?? 0,
    planTravel: habit?.travel?.planned ?? true,
  };
}

const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export function WorkoutSetupCard({
  habit,
  initiallyOpen,
  onCreated,
  onRemoved,
  onDiscard,
}: {
  /** Null for a card appended and not yet a workout. */
  habit: HabitSummaryView | null;
  initiallyOpen: boolean;
  onCreated?: (id: string) => void;
  onRemoved?: () => void;
  onDiscard?: () => void;
}) {
  const online = useOnline();
  const utils = trpc.useUtils();
  const create = trpc.habit.createWorkout.useMutation();
  const patch = trpc.habit.patchWorkout.useMutation();
  const archive = trpc.habit.archive.useMutation();
  const groupId = React.useId();
  const editRef = React.useRef<HTMLButtonElement>(null);

  const [open, setOpen] = React.useState(initiallyOpen);
  const [draft, setDraft] = React.useState<Draft>(() => draftFrom(habit));
  const [nameTouched, setNameTouched] = React.useState(habit !== null && habit.title !== "");
  const [iconTouched, setIconTouched] = React.useState(habit !== null);
  const [line, setLine] = React.useState<string | null>(null);
  const idRef = React.useRef<string | null>(habit?.id ?? null);
  const chain = React.useRef<Promise<void>>(Promise.resolve());

  const fail = () => setLine(COPY.saveError);

  /** Queue a write behind whatever is out; the first write creates the row. */
  const write = (next: Draft, field: Partial<Parameters<typeof patch.mutateAsync>[0]["patch"]>) => {
    chain.current = chain.current
      .catch(() => undefined)
      .then(async () => {
        if (idRef.current === null) {
          if (next.name.trim() === "") return;
          const created = await create.mutateAsync({
            title: next.name.trim(),
            weeklyTarget: next.weekly,
            typicalDays: next.flexible ? null : next.days,
            durationMin: next.minutes,
            lifePriority: 6,
            icon: next.icon,
            details: {
              workoutType: next.type,
              location: next.where,
              travelThereMin: next.there,
              travelBackMin: next.back,
              planTravel: next.planTravel,
            },
          });
          idRef.current = created.id;
          onCreated?.(created.id);
        } else if (Object.keys(field).length > 0) {
          await patch.mutateAsync({ id: idRef.current, patch: field });
        }
        await utils.habit.list.invalidate();
      })
      .catch(fail);
  };

  // The latest draft by ref, so a write reads what the person has, not a stale render.
  const draftRef = React.useRef(draft);
  draftRef.current = draft;
  const change = (partial: Partial<Draft>, field: Parameters<typeof write>[1] = {}) => {
    setLine(null);
    const next = { ...draftRef.current, ...partial };
    draftRef.current = next;
    setDraft(next);
    write(next, field);
  };

  const pickType = (value: string | null) => {
    const entry = WORKOUT_TYPES.find((candidate) => candidate.key === value);
    const fills = entry !== undefined && entry.key !== "other";
    const nextName = !nameTouched && fills ? entry.title : draft.name;
    const nextIcon = !iconTouched && fills ? entry.icon : draft.icon;
    change(
      { type: value, name: nextName, icon: nextIcon },
      {
        workoutType: value,
        ...(nextName !== draft.name && nextName !== "" ? { title: nextName } : {}),
        ...(nextIcon !== draft.icon && nextIcon !== null ? { icon: nextIcon } : {}),
      },
    );
  };

  const away = draft.where !== "home";
  const caption = COPY.workoutCaption(
    draft.weekly,
    draft.flexible || draft.days.length === 0 ? COPY.flexible.toLowerCase() : draft.days.map((day) => DAY_SHORT[day]).join(" "),
    draft.minutes,
    away ? COPY.whereShort[draft.where] : null,
    away && draft.planTravel ? { there: draft.there, back: draft.back } : null,
  );

  async function remove(): Promise<void> {
    if (idRef.current === null) {
      onDiscard?.();
      return;
    }
    try {
      await archive.mutateAsync({ id: idRef.current });
      await utils.habit.list.invalidate();
      onRemoved?.();
    } catch {
      fail();
    }
  }

  if (!open) {
    // Two lines, in place (v1.3 R57, R58): glyph · name · *Edit*, then the facts.
    return (
      <Card className="py-(--space-2)">
        <CardSummary
          leading={<EmojiSlot icon={draft.icon} size="card" />}
          title={draft.name.trim() || COPY.newWorkout}
          caption={caption}
          action={
            <Button ref={editRef} variant="ghost" size="sm" onClick={() => setOpen(true)}>
              {COPY.edit}
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card role="group" aria-labelledby={groupId}>
      <CardHeader className="items-end">
        <EmojiSlotButton
          icon={draft.icon}
          label={COPY.chooseAnIcon}
          onChange={(icon) => {
            setIconTouched(true);
            change({ icon }, { icon });
          }}
          className="mb-px"
        />
        <div className="min-w-0 flex-1">
          <Input
            label={COPY.workoutName}
            placeholder={COPY.newWorkout}
            value={draft.name}
            maxLength={WORKOUT_TITLE_MAX}
            onChange={(event) => {
              setNameTouched(event.target.value !== "");
              setDraft((current) => ({ ...current, name: event.target.value }));
            }}
            onBlur={() => {
              const name = draft.name.trim();
              if (name === "") return;
              change({ name }, { title: name });
            }}
          />
          <span id={groupId} className="sr-only">
            {draft.name.trim() || COPY.newWorkout}
          </span>
        </div>
        <CardAction>
          <Button variant="ghost" size="sm" onClick={() => void remove()}>
            {COPY.remove}
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        <ChipPicker label={COPY.workoutType} options={TYPE_OPTIONS} value={draft.type} onChange={pickType} />

        <CountStepper
          label={COPY.timesAWeek}
          value={draft.weekly}
          min={WEEKLY_TARGET_MIN}
          max={WEEKLY_TARGET_MAX}
          onCommit={(next) => change({ weekly: next }, { weeklyTarget: next })}
          onCommitError={fail}
        />

        <WeekdayChips
          label={COPY.usualDays}
          indexing="monday"
          value={draft.days}
          flexible={draft.flexible}
          onFlexible={(flexible) => change({ flexible, days: flexible ? [] : draft.days }, { typicalDays: flexible ? null : draft.days })}
          onChange={(days) => change({ days, flexible: false }, { typicalDays: days })}
        />

        <MinutesStepper
          label={COPY.usuallyTakes}
          value={draft.minutes}
          min={DURATION_MIN}
          max={DURATION_MAX}
          onCommit={(next) => change({ minutes: next }, { durationMin: next })}
          onCommitError={fail}
        />

        <SegmentedControl
          label={COPY.where}
          value={draft.where}
          onChange={(next) => change({ where: next }, { location: next })}
          options={[
            { value: "home" as const, label: COPY.whereHome },
            { value: "gym" as const, label: COPY.whereGym },
            { value: "outside" as const, label: COPY.whereOutside },
          ]}
        />

        {away ? (
          <div className="flex flex-col gap-(--space-3)">
            <MinutesStepper
              label={COPY.gettingThere}
              value={draft.there}
              min={0}
              max={TRAVEL_MAX}
              onCommit={(next) => change({ there: next }, { travelThereMin: next })}
              onCommitError={fail}
            />
            <MinutesStepper
              label={COPY.gettingBack}
              value={draft.back}
              min={0}
              max={TRAVEL_MAX}
              onCommit={(next) => change({ back: next }, { travelBackMin: next })}
              onCommitError={fail}
            />
            <div className="flex items-start justify-between gap-(--space-4)">
              <span className="flex min-w-0 flex-col gap-(--space-1)">
                <Text as="label" htmlFor={`${groupId}-travel`} variant="body" weight={500}>
                  {COPY.planForTheTravel}
                </Text>
                <Text as="span" variant="caption" tone="secondary">
                  {COPY.planForTheTravelLine}
                </Text>
              </span>
              <Switch
                id={`${groupId}-travel`}
                checked={draft.planTravel}
                disabled={!online}
                onCheckedChange={(next) => change({ planTravel: next }, { planTravel: next })}
              />
            </div>
          </div>
        ) : null}

        {line === null ? null : <HelperText error>{line}</HelperText>}
      </CardContent>

      <CardFooter className="justify-end">
        <Button
          variant="secondary"
          disabled={draft.name.trim() === ""}
          onClick={() => {
            setOpen(false);
            window.setTimeout(() => editRef.current?.focus(), 0);
          }}
        >
          {COPY.done}
        </Button>
      </CardFooter>
    </Card>
  );
}
