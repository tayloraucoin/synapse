"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { Button, CheckboxField, EllipsesMenu, Input, ListRow, Switch, Text, TimeField } from "@syn/ui";
import {
  DEFAULT_JOURNAL_PROMPTS,
  JOURNAL_PROMPTS_MAX,
  JOURNAL_PROMPT_MAX,
  STARTER_LIBRARY,
} from "@syn/constants";
import type { JournalPrompt } from "@syn/types";

import { midpoint } from "@/components/block-editor";
import { useOnline } from "@/lib/hooks/use-online";
import { settingsYourDayBlockRoute } from "@/lib/routes";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import { FactScreen } from "./fact-screen";

/**
 * Screen 11 — Closing the day (UX v1.1 §4.10; screen 11 under v1.2 §4 — RUN-8 renumbered the sequence; RUN-11 rebuilds it).
 *
 * "Lights-out, devices-off, and whether a few lines at night are wanted."
 * Phone-away is a time the person set, shown back as such — never framed as
 * a rule; the line under it is one sentence and cites nothing (§13 #13).
 *
 * THE PROMPTS ARE THE PERSON'S. The six defaults are the starting set; a
 * rename keeps the key (its answers survive), a removal drops it from
 * `journal_prompts`, a new one takes a key from its words. *Move up / Move
 * down* is the two-step fallback until DYN-9's handles.
 *
 * The wind-down template is made when none exists; the journal closer and
 * the *Phone away* pin are placed from the profile at materialisation (§7.1),
 * never as rows here.
 *
 * THE WIND-DOWN STARTERS ARE A CHOOSER BAND (§7.1, DYN-18): the library's
 * wind-down entries less the two the app places, nothing checked. A tick
 * creates the habit and a slot on the wind-down template; an untick removes
 * the slot and leaves the habit. The ghost row beneath goes to the routine's
 * editor, where the order and the lengths live.
 */

/** The library's wind-down offers — the two placed rows are never offered. */
const WIND_DOWN_OFFERS = STARTER_LIBRARY.wind_down.filter((entry) => entry.placed !== true);
export function Step11Closing({
  initialLightsOut,
  initialDevicesOff,
  initialJournalEnabled,
  initialPrompts,
  embedded = false,
  onSaved,
}: {
  initialLightsOut: string | null;
  initialDevicesOff: string | null;
  initialJournalEnabled: boolean;
  initialPrompts: JournalPrompt[];
  embedded?: boolean;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const online = useOnline();
  const save = trpc.user.updatePreferences.useMutation();
  const utils = trpc.useUtils();
  const windDown = trpc.template.list.useQuery({ includeArchived: false, kind: "wind_down" });
  const create = trpc.template.create.useMutation();
  const templateId = windDown.data?.[0]?.id ?? null;
  const detail = trpc.template.get.useQuery({ id: templateId ?? "" }, { enabled: templateId !== null });
  const windDownHabits = trpc.habit.list.useQuery({ includeArchived: false, blockKind: "wind_down" });
  const saveSlot = trpc.template.saveSlot.useMutation();
  const removeSlot = trpc.template.removeSlot.useMutation();
  const fromLibrary = trpc.habit.createFromStarterLibrary.useMutation();

  const [lightsOut, setLightsOut] = React.useState(initialLightsOut ?? "22:45");
  const [devicesOff, setDevicesOff] = React.useState(initialDevicesOff ?? "22:15");
  const [journal, setJournal] = React.useState(initialJournalEnabled);
  const [prompts, setPrompts] = React.useState<JournalPrompt[]>(
    initialPrompts.length > 0 ? initialPrompts : DEFAULT_JOURNAL_PROMPTS.map((prompt) => ({ ...prompt })),
  );
  const [editing, setEditing] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");
  const [adding, setAdding] = React.useState(false);
  const journalId = React.useId();

  const ensuring = React.useRef(false);
  React.useEffect(() => {
    if (!windDown.isSuccess || windDown.data.length > 0 || ensuring.current) return;
    ensuring.current = true;
    void create.mutateAsync({ kind: "wind_down" }).then(() => utils.template.list.invalidate());
  }, [windDown.isSuccess, windDown.data, create, utils]);

  const slots = React.useMemo(() => detail.data?.slots ?? [], [detail.data?.slots]);
  const habits = React.useMemo(() => windDownHabits.data?.habits ?? [], [windDownHabits.data?.habits]);
  const ticked = new Set(slots.map((slot) => slot.title));
  const inLibrary = new Set(habits.map((habit) => habit.title));
  const bandBusy = saveSlot.isPending || removeSlot.isPending || fromLibrary.isPending;
  const bandDisabled = !online || bandBusy || templateId === null;

  async function refreshBand(): Promise<void> {
    if (templateId !== null) await utils.template.get.invalidate({ id: templateId });
    await utils.template.list.invalidate();
    await utils.habit.list.invalidate();
  }

  /** A tick: the starter row (when absent), then a slot at the range's midpoint. */
  async function tick(title: string, minutes: number, on: boolean): Promise<void> {
    if (templateId === null) return;
    const slot = slots.find((row) => row.title === title);
    if (!on) {
      if (slot) {
        await removeSlot.mutateAsync({ id: slot.id });
        await refreshBand();
      }
      return;
    }
    let habit = habits.find((row) => row.title === title) ?? null;
    if (habit === null) {
      await fromLibrary.mutateAsync({ blockKind: "wind_down", titles: [title] });
      const fresh = await utils.habit.list.fetch({ includeArchived: false, blockKind: "wind_down" });
      habit = fresh.habits.find((row) => row.title === title) ?? null;
    }
    if (habit === null) return;
    await saveSlot.mutateAsync({
      templateId,
      habitId: habit.id,
      durationMin: minutes,
      gapBeforeMin: 0,
      pinnedClock: null,
      role: "stack",
      priorityOverride: null,
      scheduling: "soft",
    });
    await refreshBand();
  }

  function move(index: number, direction: -1 | 1): void {
    const target = index + direction;
    if (target < 0 || target >= prompts.length) return;
    const next = [...prompts];
    const [moved] = next.splice(index, 1);
    if (moved === undefined) return;
    next.splice(target, 0, moved);
    setPrompts(next);
  }

  function rename(key: string, label: string): void {
    const trimmed = label.trim();
    if (trimmed === "") return;
    setPrompts((current) => current.map((prompt) => (prompt.key === key ? { ...prompt, label: trimmed } : prompt)));
    setEditing(null);
  }

  function add(label: string): void {
    const trimmed = label.trim();
    if (trimmed === "" || prompts.length >= JOURNAL_PROMPTS_MAX) return;
    setPrompts((current) => [...current, { key: keyFor(trimmed, current), label: trimmed }]);
    setDraft("");
    setAdding(false);
  }

  return (
    <FactScreen
      step={11}
      heading={COPY.step11Heading}
      embedded={embedded}
      onSaved={onSaved}
      save={async () => {
        await save.mutateAsync({
          lightsOutTime: lightsOut,
          devicesOffTime: devicesOff,
          journalEnabled: journal,
          journalPrompts: prompts,
        });
      }}
    >
      <div className="flex flex-col gap-(--space-5)">
        <TimeField label={COPY.lightsOut} value={lightsOut} onChange={setLightsOut} disclosed changeLabel={COPY.change} required />

        <div className="flex flex-col gap-(--space-1)">
          <TimeField label={COPY.phoneAway} value={devicesOff} onChange={setDevicesOff} disclosed changeLabel={COPY.change} required />
          <Text as="p" variant="caption" tone="secondary">
            {COPY.phoneAwayLine}
          </Text>
        </div>

        <div className="flex flex-col gap-(--space-3)">
          <div className="flex items-start justify-between gap-(--space-4)">
            <span className="flex flex-col">
              <Text as="label" htmlFor={journalId} variant="body" weight={500}>
                {COPY.fewLines}
              </Text>
              <Text as="span" variant="caption" tone="secondary">
                {COPY.fewLinesBody}
              </Text>
            </span>
            <Switch id={journalId} checked={journal} onCheckedChange={setJournal} />
          </div>

          {journal ? (
            <>
              <ol className="flex flex-col">
                {prompts.map((prompt, index) => (
                  <ListRow
                    key={prompt.key}
                    as="li"
                    title={
                      editing === prompt.key ? (
                        <form
                          className="flex items-end gap-(--space-2)"
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
                          />
                          <Button type="submit" size="sm" disabled={draft.trim() === ""}>
                            {COPY.done}
                          </Button>
                        </form>
                      ) : (
                        prompt.label
                      )
                    }
                    trailing={
                      <EllipsesMenu
                        label={prompt.label}
                        items={[
                          { label: COPY.moveUp, onClick: () => move(index, -1), disabled: index === 0 },
                          { label: COPY.moveDown, onClick: () => move(index, 1), disabled: index === prompts.length - 1 },
                          {
                            label: COPY.edit,
                            onClick: () => {
                              setDraft(prompt.label);
                              setEditing(prompt.key);
                            },
                          },
                          {
                            label: COPY.remove,
                            onClick: () => setPrompts((current) => current.filter((row) => row.key !== prompt.key)),
                          },
                        ]}
                      />
                    }
                  />
                ))}
              </ol>

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
                  />
                  <Button type="submit" size="sm" disabled={draft.trim() === ""}>
                    {COPY.add}
                  </Button>
                </form>
              ) : (
                <Button
                  variant="ghost"
                  className="self-start"
                  disabled={prompts.length >= JOURNAL_PROMPTS_MAX}
                  onClick={() => {
                    setDraft("");
                    setEditing(null);
                    setAdding(true);
                  }}
                >
                  {COPY.addAPrompt}
                </Button>
              )}
            </>
          ) : null}
        </div>

        {/* The wind-down starters — a chooser band, nothing checked (§7.1). */}
        <div className="flex flex-col gap-(--space-3)">
          <Text as="h2" variant="body" weight={500}>
            {COPY.windDownBand}
          </Text>
          <div role="group" aria-label={COPY.windDownBand} className="flex flex-wrap gap-x-(--space-4) gap-y-(--space-2)">
            {WIND_DOWN_OFFERS.map((offer) => (
              <CheckboxField
                key={offer.title}
                checked={ticked.has(offer.title)}
                disabled={bandDisabled}
                onCheckedChange={(next) => {
                  void tick(
                    offer.title,
                    midpoint({ durationMin: offer.rangeMin, durationMax: offer.rangeMax }),
                    next === true,
                  );
                }}
              >
                {inLibrary.has(offer.title) && !ticked.has(offer.title)
                  ? `${offer.title} · ${COPY.inYourLibrary}`
                  : offer.title}
              </CheckboxField>
            ))}
          </div>
          <ul className="flex flex-col">
            <ListRow
              as="li"
              title={COPY.windDownRoutine}
              meta={COPY.windDownRoutineMeta}
              onClick={() => router.push(settingsYourDayBlockRoute("wind_down", templateId ?? undefined))}
            />
          </ul>
        </div>
      </div>
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
