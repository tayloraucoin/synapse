/**
 * TrustLine — the one privacy sentence (v2 handoff §5.5).
 *
 * The text is fixed and comes from `copy.ts`; there is no `children`, because
 * a trust line that can be reworded per screen is not a promise.
 */
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Caption } from "../../../primitives/typography/text";
import { TRUST_LINE_COPY } from "./copy";

export interface TrustLineProps {
  className?: string;
}

export function TrustLine({ className }: TrustLineProps) {
  return (
    <Caption as="p" className={cn("max-w-(--measure)", className)}>
      {TRUST_LINE_COPY.text}
    </Caption>
  );
}
