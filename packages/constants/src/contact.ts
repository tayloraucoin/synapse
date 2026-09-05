/**
 * Contact addresses.
 *
 * TODO(INF-2): Taylor supplies the monitored inbox. `VAPID_MAILTO_SUBJECT` is
 * the `mailto:` the push service contacts if a subscription misbehaves, so it
 * must be a real address before the first push is sent (INF-9). Nothing here is
 * invented — an unflagged placeholder address would be a silently wrong value
 * in a live header.
 */

/** [NEEDS VALUE AT BUILD] — the monitored inbox, e.g. `info@example.com`. */
export const CONTACT_EMAIL = "";

/** Default VAPID mailto subject for web push — official spec §8.6. */
export const VAPID_MAILTO_SUBJECT = CONTACT_EMAIL
  ? `mailto:${CONTACT_EMAIL}`
  : "";
