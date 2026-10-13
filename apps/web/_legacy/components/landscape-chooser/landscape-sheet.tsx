"use client";

import { Button, ResponsiveSheet } from "@syn/ui";

import { SheetHost } from "@/components/page-frame";
import { useOnline } from "@/lib/hooks/use-online";

import { LANDSCAPE_COPY as COPY } from "./copy";
import { LandscapeChooser } from "./landscape-chooser";
import { useLandscape } from "./use-landscape";

/**
 * The landscape as the library's door — LB-01's empty state (UX v1.1 §4.15
 * folds the v1.0 starter set into the per-block library). Habits only: the
 * library is not the place to build a routine, so no template is written
 * here; Settings → Your day → Morning routine is.
 *
 * Under v1.2 (RUN-10) a tick creates at once, so the footer is *Done* — the
 * ticks have already happened.
 */
export function LandscapeSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const online = useOnline();
  const landscape = useLandscape({ withTemplate: false });

  return (
    <SheetHost open={open}>
      <ResponsiveSheet
        open={open}
        onOpenChange={onOpenChange}
        title={COPY.sheetTitle}
        size="tall"
        footer={
          <div className="flex justify-end gap-(--space-2)">
            <Button onClick={() => onOpenChange(false)}>{COPY.done}</Button>
          </div>
        }
      >
        <LandscapeChooser landscape={landscape} disabled={!online} />
      </ResponsiveSheet>
    </SheetHost>
  );
}
