/**
 * The landing page's copy — SYS-6, `docs/ux/landing-page-ux.md` §9, verbatim.
 *
 * Surface prose lives in `apps/web/content/` (copy-conventions), never inline
 * in a component and never in `@syn/constants`. Cantor's deck is the source;
 * a string that is not here is a `[COPY — needs Cantor]`, not an improvisation.
 *
 * THE TRUST LINE IS NOT IN THIS MODULE. It is `TRUST_LINE_COPY` in `@syn/ui`,
 * rendered by `TrustLine`, so the one promise has one wording in one place
 * (official spec §10.5). Repeating it here would be a second copy to keep true.
 *
 * The example day's titles and category names are fixture data, not marketing
 * prose, and live beside the fixture in `app/_components/landing/example-day.ts`.
 */
export const LANDING_COPY = {
  meta: {
    /** 54 characters. True. */
    title: "Synapse · A private daily list. No streaks, no scores.",
    /** 125 characters. The value proposition's short version, said once. */
    description:
      "Plan the week once, live the day without being managed, close it honestly. No streaks, no scores, nobody watching. It's free.",
    siteName: "Synapse",
  },
  skipLink: "Skip to content",
  header: {
    wordmark: "Synapse",
    signIn: "Sign in",
  },
  hero: {
    heading: "A private daily list.",
    lede:
      "Plan the week once, on a Sunday, and the mornings are already decided. During the day nothing keeps score or nags. At night you say what happened and why, and the record keeps it as it was.",
    cta: "Create an account",
    note: "It's free. The first list takes about ten minutes.",
    figureCaption: "An example day, at your local time.",
  },
  pillars: {
    decide: {
      heading: "Decide once",
      body:
        "A template is a kind of day, written down once: the run at 7:00, the two hours of writing. Build the week from a few of them on Sunday and every morning already has its list, in time order, before you're awake enough to argue with it.",
      figureCaption: "A planned day, before it starts.",
    },
    live: {
      heading: "Live the day without being managed",
      body:
        "No streaks. No scores. Nothing red. Reminders only at the times you set, and none once the day is closed. If you run late the plan isn't rewritten. The late thing is marked moved, and the time it was meant for stays on the record.",
      figureCaption: "Two things done. One of them late.",
    },
    close: {
      heading: "Close it honestly",
      body:
        "At night, each thing you didn't do gets a reason, and the reason decides how it counts. Something that came up isn't counted. A plan that was wrong counts half. The number, when there is one, comes with its arithmetic beside it, so you can check it.",
      figureCaption: "Change the reason. The arithmetic follows.",
    },
  },
  close: {
    heading: "Only yours",
    body:
      "There's no one else in it. No feed, no coach. Export everything or delete everything, from one screen.",
    cta: "Create an account",
    signIn: "Sign in",
  },
  footer: {
    wordmark: "Synapse",
    privacy: "Privacy",
    terms: "Terms",
  },
} as const;
