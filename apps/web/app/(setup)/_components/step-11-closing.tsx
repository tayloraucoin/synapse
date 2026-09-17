"use client";

import * as React from "react";

import {
  Button,
  EllipsesMenu,
  GroupHeading,
  Input,
  SelectRow,
  SelectRowList,
  SortableHandle,
  SortableList,
  StatusLine,
  Switch,
  Text,
  TimeField,
} from "@syn/ui";
import {
  DEFAULT_JOURNAL_PROMPTS,
  DEVICES_OFF_OFFSET_MIN,
  JOURNAL_PROMPTS_MAX,
  JOURNAL_PROMPT_MAX,
  JOURNAL_REMINDER_OFFSET_MIN,
  PLACED_ROW_ICONS,
  STARTER_LIBRARY,
} from "@syn/constants";
import type { IconValue, JournalPrompt } from "@syn/types";
import { clockFromMinutes, clockToMinutes, formatClockFromMinutes } from "@syn/utils";

import { HabitSheet } from "@/components/habit-sheet";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import { FactScreen } from "./fact-screen";

/**
 * Screen 11 — Closing the day (UX v1.2 §4.11, R38; RUN-11), on DYN-11/18.
 *
 * "Lights-out, phone-away, the wind-down habits, and whether a few lines at
 * night are wanted — and when to be reminded." Every control writes at once.
 *
 * PHONE AWAY FOLLOWS LIGHTS OUT UNTIL TOUCHED (S10.2): the field shows the
 * effective time — the stored one, or an hour before lights out — and
 * `devices_off_time` is written only when the person changes it. Then it is
 * theirs, and lights out moving does not move it. The line under it is one
 * sentence and cites nothing (v1.1 §13 #13); phone away is never framed as a
 * rule.
 *
 * THE WIND-DOWN STARTERS TICK LIKE THE MORNING'S — a tick creates the habit
 * (`block_kind wind_down`) and nothing else: lengths and order are the day
 * builder's (§4.13h), and the wind-down template still places the journal
 * and *Phone away* itself at materialisation (§7.1). Nothing pre-selected.
 *
 * THE PROMPTS ARE THE PERSON'S, sortable by handle, the menu keeping *Move
 * up / Move down* as the keyboard path; a rename keeps the key so its
 * answers survive. THE REMINDER is one push at a time the person set, in
 * their words — the caption reads them back; it hides with the journal.
 */

const WIND_DOWN_OFFERS = STARTER_LIBRARY.wind_down.filter((entry) => entry.placed !== true);

/** "HH:mm" minus `offsetMin`, wrapping past midnight. */
function minus(clock: string, offsetMin: number): string {
  return clockFromMinutes(clockToMinutes(clock) - offsetMin);
}

export function Step11Closing({
  initialLightsOut,
  initialDevicesOff,
  initialJournalEnabled,
  initialPrompts,
  initialReminderTime,
  initialReminderEnabled,
  embedded = false,
  onSaved,
}: {
  initialLightsOut: string | null;
  /** The stored value; null = following lights out. */
  initialDevicesOff: string | null;
  initialJournalEnabled: boolean;
  initialPrompts: JournalPrompt[];
  /** The stored value; null = following phone away. */
  initialReminderTime: string | null;
  initialReminderEnabled: boolean;
  embedded?: boolean;
  onSaved?: () => void;
}) {
  const online = useOnline();
  const save = trpc.user.updatePreferences.useMutation();
  const setPref = trpc.notification.setPref.useMutation();
  const utils = trpc.useUtils();
  const windDownHabits = trpc.habit.list.useQuery({ includeArchived: false, blockKind: "wind_down" });
  const fromLibrary = trpc.habit.createFromStarterLibrary.useMutation();
  const archive = trpc.habit.archive.useMutation();

  const [lightsOut, setLightsOut] = React.useState(initialLightsOut ?? "22:45");
  const [devicesOff, setDevicesOff] = React.useState<string | null>(initialDevicesOff);
  const [journal, setJournal] = React.useState(initialJournalEnabled);
  const [prompts, setPrompts] = React.useState<JournalPrompt[]>(
    initialPrompts.length > 0 ? initialPrompts : DEFAULT_JOURNAL_PROMPTS.map((prompt) => ({ ...prompt })),
  );
  const [reminderTime, setReminderTime] = React.useState<string | null>(initialReminderTime);
  const [reminderOn, setReminderOn] = React.useState(initialReminderEnabled);
  const [editing, setEditing] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");
  const [adding, setAdding] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [pending, setPending] = React.useState<Map<string, boolean>>(new Map());
  const [line, setLine] = React.useState<string | null>(null);
  const inFlight = React.useRef<Map<string, Promise<void>>>(new Map());
  const journalId = React.useId();
  const reminderId = React.useId();

  const devicesOffEffective = devicesOff ?? minus(lightsOut, DEVICES_OFF_OFFSET_MIN);
  const reminderEffective = reminderTime ?? minus(devicesOffEffective, JOURNAL_REMINDER_OFFSET_MIN);

  async function write(patch: Parameters<typeof save.mutateAsync>[0]): Promise<void> {
    setLine(null);
    try {
      await save.mutateAsync(patch);
      await utils.user.me.invalidate();
    } catch {
      setLine(COPY.saveError);
    }
  }

  /* -------------------------------------------------- the two times -- */

  const onLightsOut = (next: string) => {
    setLightsOut(next);
    // Phone away follows until touched; once touched, both go so the rule can speak.
    void write(devicesOff === null ? { lightsOutTime: next } : { lightsOutTime: next, devicesOffTime: devicesOff });
  };

  const onDevicesOff = (next: string) => {
    setDevicesOff(next);
    void write({ devicesOffTime: next, lightsOutTime: lightsOut });
  };

  /* ---------------------------------------------- the wind-down rows -- */

  const habits = React.useMemo(() => windDownHabits.data?.habits ?? [], [windDownHabits.data?.habits]);
  const byTitle = new Map(habits.map((habit) => [habit.title.toLowerCase(), habit]));

  const toggle = (title: string, on: boolean) => {
    setLine(null);
    setPending((current) => new Map(current).set(title, on));
    const previous = inFlight.current.get(title) ?? Promise.resolve();
    const run = previous
      .catch(() => undefined)
      .then(async () => {
        const fresh = await utils.habit.list.fetch({ includeArchived: false, blockKind: "wind_down" });
        const habit = fresh.habits.find((row) => row.title.toLowerCase() === title.toLowerCase());
        if (on) {
          if (!habit) await fromLibrary.mutateAsync({ blockKind: "wind_down", titles: [title] });
        } else if (habit) {
          const usage = await utils.habit.usage.fetch({ id: habit.id });
          if (usage.recentDays.length === 0) await archive.mutateAsync({ id: habit.id });
        }
        await utils.habit.list.invalidate();
      })
      .catch(() => setLine(COPY.stepSaveError(title)))
      .finally(() => {
        if (inFlight.current.get(title) === run) {
          inFlight.current.delete(title);
          setPending((current) => {
            const next = new Map(current);
            next.delete(title);
            return next;
          });
        }
      });
    inFlight.current.set(title, run);
  };

  /* -------------------------------------------------- the prompts -- */

  const writePrompts = (next: JournalPrompt[]) => {
    setPrompts(next);
    void write({ journalPrompts: next });
  };

  function move(index: number, direction: -1 | 1): void {
    const target = index + direction;
    if (target < 0 || target >= prompts.length) return;
    const next = [...prompts];
    const [moved] = next.splice(index, 1);
    if (moved === undefined) return;
    next.splice(target, 0, moved);
    writePrompts(next);
  }

  function rename(key: string, label: string): void {
    const trimmed = label.trim();
    if (trimmed === "") return;
    writePrompts(prompts.map((prompt) => (prompt.key === key ? { ...prompt, label: trimmed } : prompt)));
    setEditing(null);
  }

  function add(label: string): void {
    const trimmed = label.trim();
    if (trimmed === "" || prompts.length >= JOURNAL_PROMPTS_MAX) return;
    writePrompts([...prompts, { key: keyFor(trimmed, prompts), label: trimmed }]);
    setDraft("");
    setAdding(false);
  }

  const reminderCaption = COPY.reminderCaption(formatClockFromMinutes(clockToMinutes(reminderEffective)));

  return (
    <FactScreen
      step={11}
      heading={COPY.step11Heading}
      body={COPY.step11Body}
      embedded={embedded}
      onSaved={onSaved}
      save={null}
    >
      <div className="flex flex-col gap-(--space-6)">
        <TimeField
          label={COPY.lightsOut}
          value={lightsOut}
          onChange={onLightsOut}
          disclosed
          changeLabel={COPY.change}
          doneLabel={COPY.done}
          leading={PLACED_ROW_ICONS.lightsOut as IconValue}
          required
        />

        <div className="flex flex-col gap-(--space-1)">
          <TimeField
            label={COPY.phoneAway}
            value={devicesOffEffective}
            onChange={onDevicesOff}
            disclosed
            changeLabel={COPY.change}
            doneLabel={COPY.done}
            leading={PLACED_ROW_ICONS.devicesOff as IconValue}
            required
          />
          <Text as="p" variant="caption" tone="secondary">
            {COPY.phoneAwayLine}
          </Text>
        </div>

        {/* The wind-down starters as rows — a tick creates the habit; nothing pre-selected (§4.11). */}
        <section className="flex flex-col gap-(--space-3)">
          <GroupHeading>{COPY.windDownBand}</GroupHeading>
          <SelectRowList columns={2}>
            {WIND_DOWN_OFFERS.map((offer) => {
              const habit = byTitle.get(offer.title.toLowerCase());
              const ahead = pending.get(offer.title);
              return (
                <SelectRow
                  key={offer.title}
                  icon={offer.icon as IconValue}
                  title={offer.title}
                  detail={COPY.rangeLabel(offer.rangeMin, offer.rangeMax)}
                  selected={ahead ?? habit !== undefined}
                  committing={pending.has(offer.title)}
                  disabled={!online}
                  onToggle={(next) => toggle(offer.title, next)}
                />
              );
            })}
          </SelectRowList>
          <Button
            variant="secondary"
            className="w-full wide:w-auto wide:self-start"
            disabled={!online}
            onClick={() => setSheetOpen(true)}
          >
            {COPY.addSomethingElse}
          </Button>
        </section>

        {/* The journal: the switch, the prompts, the reminder (§4.11, R38). */}
        <section className="flex flex-col gap-(--space-3)">
          <div className="flex items-start justify-between gap-(--space-4)">
            <span className="flex min-w-0 items-start gap-(--space-2)">
              <span aria-hidden="true" className="font-emoji inline-flex size-(--target) shrink-0 items-center justify-center text-[1.25rem] leading-none">
                {PLACED_ROW_ICONS.journal.value}
              </span>
              <span className="flex min-w-0 flex-col gap-(--space-1) pt-(--space-2)">
                <Text as="label" htmlFor={journalId} variant="body" weight={500}>
                  {COPY.fewLines}
                </Text>
              </span>
            </span>
            <Switch
              id={journalId}
              checked={journal}
              disabled={!online}
              onCheckedChange={(next) => {
                setJournal(next);
                void write({ journalEnabled: next });
              }}
            />
          </div>

          {journal ? (
            <>
              <SortableList
                label={COPY.promptsLabel}
                items={prompts.map((prompt) => ({ id: prompt.key, title: prompt.label, prompt }))}
                onReorder={(keys) => {
                  const byKey = new Map(prompts.map((prompt) => [prompt.key, prompt]));
                  writePrompts(keys.map((key) => byKey.get(key)).filter((prompt): prompt is JournalPrompt => prompt !== undefined));
                }}
                renderItem={(item, { handleProps }) => {
                  const prompt = item.prompt;
                  const index = prompts.findIndex((row) => row.key === prompt.key);
                  return (
                    <div className="flex min-w-0 flex-1 items-center gap-(--space-2)">
                      <SortableHandle {...handleProps} />
                      {editing === prompt.key ? (
                        <form
                          className="flex min-w-0 flex-1 items-end gap-(--space-2)"
                          onSubmit={(event) => {
                            event.preventDefault();
                            rename(prompt.key, draft);
                          }}
                        >
                          <Input
                            label={COPY.promptLabel}
                            value={draft}
                            maxLength={JOURNAL_PROMPT_MAX}
                            autoFocus
                            onChange={(event) => setDraft(event.target.value)}
                            className="flex-1"
                          />
                          <Button type="submit" size="sm" disabled={draft.trim() === ""}>
                            {COPY.done}
                          </Button>
                        </form>
                      ) : (
                        <Text as="span" variant="body" truncate className="min-w-0 flex-1" title={prompt.label}>
                          {prompt.label}
                        </Text>
                      )}
                      <EllipsesMenu
                        label={prompt.label}
                        items={[
                          {
                            label: COPY.edit,
                            onClick: () => {
                              setDraft(prompt.label);
                              setEditing(prompt.key);
                            },
                          },
                          { label: COPY.moveUp, onClick: () => move(index, -1), disabled: index === 0 },
                          { label: COPY.moveDown, onClick: () => move(index, 1), disabled: index === prompts.length - 1 },
                          {
                            label: COPY.remove,
                            onClick: () => writePrompts(prompts.filter((row) => row.key !== prompt.key)),
                          },
                        ]}
                      />
                    </div>
                  );
                }}
              />

              {adding ? (
                <form
                  className="flex items-end gap-(--space-2)"
                  onSubmit={(event) => {
                    event.preventDefault();
                    add(draft);
                  }}
                >
                  <Input
                    label={COPY.promptLabel}
                    value={draft}
                    maxLength={JOURNAL_PROMPT_MAX}
                    autoFocus
                    onChange={(event) => setDraft(event.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="sm" disabled={draft.trim() === ""}>
                    {COPY.add}
                  </Button>
                </form>
              ) : (
                <Button
                  variant="ghost"
                  className="self-start"
                  disabled={prompts.length >= JOURNAL_PROMPTS_MAX || !online}
                  onClick={() => {
                    setDraft("");
                    setEditing(null);
                    setAdding(true);
                  }}
                >
                  {COPY.addAPrompt}
                </Button>
              )}

              <Text as="p" variant="caption" tone="secondary">
                {COPY.fewLinesBody}
              </Text>

              <div className="flex flex-col gap-(--space-1)">
                <div className="flex items-end gap-(--space-3)">
                  <div className="min-w-0 flex-1">
                    <TimeField
                      label={COPY.aReminder}
                      value={reminderEffective}
                      onChange={(next) => {
                        setReminderTime(next);
                        void write({ journalReminderTime: next });
                      }}
                      disclosed
                      changeLabel={COPY.change}
                      doneLabel={COPY.done}
                      required
                    />
                  </div>
                  <span className="flex items-center gap-(--space-2) pb-(--space-2)">
                    <Text as="label" htmlFor={reminderId} variant="caption" tone="secondary">
                      {COPY.remindMe}
                    </Text>
                    <Switch
                      id={reminderId}
                      checked={reminderOn}
                      disabled={!online}
                      aria-describedby={`${reminderId}-caption`}
                      onCheckedChange={(next) => {
                        setReminderOn(next);
                        void write({ journalReminderEnabled: next });
                        void setPref.mutateAsync({ kind: "journal_reminder", enabled: next }).then(() =>
                          utils.notification.prefs.invalidate(),
                        );
                      }}
                    />
                  </span>
                </div>
                <Text as="p" id={`${reminderId}-caption`} variant="caption" tone="secondary">
                  {reminderCaption}
                </Text>
              </div>
            </>
          ) : null}
        </section>

        {line === null ? null : <StatusLine variant="sync-issues" text={line} placement="inline" />}
      </div>

      <HabitSheet
        open={sheetOpen}
        mode="wind-down-habit"
        onOpenChange={setSheetOpen}
        onSaved={() => void utils.habit.list.invalidate()}
      />
    </FactScreen>
  );
}

/** A stable key from the words — `journalPromptKeySchema`'s shape, unique in the set. */
function keyFor(label: string, existing: readonly JournalPrompt[]): string {
  const base =
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .replace(/^[0-9]/, "p$&")
      .slice(0, 50) || "prompt";
  let key = base;
  let n = 2;
  while (existing.some((prompt) => prompt.key === key)) {
    key = `${base}_${n}`;
    n += 1;
  }
  return key;
}
