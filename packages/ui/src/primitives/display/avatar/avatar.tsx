/**
 * Avatar — the account mark, in exactly two places: the header button (32px)
 * and Settings → Account (64px). Official spec §9.8.
 *
 * There are no status dots, no rings, no presence, and no group — Synapse is a
 * single-player product, and there is no one to be present to. The CLI's
 * `AvatarBadge`, `AvatarGroup`, and `AvatarGroupCount` are dropped rather than
 * kept unused: an exported part is an invitation.
 *
 * FALLBACK: up to two initials from `@syn/utils`' `getInitials`, in Geist 500
 * on neutral-200 (neutral-700 in dark). The fallback is the default state, not
 * an error state — most accounts never upload an image.
 *
 * NO REFLOW: the root reserves its size and clips, so the image swapping in
 * over the initials changes pixels inside a fixed box and moves nothing around
 * it. `delayMs={0}` on the fallback keeps the initials on screen from the
 * first frame rather than flashing empty while the image decides.
 */
"use client";

import * as React from "react";
import { Avatar as AvatarPrimitive } from "radix-ui";

import { getInitials } from "@syn/utils";

import { cn } from "../../../lib/cn";

export type AvatarSize = 32 | 64;

export interface AvatarProps
  extends Omit<React.ComponentProps<typeof AvatarPrimitive.Root>, "children"> {
  /** The image URL. Omit for the initials fallback. */
  src?: string | null;
  /** The account's display name — the initials and the label come from it. */
  name: string;
  size?: AvatarSize;
  /** Overrides the accessible name. Defaults to the display name. */
  label?: string;
}

function Avatar({
  className,
  src,
  name,
  size = 32,
  label,
  ...props
}: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "relative flex shrink-0 select-none overflow-hidden rounded-(--radius-full)",
        size === 64 ? "size-16" : "size-8",
        className,
      )}
      {...props}
    >
      {src ? (
        <AvatarPrimitive.Image
          data-slot="avatar-image"
          src={src}
          alt={label ?? name}
          className="aspect-square size-full object-cover"
        />
      ) : null}
      <AvatarPrimitive.Fallback
        data-slot="avatar-fallback"
        delayMs={0}
        aria-label={label ?? name}
        className={cn(
          "flex size-full items-center justify-center rounded-(--radius-full)",
          "bg-neutral-200 text-neutral-700",
          "dark:bg-neutral-700 dark:text-neutral-100",
          "font-sans font-medium",
          size === 64
            ? "text-(length:--fs-heading)"
            : "text-(length:--fs-caption)",
        )}
      >
        {getInitials(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

export { Avatar };
