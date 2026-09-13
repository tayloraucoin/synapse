"use client";

import * as React from "react";

import {
  Button,
  CheckboxField,
  GroupHeading,
  ListRow,
  MinutesStepper,
  SearchField,
  SkeletonRow,
  Stepper17,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  type Stepper17Value,
} from "@syn/ui";
import { DURATION_MAX, DURATION_MIN } from "@syn/constants";
import type { StarterLibraryEntry } from "@syn/constants";

import { HabitSheet } from "@/components/habit-sheet";

import { LANDSCAPE_COPY as COPY } from "./copy";
import type { LandscapeApi } from "./use-landscape";

/**
 * The landscape — UX v1.1 §4.8: "Capture everything the person does or wants
 * to do to start the day well, ranked — without asking any of it to fit."
 *
 * THREE WORD TABS. *Recommended* is the library's dozen under *Body · Mind*;
 * *All* is the whole morning library with a search; *Selected (n)* is what is
 * ticked, each with the two facts the rest of the system needs — a
 * `Stepper17` and a `MinutesStepper`. *Add your own* on every tab opens the
 * habit sheet, shortened by its own rules (no type; the block preset).
 *
 * NO FIT NUMBER, NO MINUTES TOTAL, NOTHING PRE-CHECKED — "hospitality, not
 * persuasion". The screen is the data bank; the fit is screen 12's job.
 */

const BODY = new Set(["Breath work", "Cold shower", "Stretch", "Walk", "Sunlight", "Water", "Make the bed"]);

export interface LandscapeChooserProps {
  landscape: LandscapeApi;
  disabled?: boolean;
}

export function LandscapeChooser({ landscape, disabled = false }: LandscapeChooserProps) {
  const [query, setQuery] = React.useState("");
  const [habitSheetOpen, setHabitSheetOpen] = React.useState(false);

  const recommended = landscape.entries.filter((entry) => entry.recommended);
  const trimmed = query.trim().toLowerCase();
  const all = landscape.entries.filter(
    (entry) => trimmed === "" || entry.title.toLowerCase().includes(trimmed),
  );

  const row = (entry: StarterLibraryEntry) => {
    const inLibrary = landscape.existingTitles.has(entry.title.toLowerCase());
    return (
      <li key={entry.title} className="flex items-center justify-between gap-(--space-3) py-(--space-2)">
        <CheckboxField
          checked={inLibrary || landscape.ticked.has(entry.title)}
          disabled={disabled || inLibrary}
          onCheckedChange={(next) => landscape.toggle(entry, next === true)}
        >
          {entry.title}
          {inLibrary ? (
            <Text as="span" variant="caption" tone="secondary" className="ms-(--space-2)">
              {COPY.inLibrary}
            </Text>
          ) : null}
        </CheckboxField>
        <Text as="span" variant="caption" tone="secondary" className="tabular-nums">
          {COPY.range(entry.rangeMin, entry.rangeMax)}
        </Text>
      </li>
    );
  };

  const addYourOwn = (
    <Button variant="ghost" className="self-start" disabled={disabled} onClick={() => setHabitSheetOpen(true)}>
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
        <TabsTrigger value="selected">{COPY.tabSelected(landscape.count)}</TabsTrigger>
      </TabsList>

      <TabsContent value="recommended" className="flex flex-col gap-(--space-4)">
        <section className="flex flex-col gap-(--space-1)">
          <GroupHeading>{COPY.groupBody}</GroupHeading>
          <ul className="flex flex-col">{recommended.filter((entry) => BODY.has(entry.title)).map(row)}</ul>
        </section>
        <section className="flex flex-col gap-(--space-1)">
          <GroupHeading>{COPY.groupMind}</GroupHeading>
          <ul className="flex flex-col">{recommended.filter((entry) => !BODY.has(entry.title)).map(row)}</ul>
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
          <ul className="flex flex-col">{all.map(row)}</ul>
        )}
        {addYourOwn}
      </TabsContent>

      <TabsContent value="selected" className="flex flex-col gap-(--space-3)">
        {landscape.selected.length === 0 ? (
          <Text as="p" tone="secondary">
            {COPY.nothingSelected}
          </Text>
        ) : (
          <ul className="flex flex-col">
            {landscape.selected.map((item) => (
              <ListRow
                key={item.key}
                as="li"
                layout="wide"
                title={item.title}
                meta={item.rangeMin === null || item.rangeMax === null ? undefined : COPY.range(item.rangeMin, item.rangeMax)}
                trailing={
                  <span className="flex flex-col gap-(--space-2)">
                    <Stepper17
                      label={`${COPY.priority}: ${item.title}`}
                      value={item.priority as Stepper17Value}
                      onChange={(next) => landscape.setPriority(item.key, next)}
                      disabled={disabled || item.existing}
                      classes={{ label: "sr-only" }}
                    />
                    <MinutesStepper
                      label={`${COPY.length}: ${item.title}`}
                      value={item.durationMin}
                      onChange={(next) => landscape.setLength(item.key, next, item.existing)}
                      min={DURATION_MIN}
                      max={DURATION_MAX}
                      step={5}
                      disabled={disabled}
                    />
                  </span>
                }
              />
            ))}
          </ul>
        )}
        {addYourOwn}
      </TabsContent>

      <HabitSheet
        open={habitSheetOpen}
        mode="create"
        defaults={{ blockKind: "morning" }}
        onOpenChange={setHabitSheetOpen}
        onSaved={() => void landscape.refresh()}
      />
    </Tabs>
  );
}
