import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScreenFrame, Text } from "@syn/ui";
import { AppShell } from "@/app/(shell)/_components/app-shell";
import { env } from "@/env";
import { findPart, partNames } from "@/lib/fixtures/parts";
import { devPartsRoute } from "@/lib/routes";

export const metadata: Metadata = { title: "Parts" };

const COPY = {
  heading: "Parts",
  none: "No parts registered yet.",
  unknown: (name: string) => `No part named “${name}”.`,
};

/**
 * The capture host (USE-7): a part no screen holds yet, rendered alone in
 * the shell's frame by its `?state=` name. No name lists every registered
 * part. Never in a production build.
 */
export default async function DevPartsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (env.NODE_ENV === "production") notFound();

  const { state } = await searchParams;
  const name = typeof state === "string" && state ? state : null;
  const render = name ? findPart(name) : undefined;

  return (
    <AppShell>
      <main id="main" className="flex flex-1 flex-col">
        {render ? render() : <PartList unknown={name} />}
      </main>
    </AppShell>
  );
}

function PartList({ unknown }: { unknown: string | null }) {
  const names = partNames();
  return (
    <ScreenFrame className="flex flex-col gap-(--space-4)">
      <Text as="h1" variant="heading">
        {COPY.heading}
      </Text>
      {unknown ? (
        <Text as="p" variant="body" tone="muted">
          {COPY.unknown(unknown)}
        </Text>
      ) : null}
      {names.length === 0 ? (
        <Text as="p" variant="body" tone="muted">
          {COPY.none}
        </Text>
      ) : (
        <ul className="flex flex-col gap-(--space-2)">
          {names.map((part) => (
            <li key={part}>
              <Link href={devPartsRoute(part)}>{part}</Link>
            </li>
          ))}
        </ul>
      )}
    </ScreenFrame>
  );
}
