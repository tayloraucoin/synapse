"use client";

import * as React from "react";

import {
  Button,
  GroupHeading,
  SearchField,
  SelectRow,
  SelectRowList,
  SkeletonRow,
  StatusLine,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from "@syn/ui";

import { HabitSheet } from "@/components/habit-sheet";

import { LANDSCAPE_COPY as COPY } from "./copy";
import type { LandscapeApi, LandscapeRow } from "./use-landscape";

/**
 * The landscape — UX v1.2 §4.8 (RUN-10), on v1.1 §4.8: "Capture everything
 * the person does or wants to do to start the day well — without ranking or
 * fitting any of it yet."
 *
 * TWO WORD TABS. *Recommended* is the library's dozen under *Body · Mind*;
 * *All* is the whole morning library with a search. *Selected* is gone —
 * screen 9 is where the ranking happens. Every row is a `SelectRow` with its
 * glyph and range; a tap ticks at once and creates the habit; a second tap
 * un-ticks. *Add your own* on each tab opens *A morning habit* — emoji,
 * name, range, nothing else.
 *
 * NO FIT NUMBER, NO MINUTES TOTAL, NOTHING PRE-CHECKED — "hospitality, not
 * persuasion". The screen is the data bank.
 */

const BODY = new Set(["Breath work", "Cold shower", "Stretch", "Walk", "Sunlight", "Water", "Make the bed"]);

export interface LandscapeChooserProps {
  landscape: LandscapeApi;
  disabled?: boolean;
}

export function LandscapeChooser({ landscape, disabled = false }: LandscapeChooserProps) {
  const [query, setQuery] = React.useState("");
  const [habitSheetOpen, setHabitSheetOpen] = React.useState(false);

  const recommended = landscape.rows.filter((row) => landscape.entries.find((entry) => entry.title === row.title)?.recommended);
  const trimmed = query.trim().toLowerCase();
  const all = landscape.rows.filter((row) => trimmed === "" || row.title.toLowerCase().includes(trimmed));

  const select = (row: LandscapeRow) => {
    const entry = landscape.entries.find((candidate) => candidate.title === row.title);
    return (
      <SelectRow
        key={row.key}
        icon={row.icon}
        title={row.title}
        detail={COPY.range(row.rangeMin, row.rangeMax)}
        selected={row.selected}
        committing={row.committing}
        disabled={disabled || row.locked}
        disabledCaption={row.locked ? COPY.inLibrary : undefined}
        onToggle={(next) => {
          if (entry) landscape.toggle(entry, next);
        }}
      />
    );
  };

  const addYourOwn = (
    <Button
      variant="secondary"
      className="w-full wide:w-auto wide:self-start"
      disabled={disabled}
      onClick={() => setHabitSheetOpen(true)}
    >
      {COPY.addYourOwn}
    </Button>
  );

  if (landscape.loading) {
    return (
      <div className="flex flex-col gap-(--space-2)">
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonRow key={index} />
        ))}
      </div>
    );
  }

  return (
    <Tabs defaultValue="recommended" className="gap-(--space-4)">
      <TabsList>
        <TabsTrigger value="recommended">{COPY.tabRecommended}</TabsTrigger>
        <TabsTrigger value="all">{COPY.tabAll}</TabsTrigger>
      </TabsList>

      {landscape.line === null ? null : <StatusLine variant="sync-issues" text={landscape.line} placement="inline" />}

      <TabsContent value="recommended" className="flex flex-col gap-(--space-4)">
        <section className="flex flex-col gap-(--space-2)">
          <GroupHeading>{COPY.groupBody}</GroupHeading>
          <SelectRowList columns={2}>{recommended.filter((row) => BODY.has(row.title)).map(select)}</SelectRowList>
        </section>
        <section className="flex flex-col gap-(--space-2)">
          <GroupHeading>{COPY.groupMind}</GroupHeading>
          <SelectRowList columns={2}>{recommended.filter((row) => !BODY.has(row.title)).map(select)}</SelectRowList>
        </section>
        {addYourOwn}
      </TabsContent>

      <TabsContent value="all" className="flex flex-col gap-(--space-3)">
        <SearchField
          aria-label={COPY.searchLabel}
          label={COPY.searchLabel}
          placeholder={COPY.searchPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery("")}
        />
        {all.length === 0 ? (
          <Text as="p" tone="secondary" aria-live="polite">
            {COPY.noMatches(query.trim())}
          </Text>
        ) : (
          <SelectRowList columns={2}>{all.map(select)}</SelectRowList>
        )}
        {addYourOwn}
      </TabsContent>

      <HabitSheet
        open={habitSheetOpen}
        mode="morning-habit"
        onOpenChange={setHabitSheetOpen}
        onSaved={(habit) => void landscape.adopt(habit.id)}
      />
    </Tabs>
  );
}
