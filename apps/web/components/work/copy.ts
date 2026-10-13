/** The work parts' own words: accessible names only; every shown word is the caller's. */
export const WORK_PARTS_COPY = {
  fire: (title: string) => `Fire ${title}`,
  bringBack: (title: string) => `Bring back ${title}`,
  done: "Done",
  subIssues: (title: string) => `Sub-issues of ${title}`,
} as const;
