/**
 * The landing page — SYS-6, `docs/ux/landing-page-ux.md` §1–§3.
 *
 * A Server Component. The only client leaves are the two figures that need a
 * browser: `ExampleDay` (the clock) and `ReviewFigure` (the decision state
 * machine). Everything else — the header, the copy, pillar 1's static rows,
 * the close, the footer — is rendered on the server, so the page's words are
 * in the first byte.
 *
 * THE PRODUCT IS THE PICTURE (Decision 1). There is no stock photograph, no
 * illustration, and no invented logo: the three figures are `ItemRow`,
 * `DayHeader`, `DecisionPanel` and the review's arithmetic, the same
 * components the app is built from. The wordmark is the name set in the
 * interface family (official spec §9.8), because the mark itself is still a
 * placeholder.
 *
 * ONE `h1`. `DayHeader` renders an `h1` when it has nothing to open, so the
 * figure passes `as="p"` — the prop this ticket added rather than composing a
 * second header out of two `Text`s.
 *
 * NEWSREADER APPEARS ONCE, in the review's number and sentence, which is the
 * one reflective surface the product itself uses it on (§9.4, Decision 4).
 * Every other line on this page is Geist.
 */
import Link from "next/link";
import * as React from "react";

import {
  Button,
  Caption,
  DayHeader,
  Heading,
  ItemRow,
  Meta,
  Text,
  TrustLine,
  cn,
} from "@syn/ui";

import { LANDING_COPY } from "@/content/landing";
import { signInRoute, signUpRoute } from "@/lib/routes";

import { buildPlannedRows, STATIC_TIME_ZONE } from "./example-day";
import { ExampleDay, MovedRows } from "./example-list";
import { ReviewFigure } from "./review-figure";

/**
 * A hairline and nothing else: the rows sit on the page's paper, as on the
 * List. The end padding is for the now line's time label, which `NowLine`
 * pins to the right edge and which would otherwise touch the border.
 */
const FIGURE =
  "border-hairline rounded-(--radius-sheet) border ps-(--space-4) pe-(--space-2) py-(--space-2)";

/** 48px is the top of the scale (§9.5); the page is as dense as the app. */
const SECTION = "border-hairline border-t py-(--space-7)";

/** Text left, picture right, on the one breakpoint. The page does not zigzag. */
const SPLIT =
  "flex flex-col gap-(--space-5) wide:grid wide:grid-cols-12 wide:items-start wide:gap-(--space-6)";

/*
 * The hero is the one section with three items rather than two: the words, the
 * day, and the action beneath the words. The day spans both rows, and a grid
 * distributes a spanning item's height evenly across the rows it covers — which
 * pushed the action halfway down a 600px column. Naming the rows `auto 1fr`
 * gives row one the height of the words and hands every remaining pixel to row
 * two, so the action sits where it was designed to sit: directly under the lede.
 */
const HERO_SPLIT = `${SPLIT} wide:grid-rows-[auto_1fr]`;
const SPLIT_TEXT = "flex flex-col gap-(--space-4) wide:col-span-5";
const SPLIT_FIGURE = "wide:col-span-7";

export function LandingPage() {
  const plannedRows = buildPlannedRows();

  return (
    <>
      <a
        href="#main"
        className="bg-paper text-ink sr-only rounded-(--radius) px-(--space-3) py-(--space-2) focus:not-sr-only focus:absolute focus:top-(--space-2) focus:left-(--space-2) focus:z-50"
      >
        {LANDING_COPY.skipLink}
      </a>

      <div className="mx-auto w-full max-w-(--content-canvas) px-(--space-4) wide:px-(--space-6)">
        <header className="flex h-(--header-h) items-center justify-between">
          <Text as="span" variant="body" weight={500}>
            {LANDING_COPY.header.wordmark}
          </Text>
          <Button variant="ghost" asChild>
            <Link href={signInRoute()}>{LANDING_COPY.header.signIn}</Link>
          </Button>
        </header>

        <main id="main">
          {/* ---------------------------------------------------- hero -- */}
          <section className="py-(--space-7)">
            <div className={HERO_SPLIT}>
              <div className={cn(SPLIT_TEXT, "wide:row-start-1")}>
                <Heading balance>{LANDING_COPY.hero.heading}</Heading>
                <Text
                  as="p"
                  variant="body"
                  tone="body"
                  className="max-w-(--measure)"
                >
                  {LANDING_COPY.hero.lede}
                </Text>
              </div>

              <figure
                className={cn(
                  SPLIT_FIGURE,
                  "wide:col-start-6 wide:row-span-2 wide:row-start-1",
                )}
              >
                <ExampleDay className={FIGURE} />
                <Caption as="figcaption" className="pt-(--space-2)">
                  {LANDING_COPY.hero.figureCaption}
                </Caption>
              </figure>

              <div className="flex flex-col gap-(--space-2) wide:col-span-5 wide:col-start-1 wide:row-start-2">
                <Button asChild className="w-full wide:w-auto wide:self-start">
                  <Link href={signUpRoute()}>{LANDING_COPY.hero.cta}</Link>
                </Button>
                <Meta as="p">{LANDING_COPY.hero.note}</Meta>
              </div>
            </div>
          </section>

          {/* ---------------------------------------- pillar 1: decide -- */}
          <section className={SECTION}>
            <div className={SPLIT}>
              <div className={SPLIT_TEXT}>
                <Heading as="h2" balance>
                  {LANDING_COPY.pillars.decide.heading}
                </Heading>
                <Text
                  as="p"
                  variant="body"
                  tone="body"
                  className="max-w-(--measure)"
                >
                  {LANDING_COPY.pillars.decide.body}
                </Text>
              </div>

              <figure className={SPLIT_FIGURE}>
                <div className={FIGURE}>
                  <DayHeader
                    as="p"
                    dateLabel="Tuesday"
                    templateName="Weekday"
                    mode="plan"
                  />
                  <ol>
                    {plannedRows.map((item) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        variant="read-only"
                        timeZone={STATIC_TIME_ZONE}
                      />
                    ))}
                  </ol>
                </div>
                <Caption as="figcaption" className="pt-(--space-2)">
                  {LANDING_COPY.pillars.decide.figureCaption}
                </Caption>
              </figure>
            </div>
          </section>

          {/* ------------------------------------------ pillar 2: live -- */}
          <section className={SECTION}>
            <div className={SPLIT}>
              <div className={SPLIT_TEXT}>
                <Heading as="h2" balance>
                  {LANDING_COPY.pillars.live.heading}
                </Heading>
                <Text
                  as="p"
                  variant="body"
                  tone="body"
                  className="max-w-(--measure)"
                >
                  {LANDING_COPY.pillars.live.body}
                </Text>
              </div>

              <figure className={SPLIT_FIGURE}>
                <MovedRows className={FIGURE} />
                <Caption as="figcaption" className="pt-(--space-2)">
                  {LANDING_COPY.pillars.live.figureCaption}
                </Caption>
              </figure>
            </div>
          </section>

          {/* ----------------------------------------- pillar 3: close -- */}
          <section className={SECTION}>
            <div className={SPLIT}>
              <div className={SPLIT_TEXT}>
                <Heading as="h2" balance>
                  {LANDING_COPY.pillars.close.heading}
                </Heading>
                <Text
                  as="p"
                  variant="body"
                  tone="body"
                  className="max-w-(--measure)"
                >
                  {LANDING_COPY.pillars.close.body}
                </Text>
              </div>

              <figure className={SPLIT_FIGURE}>
                <ReviewFigure className={FIGURE} />
                <Caption as="figcaption" className="pt-(--space-2)">
                  {LANDING_COPY.pillars.close.figureCaption}
                </Caption>
              </figure>
            </div>
          </section>

          {/* ------------------------------------------ close: only yours */}
          <section className={SECTION}>
            <div className="flex max-w-(--measure) flex-col gap-(--space-4)">
              <Heading as="h2" balance>
                {LANDING_COPY.close.heading}
              </Heading>
              <Text as="p" variant="body" tone="body">
                {LANDING_COPY.close.body}
              </Text>

              <div className="flex flex-wrap items-center gap-(--space-3)">
                <Button asChild>
                  <Link href={signUpRoute()}>{LANDING_COPY.close.cta}</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href={signInRoute()}>{LANDING_COPY.close.signIn}</Link>
                </Button>
              </div>

              {/*
               * The one privacy promise, in its one treatment, once on the
               * page and last in `main` (official spec §10.5). The wording is
               * the component's; there is no prop that could change it.
               */}
              <TrustLine />
            </div>
          </section>
        </main>

        <footer className="border-hairline flex flex-wrap items-center gap-(--space-4) border-t py-(--space-5)">
          <Text as="span" variant="body" weight={500}>
            {LANDING_COPY.footer.wordmark}
          </Text>
          {/*
           * `Privacy` and `Terms` arrive with SYS-3, which owns both routes and
           * their copy. Linking them from here before the pages exist would be
           * the one thing a footer must never do.
           */}
        </footer>
      </div>
    </>
  );
}
