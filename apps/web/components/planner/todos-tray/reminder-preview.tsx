import { Text } from "@syn/ui";
import { REMINDER_PREVIEW_COPY as COPY } from "./copy";
import { todoReminderPayload } from "./reminder";

/**
 * ReminderPreview — a to-do reminder as the phone's lock screen shows it
 * (notification.md). Not an app screen: the OS draws it and Synapse sets
 * only its words, so this is a preview frame for `/dev/parts`. One card:
 * the app's mark, "Synapse", "now", and the to-do's title, nothing added.
 */
export interface ReminderPreviewProps {
  todo: { id: string; title: string };
  /** The lock screen's date line: "Monday 12 October". */
  dateLabel: string;
  /** The lock screen's clock: "10:00". */
  clock: string;
}

export function ReminderPreview({
  todo,
  dateLabel,
  clock,
}: ReminderPreviewProps) {
  const payload = todoReminderPayload(todo);
  return (
    <section
      aria-label={COPY.region}
      className="bg-fill-muted flex min-h-dvh w-full flex-col items-center px-(--space-4) pt-(--space-12) pb-(--space-12)"
    >
      <Text as="p" variant="body" weight={500}>
        {dateLabel}
      </Text>
      <Text
        as="p"
        weight={500}
        className="text-(length:--fs-timer) leading-none tabular-nums"
      >
        {clock}
      </Text>
      <div className="bg-paper mt-auto flex w-full items-start gap-(--space-3) rounded-(--radius-sheet) p-(--space-3)">
        <span
          aria-hidden="true"
          className="bg-ink flex size-9 shrink-0 items-center justify-center rounded-(--radius-sheet)"
        >
          <span className="bg-now size-2 rounded-full" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-baseline justify-between gap-(--space-2)">
            <Text as="span" variant="secondary" weight={600}>
              {payload.title}
            </Text>
            <Text as="span" variant="caption" tone="muted">
              {COPY.when}
            </Text>
          </div>
          <Text as="p" variant="secondary">
            {payload.body}
          </Text>
        </div>
      </div>
    </section>
  );
}
