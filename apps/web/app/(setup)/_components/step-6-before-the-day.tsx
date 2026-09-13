"use client";

import * as React from "react";

import { Switch, Text, Textarea } from "@syn/ui";
import { ORIENT_PASSAGE_MAX } from "@syn/constants";

import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import { FactScreen } from "./fact-screen";

/**
 * Screen 6 — before the day (UX v1.1 §4.6).
 *
 * "Choose what the first screen of every morning shows." A serif passage —
 * the first Newsreader on a setup screen, because the frame it fills is a
 * reflective surface — and two switches on by default, both of which
 * produce content the person wrote (Sage's note). No quote bank, no
 * affirmation library: the app never supplies the words.
 */
export function Step6BeforeTheDay({
  initialPassage,
  initialShowLastNight,
  initialAskGratitude,
  embedded = false,
  onSaved,
}: {
  initialPassage: string | null;
  initialShowLastNight: boolean;
  initialAskGratitude: boolean;
  embedded?: boolean;
  onSaved?: () => void;
}) {
  const save = trpc.user.updatePreferences.useMutation();
  const [passage, setPassage] = React.useState(initialPassage ?? "");
  const [showLastNight, setShowLastNight] = React.useState(initialShowLastNight);
  const [askGratitude, setAskGratitude] = React.useState(initialAskGratitude);
  const lastNightId = React.useId();
  const gratitudeId = React.useId();

  return (
    <FactScreen
      step={6}
      heading={COPY.step6Heading}
      body={COPY.step6Body}
      embedded={embedded}
      onSaved={onSaved}
      save={async () => {
        await save.mutateAsync({
          orientPassage: passage.trim() === "" ? null : passage,
          orientShowLastNight: showLastNight,
          orientAskGratitude: askGratitude,
        });
      }}
    >
      <div className="flex flex-col gap-(--space-5)">
        <Textarea
          variant="serif"
          label={COPY.passage}
          placeholder={COPY.passagePlaceholder}
          rows={6}
          maxLength={ORIENT_PASSAGE_MAX}
          value={passage}
          onChange={(event) => setPassage(event.target.value)}
        />

        <div className="flex items-start justify-between gap-(--space-4)">
          <span className="flex min-w-0 flex-col gap-(--space-1)">
            <Text as="label" htmlFor={lastNightId} variant="body" weight={500}>
              {COPY.showLastNight}
            </Text>
            <Text as="span" variant="secondary" tone="secondary">
              {COPY.showLastNightBody}
            </Text>
          </span>
          <Switch id={lastNightId} checked={showLastNight} onCheckedChange={setShowLastNight} />
        </div>

        <div className="flex items-start justify-between gap-(--space-4)">
          <Text as="label" htmlFor={gratitudeId} variant="body" weight={500}>
            {COPY.askGratitude}
          </Text>
          <Switch id={gratitudeId} checked={askGratitude} onCheckedChange={setAskGratitude} />
        </div>
      </div>
    </FactScreen>
  );
}
