import { cn, GroupHeading, MeetingIcon, Text } from "@syn/ui";
import { HUE_CHIP, HUE_DOT } from "@/components/planner/block-hue";
import { MeetingTag } from "./meeting-band";

/**
 * LiftedMeeting — a meeting at its time inside the Work block (USE-62;
 * meeting-lifted.md, D-USE-65). One part at both widths:
 *
 * - `card`, on the phone: under its "At 11:00" heading, ahead of the tiers,
 *   shaded as the lifted card, the calendar icon in its plum tile, the name
 *   with its Tag and "Meeting · 11:00 to 11:15". The lifted work item goes
 *   back to its row; nothing running or firing stops.
 * - `row`, at the desk: one row under the Work band, its plum edge and icon,
 *   the name, the Tag and the same meta; the tiers below are unchanged.
 *
 * [ASSUMPTION] No Start or Done yet: a day event keeps no timer or done
 * record, so the lift ends when its time passes. Props only.
 */
export interface LiftedMeetingProps {
  variant: "card" | "row";
  title: string;
  /** "Work" or "Personal". */
  tag: string;
  /** "Meeting · 11:00 to 11:15". */
  meta: string;
  /** "At 11:00": the card's heading. */
  heading: string;
  headingAs?: "h2" | "h3";
  className?: string;
}

export function LiftedMeeting({
  variant,
  title,
  tag,
  meta,
  heading,
  headingAs = "h3",
  className,
}: LiftedMeetingProps) {
  if (variant === "row") {
    return (
      <div
        data-lifted-meeting
        className={cn(
          "relative flex min-h-(--target) items-center gap-(--space-3) overflow-hidden rounded-(--radius-control) py-(--space-2) ps-(--space-4) pe-(--space-3)",
          HUE_CHIP.plum,
          className,
        )}
      >
        <span
          aria-hidden="true"
          className={cn("absolute inset-y-0 start-0 w-0.75", HUE_DOT.plum)}
        />
        <MeetingIcon aria-hidden="true" className="size-4 shrink-0" />
        <Text as="span" variant="body" weight={500} truncate>
          {title}
        </Text>
        <MeetingTag>{tag}</MeetingTag>
        <Text
          as="span"
          variant="secondary"
          tone="muted"
          className="ms-auto shrink-0 tabular-nums"
        >
          {meta}
        </Text>
      </div>
    );
  }

  return (
    <section data-lifted-meeting aria-label={heading} className={className}>
      <GroupHeading as={headingAs}>{heading}</GroupHeading>
      <div className="bg-surface flex items-start gap-(--space-3) rounded-(--radius-sheet) p-(--space-4)">
        <span
          aria-hidden="true"
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-(--radius-control)",
            HUE_CHIP.plum,
          )}
        >
          <MeetingIcon className="size-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-(--space-2)">
            <Text as="span" variant="heading" weight={500} truncate>
              {title}
            </Text>
            <MeetingTag>{tag}</MeetingTag>
          </div>
          <Text
            as="p"
            variant="caption"
            tone="muted"
            className="pt-(--space-1) tabular-nums"
          >
            {meta}
          </Text>
        </div>
      </div>
    </section>
  );
}
