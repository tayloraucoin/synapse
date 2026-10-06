"use client";

import * as React from "react";

import { GroupHeading, StatusLine, Switch, Text } from "@syn/ui";

import { LINKS_COPY, LinkList } from "@/components/links";
import { PassageList } from "@/components/passages";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "@/app/(setup)/_components/copy";
import { FactScreen } from "@/app/(setup)/_components/fact-screen";

import type { DayBuilderApi } from "../use-day-builder";

/**
 * First thing — v1.2's screen 6, *before the day* (UX v1.2 §4.6; RUN-9),
 * now B8 (UX v1.3 §4.4 B8, R53, R54) and Settings → Your day → *First
 * thing*. DAY-13 moved the body here from the retired step file.
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
 * are gone (R41, TD-15); `0010` drops their columns (DAY-13).
 */
export function FirstThing({
  initialQuotesOptIn,
  initialAskGratitude,
  initialAskIntention,
  initialAskVisualisation,
  embedded = false,
  bare = false,
  onSaved,
  onCounts,
}: {
  initialQuotesOptIn: boolean;
  initialAskGratitude: boolean;
  initialAskIntention: boolean;
  initialAskVisualisation: boolean;
  embedded?: boolean;
  /** Inside the day builder's frame as B8 (DAY-10): the content alone. */
  bare?: boolean;
  onSaved?: () => void;
  /** B8's primary counts — *Next · 2 passages · 1 link*. */
  onCounts?: (counts: { passages: number; links: number }) => void;
}) {
  const online = useOnline();
  const save = trpc.user.updatePreferences.useMutation();
  const utils = trpc.useUtils();
  const [quotes, setQuotes] = React.useState(initialQuotesOptIn);
  const [gratitude, setGratitude] = React.useState(initialAskGratitude);
  const [intention, setIntention] = React.useState(initialAskIntention);
  const [visualisation, setVisualisation] = React.useState(initialAskVisualisation);
  const [count, setCount] = React.useState<number | null>(null);
  const [linkCount, setLinkCount] = React.useState(0);
  const [line, setLine] = React.useState<string | null>(null);

  React.useEffect(() => {
    onCounts?.({ passages: count ?? 0, links: linkCount });
  }, [count, linkCount, onCounts]);

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
    secondCaption?: string,
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
          {secondCaption === undefined ? null : (
            <Text as="span" variant="caption" tone="secondary">
              {secondCaption}
            </Text>
          )}
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
      bare={bare}
      onSaved={onSaved}
      primaryLabel={COPY.continuePassages(count ?? 0)}
      save={null}
    >
      <div className="flex flex-col gap-(--space-6)">
        <section className="flex flex-col gap-(--space-3)">
          <GroupHeading>{COPY.passages}</GroupHeading>
          <PassageList onCountChange={setCount} />
        </section>

        {/* UX v1.3 R53, §4.4 B8 (DAY-10): things to open from the morning — the server derives each one's kind. */}
        <section className="flex flex-col gap-(--space-3)">
          <GroupHeading>{LINKS_COPY.heading}</GroupHeading>
          <LinkList disabled={!online} onCountChange={setLinkCount} />
        </section>

        <section className="flex flex-col gap-(--space-2)">
          <GroupHeading>{COPY.aQuoteEachDay}</GroupHeading>
          {row("quotesOptIn", quotes, COPY.quoteSwitch, COPY.quoteLine, COPY.quoteClosesJournal)}
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

/**
 * B8 — first thing (UX v1.3 §4.4 B8, R53, R54; DAY-10) — a PROFILE screen,
 * on the first plan only (`visibleScreens`). `FirstThing` mounted `bare`
 * inside the builder's frame; the builder's *Next* is the one primary and
 * reads the counts.
 */
export function ScreenFirstThing({
  api,
  onCounts,
}: {
  api: DayBuilderApi;
  onCounts: (counts: { passages: number; links: number }) => void;
}) {
  const profile = api.profile;
  if (profile === null) return null;
  return (
    <FirstThing
      initialQuotesOptIn={profile.quotesOptIn}
      initialAskGratitude={profile.orientAskGratitude}
      initialAskIntention={profile.orientAskIntention}
      initialAskVisualisation={profile.orientAskVisualisation}
      bare
      onCounts={onCounts}
    />
  );
}
