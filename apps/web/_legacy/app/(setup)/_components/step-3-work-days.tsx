"use client";

import * as React from "react";

import {
  InfoDisclosure,
  ListRow,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatusLine,
} from "@syn/ui";
import type { WorkDayMode, WorkDays } from "@syn/types";

import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import { FactScreen } from "./fact-screen";

/**
 * Screen 3 — work days (UX v1.3 §4.3; v1.2 §4.2's screen 2, renumbered by
 * DAY-8).
 *
 * Seven rows, Monday first, each with a five-value select — *Always ·
 * Usually · Sometimes · Rarely · Never* (R49) — "the select is the control
 * because four words do not fit a segment at 375px" (W5). Mon–Fri *Always*,
 * Sat and Sun *Never* (S2.2). Beneath, the disclosure *What does each choice
 * do?* opens the five lines, verbatim.
 *
 * UX v1.3 §4.3 (DAY-2): the control is the `Select` primitive, its menu
 * anchored under the trigger (`position="popper"`) — the native menu opened
 * where the OS put it (T2.1); the disclosure is an `InfoDisclosure` (R60,
 * T2.3), the value in weight 500 and the definition after it.
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
// v1.3 R49: five values, *Usually* second.
const MODES = ["always", "usually", "sometimes", "rarely", "never"] as const satisfies readonly WorkDayMode[];

export function Step3WorkDays({
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
      step={3}
      heading={COPY.workDaysHeading}
      body={COPY.workDaysBody}
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
                // The anchored `Select` (v1.3 §4.3, T2.1): the menu opens under its trigger, not where the OS puts it.
                <Select value={workDays[key]} onValueChange={(value) => void change(key, value as WorkDayMode)}>
                  <SelectTrigger aria-label={COPY.weekdays[index]} className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" align="end">
                    {MODES.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {COPY.workDayModes[mode]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            />
          ))}
        </ul>

        {line === null ? null : <StatusLine variant="sync-issues" text={line} placement="inline" />}

        <InfoDisclosure
          label={COPY.whatEachChoiceDoes}
          expanded={open}
          onToggle={setOpen}
          items={MODES.map((mode) => ({ term: COPY.workDayModes[mode], text: COPY.workDayModeDefinitions[mode] }))}
        />
      </div>
    </FactScreen>
  );
}
