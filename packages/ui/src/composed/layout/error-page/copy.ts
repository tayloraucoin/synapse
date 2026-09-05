/**
 * ErrorPage's two variants — nav & system SY-05, verbatim.
 *
 * NEVER A STACK TRACE, NEVER A CODE. The code is logged, not shown (SY-05).
 * Both variants say what is true and what the person can do, and neither
 * apologises: an apology in an error page is the app talking about itself.
 */
export const ERROR_PAGE_COPY = {
  "not-found": {
    heading: "This page isn't here.",
    body: "The link may be old, or the day it points to hasn't been planned.",
  },
  unrecoverable: {
    heading: "Something went wrong on this screen.",
    body: "Your changes are kept.",
  },
  openToday: "Open today",
  reload: "Reload",
} as const;
