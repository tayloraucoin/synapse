import Link from "next/link";

import { GroupHeading, Text, TrustLine } from "@syn/ui";

import { PageFrame, ShellPageHeader } from "@/components/page-frame";
import { legalPrivacyRoute, legalTermsRoute } from "@/lib/routes";

import { ABOUT_COPY as COPY } from "./_components/copy";
import { FeedbackForm } from "./_components/feedback-form";
import { ShortcutsTable } from "./_components/shortcuts-table";

/**
 * SY-01 About & feedback — cross-cutting §10.
 *
 * THE VERSION IS READ AS A LITERAL, which is the same documented exception as
 * `lib/clients/supabase/client.ts`: Next inlines a literal
 * `process.env.NEXT_PUBLIC_*` and cannot inline anything else. `next.config.ts`
 * stamps both values at build time from `package.json`, so the line on this
 * screen is the build a person is actually running — which is the only reason
 * to show a version at all.
 *
 * THE LEGAL LINKS ALWAYS RENDER, because the pages always exist. They say they
 * are being written rather than 404ing; a dead link on the page that explains
 * what the product is would undercut the trust line three rows below it.
 *
 * The screen's one `h1` is the header's title (cross-cutting §11).
 */
export default function SettingsAboutPage() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";
  const buildDate = process.env.NEXT_PUBLIC_BUILD_DATE ?? "";

  return (
    <PageFrame header={<ShellPageHeader title={COPY.title} showBack />}>
      <div className="flex flex-col gap-(--space-5) py-(--space-4)">
        <section className="flex flex-col gap-(--space-1)">
          <Text as="p" variant="row-title" weight={500}>
            {COPY.name}
          </Text>
          <Text as="p" variant="caption" tone="secondary">
            {COPY.versionLine(version, buildDate)}
          </Text>
          <Text as="p" tone="body" className="max-w-(--measure) pt-(--space-2)">
            {COPY.body}
          </Text>
        </section>

        <FeedbackForm />

        <ShortcutsTable />

        <section className="flex flex-col gap-(--space-2)">
          <GroupHeading>{COPY.legalHeading}</GroupHeading>
          <div className="flex gap-(--space-4)">
            <Link href={legalPrivacyRoute()} className="underline">
              <Text as="span" tone="body">
                {COPY.privacy}
              </Text>
            </Link>
            <Link href={legalTermsRoute()} className="underline">
              <Text as="span" tone="body">
                {COPY.terms}
              </Text>
            </Link>
          </div>
        </section>

        <TrustLine />
      </div>
    </PageFrame>
  );
}
