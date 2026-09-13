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
 */
export function LandscapeSheet({
  open,
  onOpenChange,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded?: (created: number) => void;
}) {
  const online = useOnline();
  const landscape = useLandscape({ withTemplate: false });
  const pending = landscape.ticked.size;

  return (
    <SheetHost open={open}>
      <ResponsiveSheet
        open={open}
        onOpenChange={onOpenChange}
        title={COPY.sheetTitle}
        size="tall"
        footer={
          <div className="flex justify-end gap-(--space-2)">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {COPY.cancel}
            </Button>
            <Button
              disabled={!online || pending === 0}
              busy={landscape.committing}
              onClick={() => {
                void landscape.commit().then((result) => {
                  onAdded?.(result.created);
                  onOpenChange(false);
                });
              }}
            >
              {COPY.add(pending)}
            </Button>
          </div>
        }
      >
        <LandscapeChooser landscape={landscape} disabled={!online} />
      </ResponsiveSheet>
    </SheetHost>
  );
}
