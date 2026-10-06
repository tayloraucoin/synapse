"use client";

import * as React from "react";

import { GroupHeading } from "@syn/ui";

import { FactScreen } from "@/app/(setup)/_components/fact-screen";
import { DAY_BUILDER_COPY } from "@/components/day-builder";
import { ScreenFreeTimeLandscape } from "@/components/day-builder/screens/b15a-free-time-landscape";
import { ScreenFreeTimeRanked } from "@/components/day-builder/screens/b15b-free-time-ranked";
import { useOnline } from "@/lib/hooks/use-online";

/**
 * Settings → Your day → *Free-time activities* — UX v1.3 §4.6 (DAY-12): the
 * builder's B15a and B15b on one page, without the sequence — the landscape
 * in five groups, then how much each matters. Every tick and square writes
 * as it goes; *Save* only returns to the list.
 */
export function FreeTimeScreen({ onSaved }: { onSaved: () => void }) {
  const online = useOnline();
  const noop = React.useCallback(() => undefined, []);
  return (
    <FactScreen
      step={4}
      heading={DAY_BUILDER_COPY.b15a.heading}
      body={DAY_BUILDER_COPY.b15a.body}
      save={null}
      embedded
      onSaved={onSaved}
    >
      <div className="flex flex-col gap-(--space-6)">
        <ScreenFreeTimeLandscape disabled={!online} onCount={noop} />
        <section className="flex flex-col gap-(--space-3)">
          <GroupHeading>{DAY_BUILDER_COPY.b15b.heading}</GroupHeading>
          <ScreenFreeTimeRanked />
        </section>
      </div>
    </FactScreen>
  );
}
