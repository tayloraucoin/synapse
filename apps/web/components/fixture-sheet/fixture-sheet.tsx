"use client";

import * as React from "react";

import {
  Button,
  ChipPicker,
  DiscardDialog,
  EmojiSlotButton,
  HelperText,
  Input,
  MinutesStepper,
  ResponsiveSheet,
  SegmentedControl,
  Switch,
  Text,
  TimeField,
  WeekdayChips,
  type Weekday as ChipWeekday,
} from "@syn/ui";
import {
  DURATION_MAX,
  DURATION_MIN,
  FIXTURE_KINDS,
  FIXTURE_LOCATION_MAX,
  FIXTURE_TITLE_MAX,
  TRAVEL_MAX,
  fixtureKindDefaults,
} from "@syn/constants";
import type { FixtureKind, FixtureView, IconValue } from "@syn/types";

import { SheetHost } from "@/components/page-frame";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { FIXTURE_SHEET_COPY as COPY } from "./copy";

/**
 * The fixture sheet — UX v1.2 §4.4, §3.6, R42; v1.1 §4.4, TD-8.
 *
 * "A **kind** `ChipPicker` at the top — *Meeting · Appointment · Class ·
 * Event · Social · Chore · Other* — then title (autofocus; the kind's emoji
 * shows in the field's leading slot and opens the picker), `WeekdayChips`,
 * `TimeField` *at*, `MinutesStepper` *for*, and the `SegmentedControl` **In
 * work · In the evening**, preselected from the kind." A fixture is a fact
 * about the week; the sheet asks for exactly that and suggests nothing.
 *
 * THE KINDS ARE A VOCABULARY, NOT A SUGGESTION. The sheet opens on none
 * selected. Picking one fills the glyph and the block the person has not
 * chosen themselves (`iconTouched`, `whereTouched`); both stay theirs to
 * change, and a kind changed later moves neither once touched.
 *
 * UX v1.3 R51, §4.4 B6 (DAY-7): after the kind and the title, **Where** —
 * *Here · Away*; away reveals **Place**, **Getting there** · **Getting back**
 * and **Plan for the travel**. *Away* is derived on edit from the four fields
 * (a place or a travel length); *Here*, or away with nothing filled in,
 * saves no place and no travel. The block segment below is *Part of the day*.
 *
 * ONE SHEET, THREE DOORS: first run's screen 4, Settings → Your day, and the
 * week build (DYN-12). The write is `fixture.save`; the list the caller
 * shows is `fixture.list`, invalidated here.
 */

const KIND_OPTIONS = FIXTURE_KINDS.map((entry) => ({
  value: entry.key,
  label: entry.title,
  icon: entry.icon as IconValue,
}));

export function FixtureSheet({
  open,
  fixture,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  /** Absent in create mode. */
  fixture?: FixtureView | null;
  onOpenChange: (open: boolean) => void;
  onSaved?: (saved: FixtureView) => void;
}) {
  const online = useOnline();
  const utils = trpc.useUtils();
  const save = trpc.fixture.save.useMutation();

  const [kind, setKind] = React.useState<FixtureKind | null>(null);
  const [icon, setIcon] = React.useState<IconValue | null>(null);
  const [iconTouched, setIconTouched] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [weekdays, setWeekdays] = React.useState<ChipWeekday[]>([]);
  const [atClock, setAtClock] = React.useState("09:30");
  const [durationMin, setDurationMin] = React.useState<number | null>(30);
  const [where, setWhere] = React.useState<"work" | "activity">("work");
  const [whereTouched, setWhereTouched] = React.useState(false);
  // UX v1.3 R51 (DAY-7): here or away — named `away` so it never collides with the block's `where`.
  const [away, setAway] = React.useState(false);
  const [place, setPlace] = React.useState("");
  const [thereMin, setThereMin] = React.useState<number | null>(0);
  const [backMin, setBackMin] = React.useState<number | null>(0);
  const [planTravel, setPlanTravel] = React.useState(true);
  const awayHeadingId = React.useId();
  const [error, setError] = React.useState<string | null>(null);
  const [discardOpen, setDiscardOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setError(null);
    if (fixture) {
      setKind(fixture.kind);
      setIcon(fixture.icon);
      setIconTouched(true);
      setTitle(fixture.title);
      setWeekdays([...fixture.weekdays] as ChipWeekday[]);
      setAtClock(toInputClock(fixture.atClock));
      setDurationMin(fixture.durationMin);
      setWhere(fixture.blockKind === "activity" ? "activity" : "work");
      setWhereTouched(true);
      // *Away* is derived from the four fields — no fifth column (DAY-7).
      setAway(fixture.location !== null || fixture.travel.thereMin > 0 || fixture.travel.backMin > 0);
      setPlace(fixture.location ?? "");
      setThereMin(fixture.travel.thereMin);
      setBackMin(fixture.travel.backMin);
      setPlanTravel(fixture.travel.planned);
      return;
    }
    setAway(false);
    setPlace("");
    setThereMin(0);
    setBackMin(0);
    setPlanTravel(true);
    setKind(null);
    setIcon(null);
    setIconTouched(false);
    setTitle("");
    setWeekdays([]);
    setAtClock("09:30");
    setDurationMin(30);
    setWhere("work");
    setWhereTouched(false);
  }, [open, fixture]);

  const pickKind = (value: string | null) => {
    const next = value as FixtureKind | null;
    setKind(next);
    if (next === null) return;
    const defaults = fixtureKindDefaults(next);
    // The kind fills what the person has not chosen; theirs stays theirs.
    if (!iconTouched) setIcon(defaults.icon);
    if (!whereTouched) setWhere(defaults.defaultBlockKind);
  };

  const dirty =
    fixture === undefined || fixture === null
      ? title.trim() !== "" || weekdays.length > 0 || kind !== null
      : title !== fixture.title ||
        weekdays.join(",") !== fixture.weekdays.join(",") ||
        toInputClock(fixture.atClock) !== atClock ||
        durationMin !== fixture.durationMin ||
        (fixture.blockKind === "activity" ? "activity" : "work") !== where ||
        kind !== fixture.kind ||
        JSON.stringify(icon) !== JSON.stringify(fixture.icon) ||
        (away ? place.trim() : "") !== (fixture.location ?? "") ||
        (away ? (thereMin ?? 0) : 0) !== fixture.travel.thereMin ||
        (away ? (backMin ?? 0) : 0) !== fixture.travel.backMin ||
        (away ? planTravel : true) !== fixture.travel.planned;

  // *Here*, or *Away* with nothing filled in, saves as here (DAY-7).
  const placeValue = away ? place.trim() : "";
  const travel = away
    ? { there: thereMin ?? 0, back: backMin ?? 0, planned: planTravel }
    : { there: 0, back: 0, planned: true };
  const reallyAway = placeValue !== "" || travel.there > 0 || travel.back > 0;
  const canSave = title.trim() !== "" && weekdays.length > 0 && durationMin !== null;

  async function submit(): Promise<void> {
    if (!canSave || durationMin === null) return;
    setError(null);
    try {
      const saved = await save.mutateAsync({
        id: fixture?.id,
        title: title.trim(),
        weekdays,
        atClock,
        durationMin,
        blockKind: where,
        scheduling: "hard",
        kind: kind ?? "other",
        icon: icon ?? undefined,
        // UX v1.3 R51, TD-27 (DAY-5's `fixture.save`): the place and the travel.
        location: reallyAway && placeValue !== "" ? placeValue : null,
        travelThereMin: reallyAway ? travel.there : 0,
        travelBackMin: reallyAway ? travel.back : 0,
        planTravel: reallyAway ? travel.planned : true,
      });
      await utils.fixture.list.invalidate();
      onSaved?.(saved);
      onOpenChange(false);
    } catch {
      setError(COPY.saveError);
    }
  }

  return (
    <SheetHost open={open}>
      <ResponsiveSheet
        open={open}
        onOpenChange={(next) => {
          if (!next && dirty) {
            setDiscardOpen(true);
            return;
          }
          onOpenChange(next);
        }}
        title={fixture ? COPY.editTitle : COPY.addTitle}
        dirty={dirty}
        onDiscardRequest={() => setDiscardOpen(true)}
        initialFocus="first-field"
        footer={
          <div className="flex justify-end gap-(--space-2)">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {COPY.cancel}
            </Button>
            <Button onClick={() => void submit()} busy={save.isPending} disabled={!online || !canSave}>
              {COPY.save}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-(--space-4)">
          <ChipPicker label={COPY.kind} options={KIND_OPTIONS} value={kind} onChange={pickKind} />

          <div className="flex items-end gap-(--space-2)">
            <EmojiSlotButton
              icon={icon}
              label={COPY.chooseAnIcon}
              onChange={(next) => {
                setIconTouched(true);
                setIcon(next);
              }}
              className="mb-px"
            />
            <Input
              label={COPY.title}
              value={title}
              maxLength={FIXTURE_TITLE_MAX}
              autoFocus
              onChange={(event) => setTitle(event.target.value)}
              className="flex-1"
            />
          </div>

          {/* UX v1.3 §4.4 B6, R51: here or away; away reveals the place and the travel. */}
          <SegmentedControl
            label={COPY.where}
            value={away ? "away" : "here"}
            onChange={(next) => setAway(next === "away")}
            options={[
              { value: "here" as const, label: COPY.here },
              { value: "away" as const, label: COPY.away },
            ]}
          />
          {away ? (
            <div role="group" aria-labelledby={awayHeadingId} className="flex flex-col gap-(--space-3)">
              <Text as="span" id={awayHeadingId} aria-live="polite" className="sr-only">
                {COPY.away}
              </Text>
              <Input
                label={COPY.place}
                placeholder={COPY.placePlaceholder}
                value={place}
                maxLength={FIXTURE_LOCATION_MAX}
                onChange={(event) => setPlace(event.target.value)}
              />
              <MinutesStepper
                label={COPY.gettingThere}
                value={thereMin}
                onChange={setThereMin}
                min={0}
                max={TRAVEL_MAX}
              />
              <MinutesStepper
                label={COPY.gettingBack}
                value={backMin}
                onChange={setBackMin}
                min={0}
                max={TRAVEL_MAX}
              />
              <div className="flex items-start justify-between gap-(--space-4)">
                <span className="flex min-w-0 flex-col gap-(--space-1)">
                  <Text as="label" htmlFor={`${awayHeadingId}-travel`} variant="body" weight={500}>
                    {COPY.planForTheTravel}
                  </Text>
                  <Text as="span" variant="caption" tone="secondary">
                    {COPY.planForTheTravelLine}
                  </Text>
                </span>
                <Switch id={`${awayHeadingId}-travel`} checked={planTravel} onCheckedChange={setPlanTravel} />
              </div>
            </div>
          ) : null}

          <WeekdayChips
            label={COPY.days}
            indexing="monday"
            value={weekdays}
            onChange={setWeekdays}
          />
          <TimeField label={COPY.at} value={atClock} onChange={setAtClock} required />
          <MinutesStepper
            label={COPY.forLabel}
            value={durationMin}
            onChange={setDurationMin}
            min={DURATION_MIN}
            max={DURATION_MAX}
          />
          <SegmentedControl
            label={COPY.partOfTheDay}
            value={where}
            onChange={(next) => {
              setWhereTouched(true);
              setWhere(next);
            }}
            options={[
              { value: "work" as const, label: COPY.inWork },
              { value: "activity" as const, label: COPY.inTheEvening },
            ]}
          />
          {error ? <HelperText error>{error}</HelperText> : null}
        </div>
      </ResponsiveSheet>

      <DiscardDialog
        open={discardOpen}
        onKeepEditing={() => setDiscardOpen(false)}
        onDiscard={() => {
          setDiscardOpen(false);
          onOpenChange(false);
        }}
      />
    </SheetHost>
  );
}

/** "9:30" (the view's clock) → "09:30" (the input's). */
function toInputClock(clock: string): string {
  const [hour = "0", minute = "00"] = clock.replace(/\s?[AP]M$/i, "").split(":");
  return `${hour.padStart(2, "0")}:${minute}`;
}

/** "Tue" · "Mon, Wed, Fri" — the row's day list, Monday first. */
export function fixtureDaysLabel(weekdays: ReadonlyArray<number>): string {
  return [...weekdays]
    .sort((a, b) => a - b)
    .map((day) => COPY.dayShort[day] ?? "")
    .join(", ");
}
