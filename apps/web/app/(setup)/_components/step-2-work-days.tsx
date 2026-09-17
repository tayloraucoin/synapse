"use client";

import * as React from "react";

import { ListRow, NativeSelect, NativeSelectOption, StatusLine, Text, TextDisclosureButton } from "@syn/ui";
import type { WorkDayMode, WorkDays } from "@syn/types";

import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import { FactScreen } from "./fact-screen";

/**
 * Screen 2 — work days (UX v1.2 §4.2).
 *
 * Seven rows, Monday first, each with a four-value select — *Always ·
 * Sometimes · Rarely · Never* — "the select is the control because four
 * words do not fit a segment at 375px" (W5). Mon–Fri *Always*, Sat and Sun
 * *Never* (S2.2). Beneath, the disclosure *What does each choice do?* opens
 * the four lines, verbatim.
 *
 * EVERY CHANGE WRITES AT ONCE (§4, R30; TD-18). A select is a fact the
 * moment it changes: the row shows the new value, the write goes, and a
 * rejection puts the old value back with one line — *Continue* only
 * navigates. Under Settings → Your day the same screen keeps a *Save* for
 * the person who expects one, writing the same object again (harmless).
 *
 * THE OLD DEFAULT CARRIED *Saturday · Sometimes*; v1.2 says *Never* for both
 * weekend days.
 */

const DEFAULT_WORK_DAYS: WorkDays = {
  "0": "always",
  "1": "always",
  "2": "always",
  "3": "always",
  "4": "always",
  "5": "never",
  "6": "never",
};

const KEYS = ["0", "1", "2", "3", "4", "5", "6"] as const;
const MODES: readonly WorkDayMode[] = ["always", "sometimes", "rarely", "never"];

export function Step2WorkDays({
  initialWorkDays,
  embedded = false,
  onSaved,
}: {
  initialWorkDays: WorkDays | null;
  embedded?: boolean;
  onSaved?: () => void;
}) {
  const online = useOnline();
  const save = trpc.user.updatePreferences.useMutation();
  const utils = trpc.useUtils();
  const [workDays, setWorkDays] = React.useState<WorkDays>(initialWorkDays ?? DEFAULT_WORK_DAYS);
  const [open, setOpen] = React.useState(false);
  const [line, setLine] = React.useState<string | null>(null);
  const linesId = React.useId();

  async function change(key: (typeof KEYS)[number], mode: WorkDayMode): Promise<void> {
    const previous = workDays;
    const next = { ...workDays, [key]: mode };
    setWorkDays(next);
    setLine(null);
    if (!online) {
      // Offline: the standard line, and the value stays local (§4, R30 waits).
      setLine(COPY.offline);
      setWorkDays(previous);
      return;
    }
    try {
      await save.mutateAsync({ workDays: next });
      await utils.user.me.invalidate();
    } catch {
      setWorkDays(previous);
      setLine(COPY.saveError);
    }
  }

  return (
    <FactScreen
      step={2}
      heading={COPY.step2Heading}
      body={COPY.step2Body}
      embedded={embedded}
      onSaved={onSaved}
      // Save as you go: the selects have written already; embedded's *Save* re-sends the same.
      save={embedded ? async () => { await save.mutateAsync({ workDays }); } : null}
    >
      <div className="flex flex-col gap-(--space-3)">
        <ul className="divide-hairline flex flex-col divide-y">
          {KEYS.map((key, index) => (
            <ListRow
              key={key}
              as="li"
              title={COPY.weekdays[index]}
              trailing={
                <NativeSelect
                  aria-label={COPY.weekdays[index]}
                  value={workDays[key]}
                  onChange={(event) => void change(key, event.target.value as WorkDayMode)}
                  className="h-(--target) w-40 truncate rounded-(--radius) border-input bg-paper text-ink shadow-none text-(length:--fs-body)"
                >
                  {MODES.map((mode) => (
                    <NativeSelectOption key={mode} value={mode}>
                      {COPY.workDayModes[mode]}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              }
            />
          ))}
        </ul>

        {line === null ? null : <StatusLine variant="sync-issues" text={line} placement="inline" />}

        <TextDisclosureButton
          expanded={open}
          collapsedLabel={COPY.whatEachChoiceDoes}
          expandedLabel={COPY.whatEachChoiceDoes}
          aria-controls={linesId}
          onClick={() => setOpen((current) => !current)}
        />
        {open ? (
          <ul id={linesId} className="m-0 flex list-none flex-col gap-(--space-2) p-0">
            {MODES.map((mode) => (
              <li key={mode}>
                <Text as="span" variant="caption" tone="secondary">
                  {COPY.workDayModeLines[mode]}
                </Text>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </FactScreen>
  );
}
