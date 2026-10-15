"use client";

import { Text } from "@syn/ui";

/**
 * NotSavedLine — a check that did not save, online (USE-21; error on check):
 * "Not saved." and an underlined "Try again", both in ink, under the row or
 * the card it belongs to. Never red, no icon, no Toaster. Props only; the
 * caller places it (a row's `below`, under a card's buttons).
 */
export interface NotSavedLineProps {
  words: { notSaved: string; tryAgain: string };
  onRetry: () => void;
}

export function NotSavedLine({ words, onRetry }: NotSavedLineProps) {
  return (
    <p role="status" className="flex items-center gap-(--space-2)">
      <Text as="span" variant="secondary" tone="ink">
        {words.notSaved}
      </Text>
      <button
        type="button"
        onClick={onRetry}
        className="text-ink focus-visible:ring-ring min-h-(--target) cursor-pointer text-(length:--fs-secondary) font-medium underline underline-offset-2 focus-visible:ring-2 focus-visible:outline-none"
      >
        {words.tryAgain}
      </button>
    </p>
  );
}
