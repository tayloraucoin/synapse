"use client";

import * as React from "react";

import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CountStepper,
  EmojiSlot,
  EmojiSlotButton,
  HelperText,
  Input,
  Text,
  WeekdayChips,
  type Weekday as ChipWeekday,
} from "@syn/ui";
import { FOCUS_TITLE_MAX, WEEKLY_TARGET_MAX, WEEKLY_TARGET_MIN } from "@syn/constants";
import type { HabitSummaryView, IconValue } from "@syn/types";

import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";

/**
 * FocusSetupCard — one focus of the work rotation (UX v1.2 §4.12; RUN-11).
 *
 * An optional glyph (blank by default — "a focus is the one noun where a
 * blank is the honest default") · the name (*Focus*, placeholder *The main
 * thing*; the first card carries the one muted line) · **a week** · **Usual
 * days** with *Flexible* preselected. **Done** collapses to *Viewpoint · 2 a
 * week · flexible*.
 *
 * CREATE ON THE FIRST FACT, as the workout card: the typed name is
 * `habit.createFocus`; every control after it is `habit.updateRotation`
 * (the rotation's three facts) or `habit.patch` (the glyph). *Flexible* is
 * `typical_days = null`.
 */

type Draft = { name: string; icon: IconValue | null; weekly: number; days: ChipWeekday[]; flexible: boolean };

const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export function FocusSetupCard({
  habit,
  first,
  initiallyOpen,
  onCreated,
  onRemoved,
  onDiscard,
}: {
  habit: HabitSummaryView | null;
  /** The first card carries the muted line under the name. */
  first: boolean;
  initiallyOpen: boolean;
  onCreated?: (id: string) => void;
  onRemoved?: () => void;
  onDiscard?: () => void;
}) {
  const utils = trpc.useUtils();
  const create = trpc.habit.createFocus.useMutation();
  const update = trpc.habit.updateRotation.useMutation();
  const patch = trpc.habit.patch.useMutation();
  const archive = trpc.habit.archive.useMutation();
  const groupId = React.useId();
  const editRef = React.useRef<HTMLButtonElement>(null);

  const [open, setOpen] = React.useState(initiallyOpen);
  const [draft, setDraft] = React.useState<Draft>({
    name: habit?.title ?? "",
    icon: habit?.icon?.kind === "curated" && habit.icon.value === "dot" ? null : (habit?.icon ?? null),
    weekly: habit?.weeklyTarget ?? 2,
    days: [...(habit?.typicalDays ?? [])] as ChipWeekday[],
    flexible: habit === null || habit.typicalDays === null || habit.typicalDays.length === 0,
  });
  const [line, setLine] = React.useState<string | null>(null);
  const idRef = React.useRef<string | null>(habit?.id ?? null);
  const chain = React.useRef<Promise<void>>(Promise.resolve());
  const draftRef = React.useRef(draft);
  draftRef.current = draft;

  const fail = () => setLine(COPY.saveError);

  const write = (next: Draft, icon?: IconValue) => {
    chain.current = chain.current
      .catch(() => undefined)
      .then(async () => {
        const rotation = {
          title: next.name.trim(),
          weeklyTarget: next.weekly,
          typicalDays: next.flexible ? null : next.days,
          durationMin: null,
          lifePriority: 6,
        };
        if (idRef.current === null) {
          if (rotation.title === "") return;
          const created = await create.mutateAsync(rotation);
          idRef.current = created.id;
          onCreated?.(created.id);
          if (next.icon !== null) await patch.mutateAsync({ id: created.id, patch: { icon: next.icon } });
        } else if (icon !== undefined) {
          await patch.mutateAsync({ id: idRef.current, patch: { icon } });
        } else {
          await update.mutateAsync({ id: idRef.current, habit: rotation });
        }
        await utils.habit.list.invalidate();
      })
      .catch(fail);
  };

  const change = (partial: Partial<Draft>, icon?: IconValue) => {
    setLine(null);
    const next = { ...draftRef.current, ...partial };
    draftRef.current = next;
    setDraft(next);
    write(next, icon);
  };

  const summary = COPY.focusSummary(
    draft.name.trim() || COPY.newFocus,
    draft.weekly,
    draft.flexible || draft.days.length === 0 ? COPY.flexible.toLowerCase() : draft.days.map((day) => DAY_SHORT[day]).join(" "),
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
    return (
      <Card role="group" aria-labelledby={groupId} className="py-(--space-2)">
        <CardHeader>
          <EmojiSlot icon={draft.icon} size="card" />
          <CardTitle id={groupId} className="truncate text-(length:--fs-body)">
            {summary}
          </CardTitle>
          <CardAction>
            <Button ref={editRef} variant="ghost" size="sm" onClick={() => setOpen(true)}>
              {COPY.edit}
            </Button>
          </CardAction>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card role="group" aria-labelledby={groupId}>
      <CardHeader className="items-end">
        <EmojiSlotButton
          icon={draft.icon}
          label={COPY.chooseAnIcon}
          onChange={(icon) => change({ icon }, icon)}
          className="mb-px"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-(--space-1)">
          <Input
            label={COPY.focusName}
            placeholder={COPY.focusPlaceholder}
            value={draft.name}
            maxLength={FOCUS_TITLE_MAX}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            onBlur={() => {
              const name = draft.name.trim();
              if (name !== "") change({ name });
            }}
          />
          {first ? (
            <Text as="span" variant="caption" tone="secondary">
              {COPY.focusLine}
            </Text>
          ) : null}
          <span id={groupId} className="sr-only">
            {draft.name.trim() || COPY.newFocus}
          </span>
        </div>
        <CardAction>
          <Button variant="ghost" size="sm" onClick={() => void remove()}>
            {COPY.remove}
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        <CountStepper
          label={COPY.timesAWeek}
          value={draft.weekly}
          min={WEEKLY_TARGET_MIN}
          max={WEEKLY_TARGET_MAX}
          onCommit={(next) => change({ weekly: next })}
          onCommitError={fail}
        />

        <WeekdayChips
          label={COPY.usualDays}
          indexing="monday"
          value={draft.days}
          flexible={draft.flexible}
          onFlexible={(flexible) => change({ flexible, days: flexible ? [] : draft.days })}
          onChange={(days) => change({ days, flexible: false })}
        />

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
