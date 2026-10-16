"use client";

/**
 * ConnectionsPage — Settings › Connections (USE-85; account/settings/).
 *
 * "‹ Settings" over the h1 "Connections" and a hairline; Google Calendar;
 * a rule; Linear's workspaces and Clients through USE-86's
 * `ClientsSettings`, handed the clients-off explainer, ··· › Disconnect and
 * the live Add a workspace row. No primary action: every change saves as
 * made, and nothing is written to Google or Linear (C-USE-settings-4).
 *
 * Add a Google account and Add a workspace run the fixture connect
 * (`useConnections().connect`), standing for the provider's sign-in; the
 * OAuth itself is the connect tickets'. Connecting, the Add row's spinner;
 * failed, "Not connected. Try again." under it. Offline, the StatusLine,
 * and connect and disconnect disabled (offline.md).
 *
 * A capture starts in a connect state through the scenario's `view.open`:
 * "connecting:<google|linear>" or "connect-failed:<google|linear>".
 */
import * as React from "react";
import { Breadcrumb, ScreenFrame, SkeletonRow, Text, toast } from "@syn/ui";
import { OfflineLine } from "@/components/planner/offline-line";
import { useDataSource, useIsOffline } from "@/lib/data/source";
import { useAccount } from "@/lib/data/use-account";
import {
  useConnections,
  useGoogleCalendarsQuery,
  type ConnectKind,
} from "@/lib/data/use-connections";
import { settingsRoute } from "@/lib/routes";
import { ClientsSettings } from "./clients-settings";
import {
  AddConnectionRow,
  InkLine,
  type ConnectState,
} from "./connection-lines";
import { CLIENTS_COPY, CONNECTIONS_COPY as COPY } from "./copy";
import { GoogleSection } from "./google-section";

type ConnectStates = Record<ConnectKind, ConnectState>;

function seededConnect(open: string | undefined): ConnectStates {
  const states: ConnectStates = { google: "idle", linear: "idle" };
  const [what, kind] = open?.split(":") ?? [];
  if (kind === "google" || kind === "linear") {
    if (what === "connecting") states[kind] = "connecting";
    if (what === "connect-failed") states[kind] = "failed";
  }
  return states;
}

/** "Taylor", from the account's name: the explainer names the person. */
function firstName(name: string | undefined): string {
  return name?.trim().split(/\s+/)[0] ?? "";
}

function LinearSkeleton({ explainer }: { explainer: string | null }) {
  return (
    <section aria-labelledby="connections-linear" className="flex flex-col">
      <Text
        as="h2"
        id="connections-linear"
        variant="row-title"
        weight={600}
        className="pb-(--space-1)"
      >
        {CLIENTS_COPY.linear}
      </Text>
      {explainer ? (
        <Text
          as="p"
          variant="secondary"
          tone="muted"
          className="pb-(--space-2)"
        >
          {explainer}
        </Text>
      ) : null}
      <div aria-hidden="true">
        {[0, 1].map((n) => (
          <SkeletonRow key={n} lines={1} className="px-0" />
        ))}
      </div>
    </section>
  );
}

export function ConnectionsPage() {
  const source = useDataSource();
  const connections = useConnections();
  const calendars = useGoogleCalendarsQuery();
  const account = useAccount();
  const offline = useIsOffline();
  const [connect, setConnect] = React.useState<ConnectStates>(() =>
    seededConnect(source.scenario.view?.open),
  );
  const heading = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);

  // The line names the person, so it waits for the account (no "to ,").
  const person = firstName(account.data?.name);
  const explainer = person ? COPY.linearLine(person) : null;

  function add(kind: ConnectKind) {
    if (offline || connect[kind] === "connecting") return;
    setConnect((was) => ({ ...was, [kind]: "connecting" }));
    connections.connect(kind).then(
      () => setConnect((was) => ({ ...was, [kind]: "idle" })),
      () => setConnect((was) => ({ ...was, [kind]: "failed" })),
    );
  }

  function disconnect(connectionId: string) {
    const name =
      connections.connections?.linear.find((c) => c.id === connectionId)
        ?.organizationName ?? "";
    // [ASSUMPTION] No Undo, as USE-86's sheet: a reconnect is the way back.
    connections.disconnect(connectionId).then(
      () => toast(COPY.disconnected(name)),
      () => toast(`${COPY.notSaved} ${COPY.tryAgain}.`),
    );
  }

  const failed = connections.status === "error";

  return (
    <ScreenFrame>
      <div className="flex flex-col gap-(--space-4) pb-(--space-8)">
        <header className="border-border flex flex-col gap-(--space-1) border-b pb-(--space-3)">
          <Breadcrumb
            label={COPY.back}
            href={settingsRoute()}
            ariaLabel={COPY.backLabel}
          />
          <h1 ref={heading} tabIndex={-1} className="outline-none">
            <Text as="span" variant="heading" weight={600}>
              {COPY.title}
            </Text>
          </h1>
        </header>

        {offline ? <OfflineLine text={COPY.offline} /> : null}

        {failed ? (
          <InkLine
            words={COPY.connectionsFailed}
            onRetry={() => connections.retry("connections")}
          />
        ) : (
          <>
            <GoogleSection
              data={calendars.data}
              status={calendars.status}
              onRetry={() => connections.retry("calendars")}
              setCalendar={connections.setCalendar}
              connect={connect.google}
              offline={offline}
              onAdd={() => add("google")}
            />

            <hr className="border-border m-0" />

            {connections.connections === undefined ? (
              <LinearSkeleton explainer={explainer} />
            ) : (
              <ClientsSettings
                workspaces={{
                  explainer,
                  onDisconnect: disconnect,
                  disconnectDisabled: offline,
                  addRow: (
                    <AddConnectionRow
                      label={CLIENTS_COPY.addWorkspace}
                      state={connect.linear}
                      disabled={offline}
                      onAdd={() => add("linear")}
                    />
                  ),
                }}
              />
            )}
          </>
        )}
      </div>
    </ScreenFrame>
  );
}
