/**
 * The confirm-yesterday rows' words — UX v1.1 §7.3, §10.4: each row is
 * labelled *{title}, last night, not confirmed*. The caption *Last night* is
 * the caller's (it heads a section in two places).
 */
export const CONFIRM_YESTERDAY_COPY = {
  caption: "Last night",
  rowLabel: (title: string) => `${title}, last night, not confirmed`,
} as const;
