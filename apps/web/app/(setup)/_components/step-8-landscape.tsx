"use client";

import * as React from "react";

import { LandscapeChooser, useLandscape } from "@/components/landscape-chooser";
import { useOnline } from "@/lib/hooks/use-online";

import { SETUP_COPY as COPY } from "./copy";
import { FactScreen } from "./fact-screen";

/**
 * Screen 8 — Your routine, the whole landscape (UX v1.2 §4.8; RUN-10).
 *
 * "Everything. It doesn't have to fit." Two tabs, every row a `SelectRow`
 * with its glyph; a tick creates the habit and its morning slot at once
 * (R30), a second tap un-ticks. *Continue · n habits* only navigates. No
 * arithmetic on this screen, by rule — the ranking is screen 9's.
 */
export function Step8Landscape({
  embedded = false,
  bare = false,
  onSaved,
  onCountChange,
}: {
  embedded?: boolean;
  /** Inside the day builder's frame as B9 (DAY-10): the content alone. */
  bare?: boolean;
  onSaved?: () => void;
  /** B9's primary — *Next · 9 habits*. */
  onCountChange?: (count: number) => void;
}) {
  const online = useOnline();
  const landscape = useLandscape({ withTemplate: true });

  React.useEffect(() => {
    onCountChange?.(landscape.count);
  }, [landscape.count, onCountChange]);

  return (
    <FactScreen
      step={8}
      heading={COPY.step8Heading}
      body={COPY.step8Body}
      save={null}
      primaryLabel={COPY.continueHabits(landscape.count)}
      embedded={embedded}
      bare={bare}
      onSaved={onSaved}
    >
      <LandscapeChooser landscape={landscape} disabled={!online} />
    </FactScreen>
  );
}
