"use client";

import * as React from "react";

import type { LinkView } from "@syn/types";
import { BrandGlyph, Button, EllipsesMenu, ListRow, SkeletonRow, Text } from "@syn/ui";

import { LINKS_COPY as COPY } from "./copy";
import { LinkSheet } from "./link-sheet";
import { useLinks } from "./use-links";

/** The host as the row's detail — *open.spotify.com*; a `spotify:` URI reads as the web player's host. */
function hostOf(link: LinkView): string {
  if (link.url.toLowerCase().startsWith("spotify:")) return "open.spotify.com";
  try {
    return new URL(link.url).hostname;
  } catch {
    return link.url;
  }
}

/**
 * *To open* — UX v1.3 §4.4 B8, R53 (DAY-10): the person's links as
 * `ListRow`s — the `BrandGlyph` for the stored kind (the Spotify mark, or
 * Lucide `Link` for anything else) · the title · the host as muted detail ·
 * *Edit · Remove* — then **Add a link**. Empty: one muted line, left-aligned.
 * The builder's B8 and Settings → First thing (DAY-12) mount the same list.
 */
export function LinkList({
  disabled = false,
  onCountChange,
}: {
  disabled?: boolean;
  onCountChange?: (count: number) => void;
}) {
  const links = useLinks();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<LinkView | null>(null);

  React.useEffect(() => {
    onCountChange?.(links.rows.length);
  }, [links.rows.length, onCountChange]);

  return (
    <div className="flex flex-col gap-(--space-3)">
      {links.loading ? (
        <SkeletonRow />
      ) : links.rows.length === 0 ? (
        <Text as="p" variant="secondary" tone="secondary">
          {COPY.nothingYet}
        </Text>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {links.rows.map((link) => (
            <ListRow
              key={link.id}
              as="li"
              leading={<BrandGlyph kind={link.kind === "spotify" ? "spotify" : "link"} />}
              title={link.title}
              meta={hostOf(link)}
              trailing={
                <EllipsesMenu
                  label={link.title}
                  disabled={disabled}
                  items={[
                    {
                      label: COPY.edit,
                      onClick: () => {
                        setEditing(link);
                        setOpen(true);
                      },
                    },
                    { label: COPY.remove, onClick: () => void links.onRemove(link) },
                  ]}
                />
              }
            />
          ))}
        </ul>
      )}

      <Button
        variant="secondary"
        disabled={disabled}
        onClick={() => {
          setEditing(null);
          setOpen(true);
        }}
        className="w-full wide:w-auto wide:self-start"
      >
        {COPY.addALink}
      </Button>

      <LinkSheet open={open} onOpenChange={setOpen} editing={editing} onSave={links.onSave} saving={links.saving} />
    </div>
  );
}
