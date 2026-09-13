"use client";

import * as React from "react";

import { Button, EllipsesMenu, EmptyState, ListRow, Text } from "@syn/ui";
import type { FixtureView } from "@syn/types";

import { FIXTURE_SHEET_COPY, FixtureSheet, fixtureDaysLabel } from "@/components/fixture-sheet";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import { FactScreen } from "./fact-screen";

/**
 * Screen 4 — standing commitments (UX v1.1 §4.4).
 *
 * "Capture the fixtures so the week is honest before any routine is
 * designed." An empty state in two lines, the sheet, and the saved fixtures
 * as rows — *Stand-up · Tue · 9:30 · 20 min*. Each fixture is written as its
 * sheet closes; *Continue* and *Skip for now* write nothing of their own.
 *
 * IT SUGGESTS NOTHING. "This is a fact-capture screen; the app has no opinion
 * about what happens on Thursdays."
 */
export function Step4Commitments({
  initialFixtures,
  embedded = false,
  onSaved,
}: {
  initialFixtures: FixtureView[];
  embedded?: boolean;
  onSaved?: () => void;
}) {
  const fixtures = trpc.fixture.list.useQuery(undefined, { initialData: initialFixtures });
  const archive = trpc.fixture.archive.useMutation();
  const utils = trpc.useUtils();
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<FixtureView | null>(null);

  const rows = fixtures.data ?? [];

  function openNew(): void {
    setEditing(null);
    setSheetOpen(true);
  }

  return (
    <FactScreen
      step={4}
      heading={COPY.step4Heading}
      body={COPY.step4Body}
      embedded={embedded}
      onSaved={onSaved}
      save={null}
    >
      {rows.length === 0 ? (
        <EmptyState
          text={COPY.nothingYet}
          density="inline"
          actions={[{ label: COPY.addOne, onClick: openNew }]}
        />
      ) : (
        <div className="flex flex-col gap-(--space-3)">
          <ul className="divide-hairline flex flex-col divide-y">
            {rows.map((fixture) => (
              <ListRow
                key={fixture.id}
                as="li"
                title={fixture.title}
                meta={
                  <Text as="span" variant="secondary" tone="secondary" className="tabular-nums">
                    {FIXTURE_SHEET_COPY.rowMeta(
                      fixtureDaysLabel(fixture.weekdays),
                      fixture.atClock,
                      fixture.durationMin,
                    )}
                  </Text>
                }
                trailing={
                  <EllipsesMenu
                    label={fixture.title}
                    items={[
                      {
                        label: FIXTURE_SHEET_COPY.edit,
                        onClick: () => {
                          setEditing(fixture);
                          setSheetOpen(true);
                        },
                      },
                      {
                        label: FIXTURE_SHEET_COPY.remove,
                        onClick: () => {
                          void archive
                            .mutateAsync({ id: fixture.id })
                            .then(() => utils.fixture.list.invalidate());
                        },
                      },
                    ]}
                  />
                }
              />
            ))}
          </ul>
          <Button variant="secondary" onClick={openNew} className="self-start">
            {COPY.addAnother}
          </Button>
        </div>
      )}

      <FixtureSheet
        open={sheetOpen}
        fixture={editing}
        onOpenChange={setSheetOpen}
      />
    </FactScreen>
  );
}
