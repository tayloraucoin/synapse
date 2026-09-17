"use client";

import { Pencil } from "lucide-react";
import * as React from "react";

import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  EmojiSlot,
  HelperText,
  Input,
  MinutesStepper,
  RangeEditor,
  Stepper17,
  Text,
  type Stepper17Value,
} from "@syn/ui";
import { DURATION_MAX, DURATION_MIN, HABIT_VERSIONS_MAX, VERSION_LABEL_MAX } from "@syn/constants";
import type { HabitSummaryView, SlotView } from "@syn/types";

import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";

/**
 * HabitSetupCard — one habit, ranked (UX v1.2 §4.9, §3.5, R34, TD-11; RUN-10).
 *
 * Header: glyph · title · the range with a pencil that opens the compact
 * editor inline. **Matters:** the seven squares. **Usually:** a stepper at the
 * midpoint — the length the plan uses. **Versions:** *Add a shorter version*,
 * then *Add a longer version*, each a label and a stepper, three at most.
 * **Done** collapses to one line — *🌬️ Breath work · matters 5 · usually 8 ·
 * quick 5* — with *Edit*.
 *
 * EVERY CONTROL WRITES ITS OWN FACT on its own debounce (TD-18): *matters* is
 * `habit.patch({ lifePriority })`; *usually* is the morning slot's
 * `duration_min` (the plan's length) and, once versions exist, `versions[0]`
 * mirrors it; the pencil writes the range; a version writes `versions`.
 * Nothing disables while a write is out; a rejection reverts with one line.
 *
 * WHERE *USUALLY* LIVES (logged): no new column. The slot holds it; when the
 * first version is added the card seeds `versions[0] = usual` from it, so
 * the default version and the slot agree from that moment on.
 *
 * THE RANGE NEVER CLAMPS *usually* or a version (R21): `DURATION_MIN…MAX`
 * are the only bounds. Nothing here asks for a time of day.
 */

const USUAL_KEY = "usual";

type VersionSlot = { key: string; label: string; minutes: number };

export function HabitSetupCard({
  habit,
  slot,
  templateId,
  initiallyOpen,
  onCollapse,
  onExpand,
}: {
  habit: HabitSummaryView;
  slot: SlotView;
  templateId: string;
  initiallyOpen: boolean;
  onCollapse?: () => void;
  onExpand?: () => void;
}) {
  const online = useOnline();
  const utils = trpc.useUtils();
  const patch = trpc.habit.patch.useMutation();
  const saveSlot = trpc.template.saveSlot.useMutation();
  const groupId = React.useId();
  const editRef = React.useRef<HTMLButtonElement>(null);

  const [open, setOpen] = React.useState(initiallyOpen);
  const [editingRange, setEditingRange] = React.useState(false);
  const [range, setRange] = React.useState<{ from: number | null; to: number | null }>({
    from: habit.durationMin,
    to: habit.durationMax,
  });
  const [matters, setMatters] = React.useState<number>(habit.lifePriority);
  const [usually, setUsually] = React.useState<number>(slot.durationMin);
  const [versions, setVersions] = React.useState<VersionSlot[]>([...(habit.versions ?? [])]);
  const [line, setLine] = React.useState<string | null>(null);

  const fail = () => setLine(COPY.saveError);

  const writeMatters = async (next: number) => {
    setMatters(next);
    await patch.mutateAsync({ id: habit.id, patch: { lifePriority: next } });
    await utils.habit.list.invalidate();
  };

  const writeSlot = async (durationMin: number) => {
    await saveSlot.mutateAsync({
      templateId,
      slotId: slot.id,
      habitId: slot.habitId,
      durationMin,
      gapBeforeMin: slot.gapBeforeMin,
      pinnedClock: null,
      role: slot.role,
      priorityOverride: slot.overridden ? slot.priority : null,
      scheduling: slot.scheduling,
    });
  };

  const writeVersions = async (next: VersionSlot[] | null) => {
    setVersions(next ?? []);
    await patch.mutateAsync({ id: habit.id, patch: { versions: next } });
    await utils.habit.list.invalidate();
  };

  const writeUsually = async (next: number) => {
    setUsually(next);
    await writeSlot(next);
    // Once versions exist, the default version is *usually*.
    if (versions.length > 0) {
      const mirrored = versions.map((version, index) => (index === 0 ? { ...version, minutes: next } : version));
      await writeVersions(mirrored);
    }
    await utils.template.get.invalidate({ id: templateId });
  };

  const writeRange = async (next: { from: number | null; to: number | null }) => {
    setRange(next);
    if (next.from === null || next.to === null || next.to < next.from) return;
    try {
      await patch.mutateAsync({ id: habit.id, patch: { durationMinMin: next.from, durationMaxMin: next.to } });
      await utils.habit.list.invalidate();
    } catch {
      fail();
    }
  };

  const addVersion = async (kind: "shorter" | "longer") => {
    if (versions.length >= HABIT_VERSIONS_MAX) return;
    const seeded: VersionSlot[] =
      versions.length === 0 ? [{ key: USUAL_KEY, label: COPY.versionUsual, minutes: usually }] : [...versions];
    const minutes = kind === "shorter" ? Math.max(DURATION_MIN, Math.round(usually / 2)) : Math.min(DURATION_MAX, usually * 2);
    const key = kind === "shorter" ? "quick" : "full";
    const label = kind === "shorter" ? COPY.versionQuick : COPY.versionFull;
    const unique = seeded.some((version) => version.key === key) ? `${key}-${seeded.length}` : key;
    try {
      await writeVersions([...seeded, { key: unique, label, minutes }]);
    } catch {
      fail();
    }
  };

  /** A version's minutes write on the stepper's debounce; its label writes on blur. */
  const updateVersion = async (key: string, change: Partial<VersionSlot>, write = true) => {
    const next = versions.map((version) => (version.key === key ? { ...version, ...change } : version));
    setVersions(next);
    if (!write || next.some((version) => version.label.trim() === "")) return;
    try {
      await writeVersions(next);
    } catch {
      fail();
    }
  };

  const removeVersion = async (key: string) => {
    const rest = versions.filter((version) => version.key !== key);
    // Removing the last other version leaves only *usual*, which is the slot's length already.
    const next = rest.length <= 1 ? null : rest;
    try {
      await writeVersions(next);
    } catch {
      fail();
    }
  };

  const others = versions.filter((version) => version.key !== USUAL_KEY);
  const hasShorter = others.some((version) => version.minutes < usually);
  const summary = COPY.rankedSummary(
    habit.title,
    matters,
    usually,
    others.map((version) => `${version.label.toLowerCase()} ${version.minutes}`),
  );

  if (!open) {
    return (
      <Card role="group" aria-labelledby={groupId} className="py-(--space-2)">
        <CardHeader>
          <EmojiSlot icon={habit.icon} size="card" />
          <CardTitle id={groupId} className="truncate text-(length:--fs-body)">
            {summary}
          </CardTitle>
          <CardAction>
            <Button ref={editRef} variant="ghost" size="sm" onClick={() => { setOpen(true); onExpand?.(); }}>
              {COPY.edit}
            </Button>
          </CardAction>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card role="group" aria-labelledby={groupId}>
      <CardHeader>
        <EmojiSlot icon={habit.icon} size="card" />
        <CardTitle id={groupId}>{habit.title}</CardTitle>
        <CardAction className="gap-(--space-1)">
          {editingRange ? null : (
            <Text as="span" variant="secondary" tone="secondary" className="tabular-nums">
              {range.from !== null && range.to !== null ? COPY.rangeLabel(range.from, range.to) : ""}
            </Text>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label={COPY.editRange}
            aria-pressed={editingRange}
            onClick={() => setEditingRange((current) => !current)}
          >
            <Pencil className="size-4" aria-hidden="true" />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {editingRange ? (
          <RangeEditor label={COPY.rangeEditorLabel} value={range} onChange={(next) => void writeRange(next)} />
        ) : null}

        <Stepper17
          layout="row"
          label={COPY.howMuchItMatters}
          value={matters as Stepper17Value}
          onCommit={writeMatters}
          onCommitError={fail}
          captions={false}
        />

        <MinutesStepper
          label={COPY.usuallyTakes}
          value={usually}
          onCommit={writeUsually}
          onCommitError={fail}
          min={DURATION_MIN}
          max={DURATION_MAX}
          step={5}
        />

        {others.length === 0 ? null : (
          <div className="flex flex-col gap-(--space-3)">
            {others.map((version) => (
              <div key={version.key} className="flex flex-wrap items-end gap-(--space-2)">
                <Input
                  label={COPY.versionLabel}
                  value={version.label}
                  maxLength={VERSION_LABEL_MAX}
                  placeholder={version.minutes < usually ? COPY.versionQuick : COPY.versionFull}
                  onChange={(event) => void updateVersion(version.key, { label: event.target.value }, false)}
                  onBlur={() => void updateVersion(version.key, {})}
                  className="w-32"
                />
                <MinutesStepper
                  label={COPY.lengthOf(version.label || COPY.versionLabel)}
                  value={version.minutes}
                  onCommit={(next) => updateVersion(version.key, { minutes: next })}
                  onCommitError={fail}
                  min={DURATION_MIN}
                  max={DURATION_MAX}
                  step={5}
                  className="[&>label]:sr-only"
                />
                <Button variant="ghost" size="sm" onClick={() => void removeVersion(version.key)}>
                  {COPY.remove}
                </Button>
              </div>
            ))}
          </div>
        )}

        {versions.length < HABIT_VERSIONS_MAX ? (
          <Button
            variant="ghost"
            className="self-start"
            disabled={!online}
            onClick={() => void addVersion(others.length === 0 || !hasShorter ? "shorter" : "longer")}
          >
            {others.length === 0 || !hasShorter ? COPY.addAShorterVersion : COPY.addALongerVersion}
          </Button>
        ) : null}

        {line === null ? null : <HelperText error>{line}</HelperText>}
      </CardContent>

      <CardFooter className="justify-end">
        <Button
          variant="secondary"
          onClick={() => {
            setOpen(false);
            onCollapse?.();
            window.setTimeout(() => editRef.current?.focus(), 0);
          }}
        >
          {COPY.done}
        </Button>
      </CardFooter>
    </Card>
  );
}
