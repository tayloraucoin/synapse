"use client";

import * as React from "react";

import { HelperText, SaveStatusText, Text, Textarea } from "@syn/ui";
import { JOURNAL_ANSWER_MAX } from "@syn/constants";

import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { JOURNAL_COPY as COPY } from "./copy";
import { useJournal, type JournalEntry } from "./use-journal";

/**
 * The journal — UX v1.1 §7.2 (DYN-18): "A few lines in the person's own
 * words — where they want to be, not what happened — so the morning has
 * something true to read back."
 *
 * Paper, one column. The person's prompts in order, each a caption over a
 * serif field that starts at one row and grows. Every field autosaves; the
 * status says *saved* in caption size and nothing louder. No finish button,
 * no word count, no timer, no ceremony. The back is the exit and always
 * works. A past day opened from Review is read-only: the answers as serif
 * text under their captions with hairlines.
 *
 * UX v1.3 R54, §7.2 (DAY-12): when the last prompt has its answer, on a
 * quote-day with the bank on, the morning's quote closes the page — in
 * Newsreader, in quotation marks, its attribution as a caption, under *A
 * quote*. The app's own voice never appears around it.
 */
export function JournalScreen({ initial, readOnly = false }: { initial: JournalEntry; readOnly?: boolean }) {
  const online = useOnline();
  const journal = useJournal(initial);
  // The quote is the morning's (DAY-6's `readJournalClose`): nothing about the entry chooses it.
  const close = trpc.journal.close.useQuery({ date: initial.date }, { enabled: !readOnly });
  const quote = close.data?.quote ?? null;
  const allAnswered =
    initial.prompts.length > 0 && initial.prompts.every((prompt) => (journal.answers[prompt.key] ?? "").trim() !== "");

  if (readOnly) {
    const written = initial.prompts.filter((prompt) => (initial.answers[prompt.key] ?? "").trim() !== "");
    return (
      <div className="flex flex-col">
        {written.length === 0 ? (
          <p className="font-serif text-(length:--fs-body) leading-relaxed text-text-secondary">{COPY.nothingWritten}</p>
        ) : (
          written.map((prompt) => (
            <figure key={prompt.key} className="border-hairline flex flex-col gap-(--space-2) border-t py-(--space-4)">
              <figcaption>
                <Text as="span" variant="caption" tone="secondary">
                  {prompt.label}
                </Text>
              </figcaption>
              <blockquote className="font-serif text-(length:--fs-body) leading-relaxed whitespace-pre-wrap">
                {initial.answers[prompt.key]}
              </blockquote>
            </figure>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-(--space-5)">
      {initial.prompts.map((prompt) => (
        <Textarea
          key={prompt.key}
          variant="serif"
          label={prompt.label}
          value={journal.answers[prompt.key] ?? ""}
          maxLength={JOURNAL_ANSWER_MAX}
          onChange={(event) => journal.onChange(prompt.key, event.target.value)}
          onBlur={() => journal.onBlur(prompt.key)}
        />
      ))}
      {/* v1.3 R54, §7.2 (DAY-12): the morning's quote, once the last line is written — the day opens and closes on one line. */}
      {allAnswered && quote !== null ? (
        <figure className="border-hairline m-0 flex flex-col gap-(--space-2) border-t pt-(--space-4)">
          <Text as="span" variant="caption" tone="secondary">
            {COPY.aQuote}
          </Text>
          <blockquote className="m-0 font-serif text-(length:--fs-body) leading-relaxed">
            {COPY.quoted(quote.text)}
          </blockquote>
          <figcaption>
            <Text as="span" variant="caption" tone="secondary">
              {quote.attribution}
            </Text>
          </figcaption>
        </figure>
      ) : null}

      <div className="flex items-center justify-end">
        {journal.status === "retrying" ? (
          <Text as="span" variant="caption" tone="secondary" role="status">
            {COPY.savingOnThisDevice}
          </Text>
        ) : (
          <SaveStatusText status={journal.status} />
        )}
      </div>
      {!online ? <HelperText>{COPY.offline}</HelperText> : null}
    </div>
  );
}
