/**
 * Avatar — the account mark: the header button (28px), the rail footer, the
 * avatar menu's Who (40px) and the Profile sheet (96px, USE-84). Official spec §9.8; USE's
 * account (D-USE-37, N2).
 *
 * There are no status dots, no presence, and no group — Synapse is a
 * single-player product, and there is no one to be present to. The CLI's
 * `AvatarBadge`, `AvatarGroup`, and `AvatarGroupCount` are dropped rather than
 * kept unused: an exported part is an invitation.
 *
 * ROUND, as the account boards draw it (avatar-menu, D-USE-37): the mark is
 * the one round thing beside the dots.
 *
 * FALLBACK: the name's first letter, upper case, in ink ON PAPER with a
 * hairline (C-USE-avatar-menu-no-photo-1) — never on a colour. The fallback
 * is the default state, not an error state: most accounts never upload one.
 *
 * NO REFLOW: the root reserves its size and clips, so the image swapping in
 * over the initial changes pixels inside a fixed box and moves nothing around
 * it. `delayMs={0}` on the fallback keeps the initial on screen from the
 * first frame rather than flashing empty while the image decides.
 */
"use client";

import * as React from "react";
import { Avatar as AvatarPrimitive } from "radix-ui";

import { cn } from "../../../lib/cn";

export type AvatarSize = 28 | 32 | 40 | 64 | 96;

const SIZE_CLASS: Record<AvatarSize, string> = {
  28: "size-7 text-(length:--fs-caption)",
  32: "size-8 text-(length:--fs-caption)",
  40: "size-10 text-(length:--fs-body)",
  64: "size-16 text-(length:--fs-title)",
  96: "size-24 text-(length:--fs-review-title)",
};

/** The name's first letter, upper case; nothing for an empty name. */
export function avatarInitial(name: string): string {
  return name.trim().charAt(0).toLocaleUpperCase();
}

export interface AvatarProps
  extends Omit<React.ComponentProps<typeof AvatarPrimitive.Root>, "children"> {
  /** The image URL. Omit for the initials fallback. */
  src?: string | null;
  /** The account's display name — the initials and the label come from it. */
  name: string;
  size?: AvatarSize;
  /** Overrides the accessible name. Defaults to the display name. */
  label?: string;
  /** Inside a control that names itself: the mark is read as nothing. */
  decorative?: boolean;
}

function Avatar({
  className,
  src,
  name,
  size = 32,
  label,
  decorative = false,
  ...props
}: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "relative flex shrink-0 select-none overflow-hidden rounded-full",
        SIZE_CLASS[size],
        className,
      )}
      {...props}
    >
      {src ? (
        <AvatarPrimitive.Image
          data-slot="avatar-image"
          src={src}
          alt={decorative ? "" : (label ?? name)}
          className="aspect-square size-full object-cover"
        />
      ) : null}
      <AvatarPrimitive.Fallback
        data-slot="avatar-fallback"
        delayMs={0}
        aria-label={decorative ? undefined : (label ?? name)}
        aria-hidden={decorative ? true : undefined}
        className={cn(
          "flex size-full items-center justify-center rounded-full",
          "bg-background text-foreground border-hairline border",
          "font-sans font-medium",
        )}
      >
        {avatarInitial(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

export { Avatar };
