/**
 * SaveStatus's words — v2 handoff §5.3, Epic 1 §10; "Waiting to save" for
 * a line kept on the device offline (USE-12).
 *
 * `idle` has no string on purpose: a canvas that says "Saved" before anything
 * has been typed is telling the person about the machine, not about their work.
 */
import type { SaveStatus } from "@syn/types";

export const SAVE_STATUS_COPY: Record<SaveStatus, string | null> = {
  idle: null,
  saving: "Saving…",
  saved: "Saved",
  waiting: "Waiting to save",
  retrying: "Not saved — retrying",
  failed: "Changes aren't saving. Check your connection.",
};
