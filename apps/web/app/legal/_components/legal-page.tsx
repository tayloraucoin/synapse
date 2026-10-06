import { Heading, ScreenFrame, Text, TrustLine } from "@syn/ui";

/**
 * The shape both legal pages share — SYS-3.
 *
 * THEY EXIST BEFORE THEIR COPY DOES, deliberately. About and the landing footer
 * both link here, and a link to a 404 is worse than a link to a page that says
 * it is being written: the first looks like the product is broken, the second
 * looks like the product is honest. `[PENDING — Taylor: legal copy.]`
 *
 * THE TRUST LINE IS AT THE BOTTOM, in the same words and treatment it has on
 * the sign-in screen and on Your data (official spec §4.1). It is the one thing
 * on these pages that is already true and already settled, and it is the claim
 * the eventual policy has to be consistent with.
 *
 * NO SHELL AND NO GATE. A privacy policy a person has to sign in to read is not
 * a privacy policy.
 */
export function LegalPage({ title }: { title: string }) {
  return (
    <main
      id="main"
      className="mx-auto flex w-full max-w-(--content-text) flex-col"
    >
      <ScreenFrame width="text" prose>
        <div className="flex flex-col gap-(--space-5)">
          <Heading>{title}</Heading>
          {/* [COPY — needs Vesper sign-off; a placeholder, not a policy.] */}
          <Text as="p" tone="body">
            This page is being written.
          </Text>
          <TrustLine />
        </div>
      </ScreenFrame>
    </main>
  );
}
