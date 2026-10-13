import type { BlockFlow, BlockKind } from "@syn/types";
import { clockToMinutes } from "@syn/utils";

/**
 * Which minute a block template is laid out from — UX v1.1 §3.1, §3.3, §11.4
 * (TD-1). A template no longer carries its own anchor; the PROFILE does, and
 * which profile time depends on the kind:
 *
 *   orient · morning ...... forward from the usual wake
 *   prep .................. backward to work start
 *   work .................. forward from work start (or the template's own
 *                            `anchor_time`, the one override v1.1 R5 allows)
 *   transition · activity . forward from work end (v1.3 TD-25; the
 *                            materialiser stacks free time after the
 *                            transition — DAY-6)
 *   wind_down ............. backward to lights-out
 *   training · break ...... placed each morning — no anchor at planning time
 *
 * Used by the editor's read model (`toTemplateView`) to derive `startClock`
 * for each slot; DYN-5's materialiser chains the same anchors through a whole
 * day, where one block's end is the next one's start. Both read the profile
 * through `readPreferences`, never `users` directly.
 */

export type AnchorProfile = {
  usualWakeTime: string;
  workStartTime: string | null;
  workEndTime: string | null;
  lightsOutTime: string | null;
};

export type TemplateAnchor = {
  flow: BlockFlow;
  /** Minutes from midnight, or null when the kind is placed per day. */
  anchorMin: number | null;
};

/** The flow a kind has by nature; the row's `flow` column agrees by default. */
export function defaultFlowFor(kind: BlockKind): BlockFlow {
  return kind === "prep" || kind === "wind_down" ? "backward" : "forward";
}

export function resolveTemplateAnchor(
  kind: BlockKind,
  flow: BlockFlow,
  profile: AnchorProfile,
  templateAnchorTime: string | null,
): TemplateAnchor {
  const minutes = (clock: string | null): number | null =>
    clock === null ? null : clockToMinutes(clock);

  switch (kind) {
    case "orient":
    case "morning":
      return { flow, anchorMin: minutes(profile.usualWakeTime) };
    case "prep":
      return { flow, anchorMin: minutes(profile.workStartTime) };
    case "work":
      return {
        flow,
        anchorMin: minutes(templateAnchorTime ?? profile.workStartTime),
      };
    // UX v1.3 TD-25: after work flows forward from the end of work; free time follows it.
    case "transition":
    case "activity":
      return { flow, anchorMin: minutes(profile.workEndTime) };
    case "wind_down":
      return { flow, anchorMin: minutes(profile.lightsOutTime) };
    case "training":
    case "break":
      return { flow, anchorMin: null };
  }
}
