"use client";

import * as React from "react";

import { LINK_TITLE_MAX, LINK_URL_MAX } from "@syn/constants";
import type { LinkView } from "@syn/types";
import { Button, HelperText, Input, ResponsiveSheet } from "@syn/ui";
import { linkFormSchema } from "@syn/validators";

import { SheetHost } from "@/components/page-frame";

import { LINKS_COPY as COPY } from "./copy";

/**
 * The `LinkSheet` — UX v1.3 §4.4 B8, R53 (DAY-10): **Title** (autofocus) ·
 * **Link** (`type="url"`, *https://…*) · *Cancel · Save*.
 *
 * VALIDATED WITH `linkFormSchema`, the one the service uses: `https:` or the
 * Spotify app's `spotify:`, nothing else — *That link doesn't look right.* on
 * the field, and nothing is saved. The sheet never sets a kind and never
 * fetches the link; a pasted Spotify URL leaves the title the person's to
 * write.
 */
export function LinkSheet({
  open,
  onOpenChange,
  editing,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The row being edited; null for a new link. */
  editing: LinkView | null;
  onSave: (input: { id?: string; title: string; url: string }) => Promise<void>;
  saving: boolean;
}) {
  const [title, setTitle] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [errors, setErrors] = React.useState<{ title?: string; url?: string; form?: string }>({});

  React.useEffect(() => {
    if (!open) return;
    setTitle(editing?.title ?? "");
    setUrl(editing?.url ?? "");
    setErrors({});
  }, [open, editing]);

  const submit = async () => {
    const parsed = linkFormSchema.safeParse({ id: editing?.id, title, url });
    if (!parsed.success) {
      const next: { title?: string; url?: string } = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0] === "title") next.title = issue.message;
        if (issue.path[0] === "url") next.url = COPY.invalid;
      }
      setErrors(next);
      return;
    }
    try {
      await onSave(parsed.data);
      onOpenChange(false);
    } catch {
      setErrors({ form: COPY.saveError });
    }
  };

  return (
    <SheetHost open={open}>
      <ResponsiveSheet
        open={open}
        onOpenChange={onOpenChange}
        title={editing === null ? COPY.sheetTitle : COPY.editTitle}
        initialFocus="first-field"
        footer={
          <div className="flex justify-end gap-(--space-2)">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {COPY.cancel}
            </Button>
            <Button busy={saving} onClick={() => void submit()}>
              {COPY.save}
            </Button>
          </div>
        }
      >
        <form
          className="flex flex-col gap-(--space-4)"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <Input
            label={COPY.title}
            value={title}
            maxLength={LINK_TITLE_MAX}
            autoFocus
            error={errors.title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <Input
            label={COPY.link}
            mode="url"
            placeholder={COPY.linkPlaceholder}
            value={url}
            maxLength={LINK_URL_MAX}
            error={errors.url}
            onChange={(event) => setUrl(event.target.value)}
          />
          {errors.form === undefined ? null : <HelperText error>{errors.form}</HelperText>}
          {/* Enter submits from either field. */}
          <button type="submit" className="sr-only" tabIndex={-1} aria-hidden="true" />
        </form>
      </ResponsiveSheet>
    </SheetHost>
  );
}
