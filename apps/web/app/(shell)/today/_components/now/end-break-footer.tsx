"use client";

import { Button } from "@syn/ui";
import { NOW_COPY as COPY } from "./copy";

/**
 * End break (USE-20; now/states/empty-break.md, D-USE-74): an empty Break
 * holds nothing to do, so End break stands in Done's place, full width, ink,
 * on the fade above the tabs (D-USE-25). It opens the next block on Now
 * with no close card.
 */
export function EndBreakFooter({ onEnd }: { onEnd: () => void }) {
  return (
    <div className="to-background sticky bottom-[calc(var(--tabbar-h)+env(safe-area-inset-bottom))] mt-auto bg-linear-to-b from-transparent pt-(--space-8) pb-(--space-3)">
      <Button size="lg" className="w-full font-semibold" onClick={onEnd}>
        {COPY.endBreak}
      </Button>
    </div>
  );
}
