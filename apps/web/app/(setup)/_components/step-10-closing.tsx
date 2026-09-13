"use client";

import * as React from "react";

import { Button, EllipsesMenu, Input, ListRow, Switch, Text, TimeField } from "@syn/ui";
import { DEFAULT_JOURNAL_PROMPTS, JOURNAL_PROMPTS_MAX, JOURNAL_PROMPT_MAX } from "@syn/constants";
import type { JournalPrompt } from "@syn/types";

import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import { FactScreen } from "./fact-screen";

/**
 * Screen 10 — Closing the day (UX v1.1 §4.10).
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
 */
export function Step10Closing({
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
  const save = trpc.user.updatePreferences.useMutation();
  const utils = trpc.useUtils();
  const windDown = trpc.template.list.useQuery({ includeArchived: false, kind: "wind_down" });
  const create = trpc.template.create.useMutation();

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
      step={10}
      heading={COPY.step10Heading}
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
