import { cn, MeetingIcon, Tag, Text } from "@syn/ui";
import { HUE_CHIP, HUE_DOT } from "@/components/planner/block-hue";

/**
 * MeetingBand — a meeting ahead inside the Work block, in the phone's flow
 * (USE-62; meeting-coming-up.md, the meeting-inside-a-work-block dev note):
 * a plum fill with its 3 px edge and the calendar icon (D-USE-38: an event
 * is always a fill with the icon), the name with its Work or Personal Tag so
 * colour is never alone, "10:30 to 11:00 · the work below waits until 11:00"
 * under it and "in 10 min" at the trailing edge. It sits where the plan
 * reaches its time, between rows, and splits nothing.
 *
 * Not a control: one name, "<meeting>, 10:30 to 11:00, in 10 min", read as a
 * note (words-and-access.md). Props only.
 */
export interface MeetingBandProps {
  title: string;
  /** "Work" or "Personal". */
  tag: string;
  /** "10:30 to 11:00 · the work below waits until 11:00". */
  line: string;
  /** "in 10 min". */
  lead: string;
  /** The band's one name. */
  name: string;
  className?: string;
}

export function MeetingBand({
  title,
  tag,
  line,
  lead,
  name,
  className,
}: MeetingBandProps) {
  return (
    <div
      role="note"
      aria-label={name}
      data-meeting-band
      className={cn(
        "relative my-(--space-2) flex min-h-13 items-center gap-(--space-2) overflow-hidden rounded-(--radius-control) py-(--space-2) ps-(--space-3) pe-(--space-3)",
        HUE_CHIP.plum,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("absolute inset-y-0 start-0 w-0.75", HUE_DOT.plum)}
      />
      <span
        aria-hidden="true"
        className="flex w-5 shrink-0 items-center justify-center"
      >
        <MeetingIcon className="size-3.5" />
      </span>
      <div aria-hidden="true" className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-(--space-2)">
          <Text as="span" variant="secondary" weight={600} truncate>
            {title}
          </Text>
          <MeetingTag>{tag}</MeetingTag>
        </div>
        <Text as="p" variant="caption" tone="muted" className="tabular-nums">
          {line}
        </Text>
      </div>
      <Text
        as="span"
        aria-hidden="true"
        variant="secondary"
        weight={600}
        className="shrink-0 tabular-nums"
      >
        {lead}
      </Text>
    </div>
  );
}

/** The Work or Personal word in its hairline box: the meaning is the word. */
export function MeetingTag({ children }: { children: string }) {
  return (
    <Tag className="border-border rounded-(--radius-control) border px-(--space-1)">
      {children}
    </Tag>
  );
}
