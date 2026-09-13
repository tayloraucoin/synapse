"use client";

import * as React from "react";

import { HelperText, SaveStatusText, Text, Textarea } from "@syn/ui";
import { JOURNAL_ANSWER_MAX } from "@syn/constants";

import { useOnline } from "@/lib/hooks/use-online";

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
 */
export function JournalScreen({ initial, readOnly = false }: { initial: JournalEntry; readOnly?: boolean }) {
  const online = useOnline();
  const journal = useJournal(initial);

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
