/**
 * The one privacy sentence — official spec §10.4, Epic 1 AU-01 §9.
 *
 * Verbatim from the spec. It appears on AU-01/02, ST-10, ST-11 and SY-01, and
 * it is the same sentence every time; stating it once here is what keeps it
 * the same sentence. The spec's copy table (§10.4) rules out "private, secure,
 * encrypted" in its favour — the promise names who cannot see the data, not an
 * adjective about the storage.
 */
export const TRUST_LINE_COPY = {
  text: "Only you can see your data. Not the people who built this, not anyone you invite.",
} as const;
