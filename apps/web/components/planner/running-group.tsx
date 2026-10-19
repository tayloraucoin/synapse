import type * as React from "react";
import { GroupHeading } from "@syn/ui";

/**
 * RunningGroup — "Running" at the top of a non-work block when several run
 * (USE-24; D-USE-27): the card in focus, then the other items as
 * `RunningRow`s. A Work block never renders it (D-USE-43, D-USE-49).
 * Props only.
 */
export interface RunningGroupProps {
  heading: string;
  /** The running card, when the item in focus runs. */
  card: React.ReactNode;
  children: React.ReactNode;
}

export function RunningGroup({ heading, card, children }: RunningGroupProps) {
  return (
    <section aria-label={heading} data-running-group="">
      <GroupHeading as="h3" className="pt-(--space-2)">
        {heading}
      </GroupHeading>
      {card ? <div className="pb-(--space-2)">{card}</div> : null}
      <div>{children}</div>
    </section>
  );
}
