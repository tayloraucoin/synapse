/**
 * The drawn marks where Lucide has no glyph for the control (USE-83): the
 * phone with an arrow down (the menu's "Install the app" and Android's step
 * 2), Chrome's outlined Install pill, and iOS's switch, on. Decorative: the
 * words beside each name the control. Strokes and fills are `currentColor`,
 * so they take the tile's ink.
 */
import type * as React from "react";

type MarkProps = React.SVGProps<SVGSVGElement>;

function Mark({ children, ...props }: MarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

/** A phone outline with an arrow down inside it. */
export function PhoneArrowDownMark(props: MarkProps) {
  return (
    <Mark {...props}>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M12 7v7" />
      <path d="m9 11 3 3 3-3" />
    </Mark>
  );
}

/** Chrome's Install control: an outlined rounded pill with an arrow down. */
export function InstallPillMark(props: MarkProps) {
  return (
    <Mark viewBox="0 0 24 14" {...props}>
      <rect x="1" y="1" width="22" height="12" rx="6" />
      <path d="M12 3.5v6" />
      <path d="m9.5 7.5 2.5 2.5 2.5-2.5" />
    </Mark>
  );
}

/** iOS's switch, on: an ink track with the knob to the right. */
export function SwitchOnMark(props: MarkProps) {
  return (
    <Mark viewBox="0 0 24 14" stroke="none" {...props}>
      <rect x="0" y="0" width="24" height="14" rx="7" fill="currentColor" />
      <circle cx="17" cy="7" r="5" className="fill-background" />
    </Mark>
  );
}
