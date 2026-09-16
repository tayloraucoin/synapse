"use client";

import * as React from "react";

import { Button, Text, Textarea } from "@syn/ui";
import { DEFAULT_JOURNAL_PROMPTS, INTENTION_MAX, MORNING_GRATITUDE_MAX } from "@syn/constants";
import { formatCalendarDay } from "@syn/utils";

import { ORIENT_COPY as COPY } from "./copy";
import { useOrientFrame, type OrientView } from "./use-orient-frame";

/**
 * The orient frame — UX v1.1 §5.2 (DYN-13).
 *
 * "Point the mind the way the person wants it pointed before the day gets in
 * — with the person's own words, never the app's." Paper, one column of
 * reading at 64ch: the caption *Last night* and the date; the three journal
 * lines in Newsreader with their prompts as captions; the passage; one
 * optional line to write, and a second; one primary.
 *
 * WHAT IT NEVER SHOWS: a time, a count, a streak, a "day 12", anything red,
 * a header, a tab bar. The date is the only figure on the page. The frame
 * never opens onto blank paper: with no entry and no passage, one line says
 * tonight's journal shows up here tomorrow.
 */

const PROMPT_BY_KEY = new Map(DEFAULT_JOURNAL_PROMPTS.map((prompt) => [prompt.key, prompt.label]));

export function OrientFrame({ initial }: { initial: OrientView }) {
  const frame = useOrientFrame(initial);
  const firstFieldRef = React.useRef<HTMLTextAreaElement>(null);
  const primaryRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    (firstFieldRef.current ?? primaryRef.current)?.focus();
  }, []);

  const lines = [
    { key: "makeHappen", caption: COPY.makeHappenToday, text: initial.lastNight?.makeHappen ?? null },
    { key: "visualisation", caption: PROMPT_BY_KEY.get("visualisation") ?? "", text: initial.lastNight?.visualisation ?? null },
    { key: "lookingForward", caption: PROMPT_BY_KEY.get("looking_forward") ?? "", text: initial.lastNight?.lookingForward ?? null },
  ].filter((line) => line.text !== null);
  const hasJournal = lines.length > 0;
  // RUN-4 bridge: today's passage from the cycle, as plain text, until RUN-9
  // mounts the carousel (UX v1.2 §5.2). A migrated textarea passage is its
  // own Markdown, so the old rendering still reads.
  const passage =
    initial.todayIndex === null
      ? null
      : (initial.passages[initial.todayIndex]?.bodyMd ?? null);
  const hasPassage = passage !== null;

  const dateLabel = formatCalendarDay(new Date(`${initial.date}T12:00:00Z`), "UTC", "long");

  return (
    <main id="main" className="bg-paper text-ink flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-[64ch] flex-1 flex-col gap-(--space-6) px-(--space-4) pt-(--space-8) pb-(--space-8) wide:max-w-[720px]">
        <header className="flex flex-col gap-(--space-1)">
          <Text as="h1" variant="caption" tone="secondary" tabIndex={-1}>
            {COPY.lastNight}
          </Text>
          <Text as="p" variant="caption" tone="secondary">
            {dateLabel}
          </Text>
        </header>

        {hasJournal ? (
          <div className="flex flex-col">
            {lines.map((line) => (
              <figure key={line.key} className="border-hairline flex flex-col gap-(--space-2) border-t py-(--space-4)">
                <figcaption>
                  <Text as="span" variant="caption" tone="secondary">
                    {line.caption}
                  </Text>
                </figcaption>
                <blockquote className="font-serif text-(length:--fs-body) leading-relaxed whitespace-pre-wrap">
                  {line.text}
                </blockquote>
              </figure>
            ))}
          </div>
        ) : null}

        {hasPassage ? (
          <div className="border-hairline flex flex-col gap-(--space-2) border-t py-(--space-4)">
            {hasJournal ? (
              <Text as="span" variant="caption" tone="secondary">
                {COPY.everyMorning}
              </Text>
            ) : null}
            <p className="font-serif text-(length:--fs-body) leading-relaxed whitespace-pre-wrap">{passage}</p>
          </div>
        ) : null}

        {!hasJournal && !hasPassage ? (
          <p className="font-serif text-(length:--fs-body) leading-relaxed text-text-secondary">{COPY.nothingYet}</p>
        ) : null}

        <div className="flex flex-col gap-(--space-5)">
          {initial.askGratitude ? (
            <Textarea
              ref={firstFieldRef}
              variant="serif"
              label={COPY.gratitude}
              value={frame.gratitude}
              maxLength={MORNING_GRATITUDE_MAX}
              onChange={(event) => frame.onGratitude(event.target.value)}
              onBlur={frame.onBlur}
              helperText={
                frame.showSkipLine ? (
                  <span aria-live="polite">{COPY.skippedYesterday}</span>
                ) : undefined
              }
            />
          ) : null}
          <Textarea
            ref={initial.askGratitude ? undefined : firstFieldRef}
            variant="serif"
            label={COPY.intention}
            value={frame.intention}
            maxLength={INTENTION_MAX}
            onChange={(event) => frame.onIntention(event.target.value)}
            onBlur={frame.onBlur}
          />
        </div>

        <div className="mt-auto pt-(--space-6) pb-[env(safe-area-inset-bottom)]">
          <Button ref={primaryRef} className="w-full" busy={frame.starting} onClick={frame.start}>
            {COPY.start}
          </Button>
        </div>
      </div>
    </main>
  );
}
