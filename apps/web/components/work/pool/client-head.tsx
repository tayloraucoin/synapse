"use client";

import {
  cn,
  DisclosureIcon,
  ExpandIcon,
  ReorderIcon,
  type SortableHandleProps,
} from "@syn/ui";
import type { PoolHeadView } from "@/lib/data/pool-view";
import { ClientTile } from "../client-tile";
import { POOL_PANEL_COPY as COPY } from "./copy";

/**
 * ClientHead — a group's head in the pool (34 px, D-USE-42): with Group:
 * Client, the 6-dot grip (SortableList's handle: drag, or Space and arrows,
 * or Alt+arrows), the client's 20 px letter tile, its name and the collapse
 * chevron. Any other head is its name alone, with the chevron.
 */
export interface ClientHeadProps {
  head: PoolHeadView;
  collapsed: boolean;
  onToggle: () => void;
  /** The grip, only where the head reorders. */
  handleProps?: SortableHandleProps;
  bodyId: string;
}

export function ClientHead({
  head,
  collapsed,
  onToggle,
  handleProps,
  bodyId,
}: ClientHeadProps) {
  const Chevron = collapsed ? DisclosureIcon : ExpandIcon;
  return (
    <div className="flex h-8.5 items-center gap-(--space-2)">
      {handleProps ? (
        <button
          type="button"
          {...handleProps}
          ref={handleProps.ref}
          className={cn(
            handleProps.className,
            "text-text-muted -ms-1.5 size-6 rounded-(--radius-control)",
          )}
        >
          <ReorderIcon aria-hidden="true" className="size-3" />
        </button>
      ) : null}
      {head.kind === "client" ? (
        <ClientTile
          letter={head.letter}
          hue={head.hue}
          size="md"
          className="font-bold"
        />
      ) : head.emoji ? (
        <span aria-hidden="true" className="font-emoji text-label">
          {head.emoji}
        </span>
      ) : null}
      <span className="text-label text-foreground min-w-0 flex-1 truncate font-semibold">
        {head.name}
      </span>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-controls={bodyId}
        aria-label={
          collapsed ? COPY.expand(head.name) : COPY.collapse(head.name)
        }
        className="text-muted-foreground hover:text-foreground inline-flex size-6 items-center justify-center rounded-(--radius-control) focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <Chevron aria-hidden="true" className="size-3.5" />
      </button>
    </div>
  );
}
