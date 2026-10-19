"use client";

import {
  createElement,
  Fragment,
  useCallback,
  type CSSProperties,
} from "react";
import { UNDO_SHORT_MS } from "@syn/constants";
import { toast, Toaster } from "@syn/ui";

/**
 * The house Toaster above a screen's floating primary (USE-37; D-USE-25):
 * Review the day's "Swapped for Yoga. Training ends 8:50." with Undo, above
 * Ready, go. `AboveFooterToaster` sits in the footer's slot and anchors the
 * Toaster to it; `useUndoToast()` shows one toast there. Later screens with
 * a floating primary reuse both.
 *
 * Sonner's toaster is `position: fixed`; the slot sets `contain: layout`,
 * which makes the slot its containing block, so the toast sits on the slot
 * (just above the button) at the slot's width, wherever the footer is.
 * One at a time, no icons, announced politely and Undo reachable by
 * keyboard: the house Toaster's own settings.
 */

export const ABOVE_FOOTER_TOASTER = "above-footer";

/** The gap between the toast and the button under it. */
const GAP = "var(--space-3)";
const EDGES = { bottom: GAP, left: 0, right: 0 };

export function AboveFooterToaster() {
  return createElement(
    "div",
    { "data-toaster-slot": "", className: "relative h-0 contain-layout" },
    createElement(Toaster, {
      id: ABOVE_FOOTER_TOASTER,
      position: "bottom-right",
      offset: EDGES,
      mobileOffset: EDGES,
      style: { "--width": "100%" } as CSSProperties,
    }),
  );
}

export interface UndoToast {
  /** What happened, in the past tense: "Swapped for Yoga. Training ends 8:50." */
  text: string;
  onUndo: () => void;
  /** The house short window by default; `Infinity` holds it (a staged capture). */
  durationMs?: number;
  /** Words after "Undo" for assistive tech only: "Undo copy" (USE-45). */
  undoOf?: string;
}

export function useUndoToast() {
  return useCallback(
    ({ text, onUndo, durationMs = UNDO_SHORT_MS, undoOf }: UndoToast) =>
      toast(text, {
        toasterId: ABOVE_FOOTER_TOASTER,
        duration: durationMs,
        action: {
          label:
            undoOf === undefined
              ? "Undo"
              : createElement(
                  Fragment,
                  null,
                  "Undo",
                  createElement("span", { className: "sr-only" }, ` ${undoOf}`),
                ),
          onClick: onUndo,
        },
      }),
    [],
  );
}
