"use client";

import * as React from "react";

import { GroupHeading, StatusLine, Switch, Text } from "@syn/ui";

import { PassageList } from "@/components/passages";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import { FactScreen } from "./fact-screen";

/**
 * Screen 6 — before the day (UX v1.2 §4.6; RUN-9).
 *
 * "What do you want to hear first thing?" Three things: the person's
 * passages as an ordered list with a sheet (`components/passages`); a switch
 * that lets a quote from the bank join the cycle, off by default, with the
 * one line the document allows the app to say about it; and three switches,
 * on, for the morning's optional lines — gratitude, intention, and *Today,
 * as I see it*.
 *
 * EVERY SWITCH WRITES AT ONCE (§4, R30; TD-18): the switch moves on the tap
 * and the write follows; a rejection puts it back with one line. *Continue ·
 * n passages* only navigates. Under Settings → Your day the same screen has
 * no *Save* of its own — nothing here waits for one.
 *
 * WHAT IT MUST NEVER DO (§4.6): supply a passage, a starter phrase, or an
 * example passage; speak a quote in the app's voice; make anything here
 * required. The textarea passage and *Show what I wrote the night before*
 * are gone (R41, TD-15); their columns wait for `0009`.
 */
export function Step6BeforeTheDay({
  initialQuotesOptIn,
  initialAskGratitude,
  initialAskIntention,
  initialAskVisualisation,
  embedded = false,
  onSaved,
}: {
  initialQuotesOptIn: boolean;
  initialAskGratitude: boolean;
  initialAskIntention: boolean;
  initialAskVisualisation: boolean;
  embedded?: boolean;
  onSaved?: () => void;
}) {
  const online = useOnline();
  const save = trpc.user.updatePreferences.useMutation();
  const utils = trpc.useUtils();
  const [quotes, setQuotes] = React.useState(initialQuotesOptIn);
  const [gratitude, setGratitude] = React.useState(initialAskGratitude);
  const [intention, setIntention] = React.useState(initialAskIntention);
  const [visualisation, setVisualisation] = React.useState(initialAskVisualisation);
  const [count, setCount] = React.useState<number | null>(null);
  const [line, setLine] = React.useState<string | null>(null);

  type Key = "quotesOptIn" | "orientAskGratitude" | "orientAskIntention" | "orientAskVisualisation";
  const setters: Record<Key, (next: boolean) => void> = {
    quotesOptIn: setQuotes,
    orientAskGratitude: setGratitude,
    orientAskIntention: setIntention,
    orientAskVisualisation: setVisualisation,
  };

  async function toggle(key: Key, next: boolean): Promise<void> {
    setters[key](next);
    setLine(null);
    try {
      await save.mutateAsync({ [key]: next });
      await utils.user.me.invalidate();
    } catch {
      setters[key](!next);
      setLine(COPY.saveError);
    }
  }

  const row = (
    key: Key,
    checked: boolean,
    label: string,
    caption: string,
  ) => {
    const id = `switch-${key}`;
    return (
      <div className="flex min-h-(--row-min) items-start justify-between gap-(--space-4) py-(--space-2)">
        <span className="flex min-w-0 flex-col gap-(--space-1)">
          <Text as="label" htmlFor={id} variant="body" weight={500}>
            {label}
          </Text>
          <Text as="span" variant="caption" tone="secondary">
            {caption}
          </Text>
        </span>
        <Switch id={id} checked={checked} disabled={!online} onCheckedChange={(next) => void toggle(key, next)} />
      </div>
    );
  };

  return (
    <FactScreen
      step={6}
      heading={COPY.step6Heading}
      body={COPY.step6Body}
      embedded={embedded}
      onSaved={onSaved}
      primaryLabel={COPY.continuePassages(count ?? 0)}
      save={null}
    >
      <div className="flex flex-col gap-(--space-6)">
        <section className="flex flex-col gap-(--space-3)">
          <GroupHeading>{COPY.passages}</GroupHeading>
          <PassageList onCountChange={setCount} />
        </section>

        <section className="flex flex-col gap-(--space-2)">
          <GroupHeading>{COPY.aQuoteEachDay}</GroupHeading>
          {row("quotesOptIn", quotes, COPY.quoteSwitch, COPY.quoteLine)}
        </section>

        <section className="flex flex-col gap-(--space-2)">
          <GroupHeading>{COPY.inTheMorning}</GroupHeading>
          <div className="divide-hairline flex flex-col divide-y">
            {row("orientAskGratitude", gratitude, COPY.askGratitude, COPY.gratitudeCaption)}
            {row("orientAskIntention", intention, COPY.askIntention, COPY.intentionCaption)}
            {row("orientAskVisualisation", visualisation, COPY.askVisualisation, COPY.visualisationCaption)}
          </div>
        </section>

        {line === null ? null : <StatusLine variant="sync-issues" text={line} placement="inline" />}
      </div>
    </FactScreen>
  );
}
