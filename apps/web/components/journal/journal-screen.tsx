"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import { JOURNAL_ANSWER_MAX } from "@syn/constants";
import { Breadcrumb, Card, SaveStatusText, Text, Textarea } from "@syn/ui";
import { addDays, tomorrowPeek, type TomorrowPeek } from "@syn/utils";
import { OfflineLine } from "@/components/planner/offline-line";
import type { JournalRecords } from "@/lib/data/journal-records";
import { useDataSource } from "@/lib/data/source";
import { useConnection } from "@/lib/data/use-connection";
import { useJournal } from "@/lib/data/use-journal";
import { useTodayKey } from "@/lib/data/use-morning";
import { useToday } from "@/lib/data/use-today";
import { reviewRoute, scheduleDateRoute, todayRoute } from "@/lib/routes";
import { JOURNAL_COPY as COPY } from "./copy";
import { useJournalFields } from "./use-journal-fields";

/**
 * Close the day — UX v1.1 §7.2 (DYN-18), redrawn by D-USE-73 (USE-44): "A
 * few lines in the person's own words … so the morning has something true
 * to read back."
 *
 * One focused column: "‹ Wind-down" over "Close the day" and a hairline;
 * the date caption naming tomorrow's Orient; the person's prompts in order,
 * each a caption over a serif line that starts at one row and grows; the
 * save status under the last; the morning's quote once every prompt is
 * answered (DAY-12); the Tomorrow peek at the foot. No finish button, no
 * count, no timer, no starter text: an empty night is nothing.
 *
 * Today and any past day may be written (last night's lines can be finished
 * in the morning); a past day opened from Review reads as serif text under
 * its prompts, with no fields, no status and no peek; a future day is a 404.
 *
 * Focus opens on the title, never a field, so the keyboard does not rise
 * uninvited. A scenario's `view.open` "field:<key>" focuses that field for
 * its capture.
 */
export function JournalScreen({
  dateKey,
  fromReview = false,
}: {
  dateKey: string;
  fromReview?: boolean;
}) {
  const { scenario } = useDataSource();
  const todayKey = useTodayKey();
  const searchParams = useSearchParams();
  const readOnly =
    dateKey < todayKey && (fromReview || scenario.openedFrom === "review");

  const { query, save } = useJournal(dateKey);
  const { online } = useConnection();
  const tomorrow = useToday(addDays(dateKey, 1));
  const peek =
    tomorrow.today === undefined
      ? null
      : tomorrowPeek(
          tomorrow.today.occurrences.blocks.map((occurrence) => ({
            block: { name: occurrence.block.name },
            startsAt: occurrence.startsAt,
          })),
        );

  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const seeded = scenario.view?.open;
  const focusKey = seeded?.startsWith("field:")
    ? seeded.slice("field:".length)
    : null;
  React.useEffect(() => {
    if (focusKey === null) headingRef.current?.focus();
  }, [focusKey]);

  // A journal is written on its day or after, never ahead.
  if (dateKey > todayKey) notFound();
  if (query.isError) throw query.error;

  /** A path with this screen's query kept (less `from`), so `?state=` travels. */
  const kept = (path: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("from");
    const rest = params.toString();
    if (rest === "") return path;
    return `${path}${path.includes("?") ? "&" : "?"}${rest}`;
  };

  return (
    <main id="main" className="flex min-h-dvh flex-col bg-background">
      <div className="mx-auto flex w-full flex-1 flex-col split:max-w-(--content-text)">
        <header className="flex flex-col gap-0.5 border-b border-hairline px-(--space-4) pt-(--space-4) pb-(--space-3)">
          {readOnly ? (
            <Breadcrumb
              label={COPY.backToReview}
              href={kept(reviewRoute())}
              ariaLabel={COPY.backToReviewLabel}
            />
          ) : (
            <Breadcrumb
              label={COPY.back}
              href={kept(todayRoute())}
              ariaLabel={COPY.backLabel}
            />
          )}
          <Text
            as="h1"
            variant="heading"
            ref={headingRef}
            tabIndex={-1}
            className="outline-none"
          >
            {COPY.title}
          </Text>
        </header>

        {!online && !readOnly ? <OfflineLine text={COPY.offline} /> : null}

        <div className="flex flex-col gap-(--space-6) px-(--space-4) pt-(--space-4) pb-(--space-8)">
          <Text as="p" variant="caption" tone="secondary">
            {COPY.dateCaption(dateKey)}
          </Text>

          {query.data === undefined ? null : readOnly ? (
            <JournalReading records={query.data} />
          ) : (
            <JournalFields
              records={query.data}
              save={save}
              online={online}
              focusKey={focusKey}
              peek={peek}
              dateKey={addDays(dateKey, 1)}
              kept={kept}
            />
          )}
        </div>
      </div>
    </main>
  );
}

/** Serif words, as the Last night sheet reads them. */
const SERIF =
  "font-serif text-(length:--fs-review-body) leading-(--lh-review-body)";

function JournalFields({
  records,
  save,
  online,
  focusKey,
  peek,
  dateKey,
  kept,
}: {
  records: JournalRecords;
  save: (key: string, value: string) => Promise<unknown>;
  online: boolean;
  focusKey: string | null;
  peek: TomorrowPeek | null;
  /** Tomorrow's date, for See it. */
  dateKey: string;
  kept: (path: string) => string;
}) {
  const fields = useJournalFields({
    initial: records.entry?.answers ?? {},
    save,
    online,
  });
  const { prompts, quote } = records;
  const allAnswered =
    prompts.length > 0 &&
    prompts.every((prompt) => (fields.answers[prompt.key] ?? "").trim() !== "");
  const focusRef = React.useRef<HTMLTextAreaElement>(null);
  React.useEffect(() => {
    focusRef.current?.focus();
  }, []);

  // Offline the words are kept on the device: that, not "Saved", is the state.
  const statusWord =
    fields.status === "idle" ? null : !online ||
      fields.status === "waiting" ||
      fields.status === "retrying" ? (
      <Text
        as="span"
        variant="caption"
        tone="secondary"
        role="status"
        aria-live="polite"
      >
        {COPY.savingOnThisDevice}
      </Text>
    ) : (
      <SaveStatusText status={fields.status} />
    );

  return (
    <>
      {prompts.map((prompt) => (
        <Textarea
          key={prompt.key}
          ref={prompt.key === focusKey ? focusRef : undefined}
          variant="plain"
          label={prompt.label}
          value={fields.answers[prompt.key] ?? ""}
          maxLength={JOURNAL_ANSWER_MAX}
          classes={{ textarea: SERIF }}
          onChange={(event) => fields.onChange(prompt.key, event.target.value)}
          onBlur={() => fields.onBlur(prompt.key)}
        />
      ))}

      <div className="-mt-(--space-3) min-h-5">{statusWord}</div>

      {/* v1.3 R54, §7.2 (DAY-12): the morning's quote, once the last line is written. */}
      {allAnswered && quote !== null ? (
        <figure className="m-0 flex flex-col gap-(--space-2) border-t border-hairline pt-(--space-4)">
          <Text as="span" variant="caption" tone="secondary">
            {COPY.aQuote}
          </Text>
          <blockquote className={`m-0 ${SERIF}`}>
            {COPY.quoted(quote.text)}
          </blockquote>
          <figcaption>
            <Text as="span" variant="caption" tone="secondary">
              {quote.attribution}
            </Text>
          </figcaption>
        </figure>
      ) : null}

      {peek === null ? null : (
        <Card className="flex-row items-center justify-between gap-(--space-3) bg-transparent">
          <div className="flex min-w-0 flex-col gap-0.5">
            <Text as="span" variant="caption" tone="secondary">
              {COPY.tomorrow}
            </Text>
            <Text as="p" variant="body" className="font-semibold">
              {COPY.peek(peek)}
            </Text>
          </div>
          <Link
            href={kept(scheduleDateRoute(dateKey))}
            aria-label={COPY.seeItLabel}
            className="inline-flex min-h-(--target) min-w-(--target) shrink-0 items-center justify-end text-(length:--fs-label) font-semibold text-ink underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {COPY.seeIt}
          </Link>
        </Card>
      )}
    </>
  );
}

/** A past day from Review: each written answer as serif text under its prompt. */
function JournalReading({ records }: { records: JournalRecords }) {
  const answers = records.entry?.answers ?? {};
  const written = records.prompts.filter(
    (prompt) => (answers[prompt.key] ?? "").trim() !== "",
  );
  if (written.length === 0) {
    return (
      <Text as="p" variant="body" tone="secondary">
        {COPY.nothingWritten}
      </Text>
    );
  }
  return (
    <div className="flex flex-col">
      {written.map((prompt) => (
        <figure
          key={prompt.key}
          className="m-0 flex flex-col gap-(--space-2) border-b border-hairline py-(--space-4) first:pt-0"
        >
          <figcaption>
            <Text as="span" variant="caption" tone="secondary">
              {prompt.label}
            </Text>
          </figcaption>
          <blockquote className={`m-0 whitespace-pre-wrap ${SERIF}`}>
            {answers[prompt.key]}
          </blockquote>
        </figure>
      ))}
    </div>
  );
}
