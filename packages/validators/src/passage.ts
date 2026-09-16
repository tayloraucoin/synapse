import { z } from "zod";

import {
  PASSAGE_BODY_MAX,
  PASSAGE_IMAGES_MAX,
  PASSAGE_TAGS_MAX,
  PASSAGE_TAG_MAX,
  PASSAGE_TITLE_MAX,
} from "@syn/constants";

/**
 * A passage — UX v1.2 §3.12, §4.6, §11.4 (TD-15). The sheet and
 * `passage.save` share this.
 *
 * THE BODY IS MARKDOWN, stored as sent (trimmed, bounded); the reader renders
 * it through the editor's read-only mode, never as HTML. Images are
 * bucket-qualified paths the service re-checks against the caller's owner
 * segment; the validator only bounds their count and shape.
 */
export const passageFormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z
    .string()
    .trim()
    .max(PASSAGE_TITLE_MAX)
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  bodyMd: z
    .string()
    .trim()
    // [COPY — needs Vesper sign-off: v1.2 §4.6 says nothing here is required but the body.]
    .min(1, "A few lines, a paragraph, a page.")
    .max(PASSAGE_BODY_MAX),
  images: z.array(z.string().min(1).max(512)).max(PASSAGE_IMAGES_MAX).default([]),
  tags: z
    .array(z.string().trim().min(1).max(PASSAGE_TAG_MAX))
    .max(PASSAGE_TAGS_MAX)
    .default([]),
});

export type PassageFormInput = z.infer<typeof passageFormSchema>;

export const passageIdInput = z.object({ id: z.string().uuid() });

/** The full ordered id list; the service refuses one that omits an active row. */
export const reorderPassagesInput = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

export type ReorderPassagesInput = z.infer<typeof reorderPassagesInput>;
