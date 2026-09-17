"use client";

import * as React from "react";

import { Button, PassageCarousel, Text, TextDisclosureButton, Textarea, type PassageSlide } from "@syn/ui";
import { DEFAULT_JOURNAL_PROMPTS, INTENTION_MAX, MORNING_GRATITUDE_MAX, VISUALISATION_MAX } from "@syn/constants";
import { formatCalendarDay } from "@syn/utils";

import { assetRoute } from "@/lib/routes";

import { ORIENT_COPY as COPY } from "./copy";
import { useOrientFrame, type OrientView } from "./use-orient-frame";

/**
 * The orient frame — UX v1.2 §5.2 (R41; RUN-9), on v1.1 §5.2 (DYN-13).
 *
 * "Point the mind the way the person wants it pointed before the day gets in
 * — with the person's own words, never the app's." Paper, one column of
 * reading at 64ch, in this order: the carousel of the person's passages (and
 * the quote on its day) with dots; *Last night* as a ghost row, collapsed on
 * every open, expanding to the three journal lines in Newsreader with their
 * prompts as captions; up to three optional lines to write — gratitude,
 * intention, *Today, as I see it*; one primary.
 *
 * ONE READ, THREE OPTIONAL LINES, ONE BUTTON. The *Last night* row is the
 * only disclosure. NOTHING IS WRITTEN BY READING THE FRAME; the fields
 * autosave the person's words and nothing else.
 *
 * WHAT IT NEVER SHOWS: a time, a count, a streak, a "day 12", anything red,
 * a header, a tab bar. The date is the only figure on the page. The frame
 * never opens onto blank paper: with nothing to read, one line says a
 * passage or tonight's journal shows up here tomorrow.
 *
 * THE QUOTE IS ATTRIBUTED, in quotation marks, under the neutral caption
 * *A quote*; the app never speaks it. Markdown renders through the editor's
 * read-only mode inside the carousel (TD-15).
 */

const PROMPT_BY_KEY = new Map(DEFAULT_JOURNAL_PROMPTS.map((prompt) => [prompt.key, prompt.label]));

export function OrientFrame({ initial }: { initial: OrientView }) {
  const frame = useOrientFrame(initial);
  const firstFieldRef = React.useRef<HTMLTextAreaElement>(null);
  const primaryRef = React.useRef<HTMLButtonElement>(null);
  const [lastNightOpen, setLastNightOpen] = React.useState(false);
  const [slide, setSlide] = React.useState(initial.todayIndex ?? 0);
  const lastNightId = React.useId();

  React.useEffect(() => {
    (firstFieldRef.current ?? primaryRef.current)?.focus();
  }, []);

  const lines = [
    { key: "makeHappen", caption: COPY.makeHappenToday, text: initial.lastNight?.makeHappen ?? null },
    { key: "visualisation", caption: PROMPT_BY_KEY.get("visualisation") ?? "", text: initial.lastNight?.visualisation ?? null },
    { key: "lookingForward", caption: PROMPT_BY_KEY.get("looking_forward") ?? "", text: initial.lastNight?.lookingForward ?? null },
  ].filter((line) => line.text !== null);
  const hasJournal = lines.length > 0;

  const slides: PassageSlide[] = [
    ...initial.passages.map((passage) => ({
      kind: "passage" as const,
      id: passage.id,
      title: passage.title ?? "",
      bodyMd: passage.bodyMd,
      images: passage.images,
    })),
    ...(initial.quote === null
      ? []
      : [{ kind: "quote" as const, id: initial.quote.id, text: initial.quote.text, attribution: initial.quote.attribution }]),
  ];
  const hasReading = initial.todayIndex !== null && slides.length > 0;
  const onQuote = hasReading && slides[slide]?.kind === "quote";

  const dateLabel = formatCalendarDay(new Date(`${initial.date}T12:00:00Z`), "UTC", "long");

  type FieldKey = "gratitude" | "intention" | "visualisation";
  const allFields: Array<{ key: FieldKey; label: string; max: number; on: boolean }> = [
    { key: "gratitude", label: COPY.gratitude, max: MORNING_GRATITUDE_MAX, on: initial.askGratitude },
    { key: "intention", label: COPY.intention, max: INTENTION_MAX, on: initial.askIntention },
    { key: "visualisation", label: COPY.visualisation, max: VISUALISATION_MAX, on: initial.askVisualisation },
  ];
  const fields = allFields.filter((field) => field.on);

  return (
    <main id="main" className="bg-paper text-ink flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-[64ch] flex-1 flex-col gap-(--space-6) px-(--space-4) pt-(--space-8) pb-(--space-8) wide:max-w-[720px]">
        <header className="flex flex-col gap-(--space-1)">
          {/* The level-1 heading is the caption above the reading (logged: a change from v1.1's a11y row). */}
          <Text as="h1" variant="caption" tone="secondary" tabIndex={-1}>
            {onQuote ? COPY.aQuote : COPY.everyMorning}
          </Text>
          <Text as="p" variant="caption" tone="secondary">
            {dateLabel}
          </Text>
        </header>

        {hasReading ? (
          <PassageCarousel
            slides={slides}
            index={slide}
            onIndexChange={setSlide}
            resolveImageUrl={(key) => assetRoute(key)}
            label={COPY.todaysReading}
          />
        ) : (
          <p className="tabular-off font-serif text-(length:--fs-body) leading-relaxed text-text-secondary">
            {COPY.nothingYet}
          </p>
        )}

        {hasJournal ? (
          <section className="border-hairline flex flex-col border-t">
            <TextDisclosureButton
              expanded={lastNightOpen}
              collapsedLabel={COPY.lastNight}
              expandedLabel={COPY.lastNight}
              aria-controls={lastNightId}
              onClick={() => setLastNightOpen((current) => !current)}
              classes={{ root: "text-text-secondary font-normal" }}
            />
            {lastNightOpen ? (
              <div id={lastNightId} className="flex flex-col">
                {lines.map((line) => (
                  <figure key={line.key} className="border-hairline flex flex-col gap-(--space-2) border-t py-(--space-4)">
                    <figcaption>
                      <Text as="span" variant="caption" tone="secondary">
                        {line.caption}
                      </Text>
                    </figcaption>
                    <blockquote className="tabular-off m-0 font-serif text-(length:--fs-body) leading-relaxed whitespace-pre-wrap">
                      {line.text}
                    </blockquote>
                  </figure>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        {fields.length === 0 ? null : (
          <div className="flex flex-col gap-(--space-5)">
            {fields.map((field, index) => (
              <Textarea
                key={field.key}
                ref={index === 0 ? firstFieldRef : undefined}
                variant="serif"
                label={field.label}
                value={frame.lines[field.key]}
                maxLength={field.max}
                onChange={(event) => frame.onLine(field.key, event.target.value)}
                onBlur={frame.onBlur}
                helperText={
                  field.key === "gratitude" && frame.showSkipLine ? (
                    <span aria-live="polite">{COPY.skippedYesterday}</span>
                  ) : undefined
                }
              />
            ))}
          </div>
        )}

        <div className="mt-auto pt-(--space-6) pb-[env(safe-area-inset-bottom)]">
          <Button ref={primaryRef} className="w-full" busy={frame.starting} onClick={frame.start}>
            {COPY.start}
          </Button>
        </div>
      </div>
    </main>
  );
}
