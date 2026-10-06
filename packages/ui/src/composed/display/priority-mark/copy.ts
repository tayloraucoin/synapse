/**
 * PriorityMark's one string — UX v1.3 R59, §10.4.
 *
 * The mark is an image to assistive tech; its name says what the number is,
 * so the digit is never bare (*matters 5*, never *5*).
 */
export const PRIORITY_MARK_COPY = {
  label: (value: number) => `matters ${value}`,
} as const;
