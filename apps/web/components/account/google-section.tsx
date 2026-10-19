"use client";

/**
 * Connections' Google Calendar section (USE-85; states/connections.md).
 *
 * THE DOT IS PLUM, as drawn (devs_call): filled `--color-category-plum-dot`
 * when the calendar is on, an empty `--color-input` ring with the name
 * muted when off. It is decorative: the Switch, named for the calendar,
 * carries the state, so colour is never alone.
 *
 * A SWITCH SAVES AS MADE, through `useConnections().setCalendar`, to
 * Synapse's own row; nothing is written to Google (C-USE-settings-4). The
 * wanted value shows at once; a write that fails springs back and "Not
 * saved. Try again." sits under the row, in ink (C-USE-settings-error-2).
 * Offline it saves on the phone (offline.md): the fixture write lands.
 *
 * The list is its own read: loading, skeleton rows of the row's height;
 * failed, "Calendars didn't load." with Try again here alone, the explainer
 * and Add a Google account kept (error.md).
 */
import * as React from "react";
import { cn, SkeletonRow, Switch, Text } from "@syn/ui";
import type { GoogleCalendarView } from "@syn/validators";
import type { GoogleCalendarsRecords } from "@/lib/data/use-connections";
import {
  AddConnectionRow,
  InkLine,
  type ConnectState,
} from "./connection-lines";
import { CONNECTIONS_COPY as COPY } from "./copy";

export interface GoogleSectionProps {
  data: GoogleCalendarsRecords | undefined;
  status: "pending" | "error" | "success";
  onRetry: () => void;
  setCalendar: (input: {
    calendarId: string;
    enabled: boolean;
  }) => Promise<void>;
  connect: ConnectState;
  offline: boolean;
  onAdd: () => void;
}

function CalendarRow({
  calendar,
  setCalendar,
}: {
  calendar: GoogleCalendarView;
  setCalendar: GoogleSectionProps["setCalendar"];
}) {
  // The wanted value while it saves; null once the read has it.
  const [wanted, setWanted] = React.useState<boolean | null>(null);
  const [failed, setFailed] = React.useState<boolean | null>(null);
  const on = wanted ?? calendar.enabled;

  React.useEffect(() => {
    if (wanted === calendar.enabled) setWanted(null);
  }, [wanted, calendar.enabled]);

  function save(enabled: boolean) {
    setFailed(null);
    setWanted(enabled);
    setCalendar({ calendarId: calendar.id, enabled }).catch(() => {
      setWanted(null);
      setFailed(enabled);
    });
  }

  return (
    <li className="border-border flex flex-col border-b">
      <div className="flex min-h-(--row-min) items-center gap-(--space-3)">
        <span
          aria-hidden="true"
          className={cn(
            "size-2.5 shrink-0 rounded-full",
            on ? "bg-category-plum-dot" : "border-input border",
          )}
        />
        <Text
          as="span"
          variant="body"
          tone={on ? "ink" : "muted"}
          className="min-w-0 flex-1 truncate"
        >
          {calendar.name}
        </Text>
        <Switch
          checked={on}
          onCheckedChange={save}
          aria-label={calendar.name}
        />
      </div>
      {failed !== null ? (
        <InkLine
          words={COPY.notSaved}
          onRetry={() => save(failed)}
          className="pb-(--space-2)"
        />
      ) : null}
    </li>
  );
}

export function GoogleSection({
  data,
  status,
  onRetry,
  setCalendar,
  connect,
  offline,
  onAdd,
}: GoogleSectionProps) {
  const [first, ...more] = data?.accounts ?? [];
  const calendarsOf = (accountId: string) =>
    (data?.calendars ?? []).filter((c) => c.accountId === accountId);

  return (
    <section aria-labelledby="connections-google" className="flex flex-col">
      <div className="flex items-baseline justify-between gap-(--space-3) pb-(--space-1)">
        <Text as="h2" id="connections-google" variant="row-title" weight={600}>
          {COPY.google}
        </Text>
        {first ? (
          <Text as="span" variant="secondary" tone="muted" className="truncate">
            {COPY.account(first.label)}
          </Text>
        ) : null}
      </div>
      <Text as="p" variant="secondary" tone="muted" className="pb-(--space-2)">
        {COPY.googleLine}
      </Text>

      {status === "pending" ? (
        <div aria-hidden="true">
          {[0, 1, 2].map((n) => (
            <SkeletonRow key={n} leading={false} lines={1} className="px-0" />
          ))}
        </div>
      ) : status === "error" ? (
        <InkLine words={COPY.calendarsFailed} onRetry={onRetry} />
      ) : (
        [first, ...more].map((account, index) =>
          account ? (
            <div key={account.id} className="flex flex-col">
              {index > 0 ? (
                <Text
                  as="p"
                  variant="secondary"
                  tone="muted"
                  className="pt-(--space-3)"
                >
                  {COPY.account(account.label)}
                </Text>
              ) : null}
              <ul className="m-0 flex list-none flex-col p-0">
                {calendarsOf(account.id).map((calendar) => (
                  <CalendarRow
                    key={calendar.id}
                    calendar={calendar}
                    setCalendar={setCalendar}
                  />
                ))}
              </ul>
            </div>
          ) : null,
        )
      )}

      <AddConnectionRow
        label={COPY.addGoogle}
        state={connect}
        disabled={offline}
        onAdd={onAdd}
      />
    </section>
  );
}
