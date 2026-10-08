/**
 * ScreenFrame — the standard padding and width wrapper (v2 handoff §5.2).
 *
 * Built new: CC's `Section` is a marketing band with vertical rhythm this
 * product does not use. Three widths, each a surface's, not a screen's:
 * `text` (720px) and `canvas` (960px) for the habit day, and `board` — no
 * max-width, the canvas's padding — for Workflow's board alone (Workflow UX
 * v0.1 §3.1, §0.4; TD-44), which takes the whole content area beside the rail
 * and scrolls sideways in its own region. A width per screen would still be a
 * decision made per screen, and screens that disagree about their measure
 * read as different applications.
 *
 * Left-aligned on wide rather than centred: the rail is on the left, and
 * content that centres itself in the remaining space drifts away from the
 * navigation a person just used.
 */
import * as React from "react";

import { cn } from "../../../lib/cn";

export interface ScreenFrameProps extends React.ComponentProps<"div"> {
  width?: "text" | "canvas" | "board";
  /** 16px compact / 32px wide. */
  padded?: boolean;
  /** Caps line length at 64ch for reading surfaces. */
  prose?: boolean;
}

export function ScreenFrame({
  width = "text",
  padded = true,
  prose = false,
  className,
  children,
  ...props
}: ScreenFrameProps) {
  return (
    <div
      className={cn(
        "w-full",
        width === "text" && "max-w-(--content-text)",
        width === "canvas" && "max-w-(--content-canvas)",
        // `board` has no cap; `min-w-0` lets the board's own region scroll sideways.
        width === "board" && "min-w-0",
        padded && "px-(--space-4) py-(--space-4) wide:px-(--space-6) wide:py-(--space-6)",
        prose && "[&_p]:max-w-(--measure)",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
