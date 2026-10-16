/**
 * SettingsList — `/settings` (USE-85): what USE draws, and only that
 * (calls.md's bend; D-USE-90). Connections, then sign out; Profile and
 * Install the app live in the avatar menu. No legacy section returns.
 *
 * A pushed screen: no tabs below 1024, so the crumb is the way back
 * [ASSUMPTION: to Now, as Set my days']. Sign out posts to the logout
 * route (AU-06: never a GET).
 */
import Link from "next/link";
import { Breadcrumb, cn, DisclosureIcon, ScreenFrame, Text } from "@syn/ui";
import { connectionsRoute, logoutRoute, todayRoute } from "@/lib/routes";
import { SETTINGS_COPY as COPY } from "./copy";

const ROW = cn(
  "border-border flex min-h-(--row-min) w-full items-center gap-(--space-3) border-b text-start",
  "rounded-(--radius-sm) hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
);

/** One row of the list: its words and a chevron. */
function SettingsRow({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link href={href} className={ROW}>
        <Text as="span" variant="body" className="flex-1">
          {label}
        </Text>
        <DisclosureIcon
          aria-hidden="true"
          className="text-muted-foreground size-4 shrink-0"
        />
      </Link>
    </li>
  );
}

export function SettingsList() {
  return (
    <ScreenFrame>
      <div className="flex flex-col gap-(--space-6) pb-(--space-8)">
        <header className="border-border flex flex-col gap-(--space-1) border-b pb-(--space-3)">
          <Breadcrumb
            label={COPY.back}
            href={todayRoute()}
            ariaLabel={COPY.backLabel}
          />
          <Text as="h1" variant="heading" weight={600}>
            {COPY.title}
          </Text>
        </header>
        <ul className="m-0 flex list-none flex-col p-0">
          <SettingsRow href={connectionsRoute()} label={COPY.connections} />
        </ul>
        <form action={logoutRoute()} method="post">
          <button type="submit" className={cn(ROW, "border-b-0")}>
            <Text as="span" variant="body">
              {COPY.signOut}
            </Text>
          </button>
        </form>
      </div>
    </ScreenFrame>
  );
}
