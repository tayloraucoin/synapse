"use client";

import { LandscapeChooser, useLandscape } from "@/components/landscape-chooser";
import { useOnline } from "@/lib/hooks/use-online";

import { SETUP_COPY as COPY } from "./copy";
import { FactScreen } from "./fact-screen";

/**
 * Screen 8 — Your routine, the whole landscape (UX v1.1 §4.8).
 *
 * "Everything. It doesn't have to fit." The chooser holds the ticks; *Continue
 * · n habits* is the single commit (W4): the habits, then the morning
 * template's slots in priority order. No footer arithmetic on this screen,
 * by rule — the fit is screen 12's.
 */
export function Step8Landscape({
  embedded = false,
  onSaved,
}: {
  embedded?: boolean;
  onSaved?: () => void;
}) {
  const online = useOnline();
  const landscape = useLandscape({ withTemplate: true });

  return (
    <FactScreen
      step={8}
      heading={COPY.step8Heading}
      body={COPY.step8Body}
      save={landscape.ticked.size === 0 && !landscape.selected.some((row) => row.existing)
        ? null
        : async () => {
            await landscape.commit();
          }}
      primaryLabel={COPY.continueHabits(landscape.count)}
      disabled={landscape.committing}
      embedded={embedded}
      onSaved={onSaved}
    >
      <LandscapeChooser landscape={landscape} disabled={!online} />
    </FactScreen>
  );
}
