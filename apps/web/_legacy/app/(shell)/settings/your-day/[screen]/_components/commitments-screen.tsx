"use client";

import * as React from "react";

import { Button, EllipsesMenu, ListRow, Text } from "@syn/ui";
import type { FixtureView } from "@syn/types";

import { FIXTURE_SHEET_COPY, FixtureSheet, fixtureDaysLabel } from "@/components/fixture-sheet";
import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "@/app/(setup)/_components/copy";
import { FactScreen } from "@/app/(setup)/_components/fact-screen";

/**
 * Settings → Your day → *Standing commitments* (UX v1.3 §4.6) — v1.2's
 * screen 4 (§4.4; v1.1 §4.4), moved here by DAY-13 when the first run's
 * step files were retired; the builder meets fixtures per plan on B6.
 *
 * "Capture the fixtures so the week is honest before any routine is
 * designed." The empty state is one muted line in the flow, left-aligned —
 * *Nothing yet.* — and beneath it *Add one* as a full-width secondary button
 * (S4.1: never centred, never an illustration). Saved fixtures list with
 * their glyph — *🗣️ Stand-up · Tue · 9:30 · 20 min* — and *Add another*
 * sits under the list. Each fixture is written as its sheet closes;
 * *Continue* and *Skip for now* write nothing of their own.
 *
 * IT SUGGESTS NOTHING. "This is a fact-capture screen; the app has no opinion
 * about what happens on Thursdays." The sheet's kinds are a vocabulary.
 */
export function CommitmentsScreen({
  initialFixtures,
  onSaved,
}: {
  initialFixtures: FixtureView[];
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
      embedded
      onSaved={onSaved}
      save={null}
    >
      {rows.length === 0 ? (
        <div className="flex flex-col gap-(--space-3)">
          <Text as="p" variant="secondary" tone="secondary">
            {COPY.nothingYet}
          </Text>
          <Button variant="secondary" onClick={openNew} className="w-full wide:w-auto wide:self-start">
            {COPY.addOne}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-(--space-3)">
          <ul className="divide-hairline flex flex-col divide-y">
            {rows.map((fixture) => (
              <ListRow
                key={fixture.id}
                as="li"
                leading={fixture.icon}
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
          <Button variant="secondary" onClick={openNew} className="w-full wide:w-auto wide:self-start">
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
