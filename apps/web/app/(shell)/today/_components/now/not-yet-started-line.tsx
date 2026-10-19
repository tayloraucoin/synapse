import { Text } from "@syn/ui";

/**
 * Under the block's header when Ready, go came before its time (USE-110;
 * ready-go/states/not-yet-started.md): a hollow verdigris dot and
 * "Starts at 7:05. Anything can be done early.", caption, muted. It reports
 * no lateness and leaves at the block's time, when the card's dot fills.
 */
export function NotYetStartedLine({ words }: { words: string }) {
  return (
    <p
      data-not-yet-started
      className="flex items-center gap-(--space-2) pb-(--space-2)"
    >
      <span
        aria-hidden="true"
        className="border-accent-mark size-2 shrink-0 rounded-full border"
      />
      <Text as="span" variant="caption" tone="muted" className="tabular-nums">
        {words}
      </Text>
    </p>
  );
}
