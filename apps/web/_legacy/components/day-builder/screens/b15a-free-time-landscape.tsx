"use client";

import * as React from "react";

import { LandscapeChooser, useLandscape } from "@/components/landscape-chooser";
import { useOnline } from "@/lib/hooks/use-online";

/**
 * B15a — free time, the landscape (UX v1.3 §4.4 B15, R50, §12.4; DAY-11) — a
 * PROFILE screen, on the first plan only.
 *
 * The morning's chooser with `blockKind: "activity"`: *Recommended* under
 * *Move · Rest*, *All* under *Move · Make · Connect · Rest · Tend* and the
 * person's own; a tick creates the activity (`block_kind: activity`) and its
 * slot on free time's landscape template, whose minutes B15b's cards and
 * B16's *usually* read. *Add your own* opens *A free-time activity*.
 * Nothing preselected; nothing counted, ranked across days or said about
 * last night.
 */
export function ScreenFreeTimeLandscape({ disabled, onCount }: { disabled: boolean; onCount: (count: number) => void }) {
  const online = useOnline();
  const landscape = useLandscape({ withTemplate: true, blockKind: "activity" });

  React.useEffect(() => {
    onCount(landscape.count);
  }, [landscape.count, onCount]);

  return <LandscapeChooser landscape={landscape} disabled={disabled || !online} />;
}
