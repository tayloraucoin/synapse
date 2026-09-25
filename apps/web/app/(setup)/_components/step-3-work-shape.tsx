"use client";

import * as React from "react";

import { Button, LargeTargetRow, SkeletonRow, Text, TimeField } from "@syn/ui";
import type { AnchorDirection, TemplateSummaryView } from "@syn/types";

import { trpc } from "@/lib/trpc/client";

import { SETUP_COPY as COPY } from "./copy";
import { FactScreen } from "./fact-screen";
import { useCardEntries } from "./use-card-entries";
import { WorkDayTypeCard, type WorkDayTypeSeed } from "./work-day-type-card";

/**
 * Screen 3 — the shape of a work day (UX v1.2 §4.3; TD-14).
 *
 * *Do your work days all look the same?* — *Yes, near enough* (preselected,
 * the document's one default here) · *No, it depends on the day*. Two paths,
 * one component, one radio in state:
 *
 * ON YES the screen is v1.1's §4.3: *Working by* and *Until about* as value +
 * Change + Done, then *what gives* with nothing preselected and the primary
 * disabled until a row is chosen — "this is the one screen whose answer
 * changes the arithmetic everywhere." *Continue* writes the three columns
 * together (the one screen-level write in the sequence: *what gives* has no
 * meaning without its anchor) and calls `template.ensureWork`, so a day plan
 * always has a type to pick.
 *
 * ON NO the times and the question move inside `WorkDayTypeCard`s; each
 * card writes its own template on Done and *Continue* only navigates,
 * counting — *Continue · 2 types*. RUN-3's service gives the profile the
 * first type's values when the profile has none.
 *
 * SWITCHING BACK TO YES LEAVES THE TYPES. They are honest data; Settings →
 * Your day → Work-day types lists them.
 */
export function Step3WorkShape({
  initialWorkStart,
  initialWorkEnd,
  initialDirection,
  initialTypes,
  embedded = false,
  onSaved,
}: {
  initialWorkStart: string | null;
  initialWorkEnd: string | null;
  initialDirection: AnchorDirection | null;
  /** The work templates that exist; more than one, or one with a kind, means *No*. */
  initialTypes: TemplateSummaryView[];
  embedded?: boolean;
  onSaved?: () => void;
}) {
  const save = trpc.user.updatePreferences.useMutation();
  const ensureWork = trpc.template.ensureWork.useMutation();
  const utils = trpc.useUtils();

  const [sameShape, setSameShape] = React.useState<"yes" | "no">(
    initialTypes.length > 1 || initialTypes.some((type) => type.workDayType?.locationKind != null) ? "no" : "yes",
  );
  const [workStart, setWorkStart] = React.useState(initialWorkStart ?? "09:00");
  const [workEnd, setWorkEnd] = React.useState(initialWorkEnd ?? "17:30");
  const [direction, setDirection] = React.useState<AnchorDirection | null>(initialDirection);
  const [openDrafts, setOpenDrafts] = React.useState(0);

  const types = trpc.template.list.useQuery(
    { includeArchived: false, kind: "work" },
    { initialData: initialTypes },
  );
  const typeCount = (types.data ?? []).length;

  const yes = sameShape === "yes";
  const gated = yes ? direction === null : typeCount === 0 || openDrafts > 0;

  return (
    <FactScreen
      step={3}
      heading={COPY.step3Heading}
      body={COPY.step3Body}
      embedded={embedded}
      onSaved={onSaved}
      disabled={gated}
      primaryLabel={yes ? undefined : COPY.continueTypes(typeCount)}
      save={
        yes
          ? async () => {
              if (direction === null) return;
              await save.mutateAsync({
                workStartTime: workStart,
                workEndTime: workEnd,
                anchorDirection: direction,
              });
              await ensureWork.mutateAsync();
              await utils.template.list.invalidate();
            }
          : null
      }
    >
      <div className="flex flex-col gap-(--space-5)">
        <LargeTargetRow
          layout="stacked"
          label={COPY.step3Heading}
          value={sameShape}
          onChange={(value) => setSameShape(value as "yes" | "no")}
          options={[
            { value: "yes", label: COPY.sameShapeYes },
            { value: "no", label: COPY.sameShapeNo },
          ]}
          className="[&>span:first-child]:sr-only"
        />

        {yes ? (
          <>
            <TimeField
              label={COPY.workingBy}
              value={workStart}
              onChange={setWorkStart}
              disclosed
              changeLabel={COPY.change}
              doneLabel={COPY.done}
              required
            />
            <TimeField
              label={COPY.untilAbout}
              value={workEnd}
              onChange={setWorkEnd}
              disclosed
              changeLabel={COPY.change}
              doneLabel={COPY.done}
              required
            />

            <div className="flex flex-col gap-(--space-3)">
              <Text as="h2" variant="body" weight={500}>
                {COPY.whatGives}
              </Text>
              <LargeTargetRow
                layout="stacked"
                label={COPY.whatGives}
                value={direction}
                onChange={(value) => setDirection(value as AnchorDirection)}
                options={[
                  { value: "work_waits", label: COPY.gives.work_waits, description: COPY.gives.work_waitsBody },
                  { value: "routine_cut", label: COPY.gives.routine_cut, description: COPY.gives.routine_cutBody },
                  { value: "depends", label: COPY.gives.depends, description: COPY.gives.dependsBody },
                ]}
                className="[&>span:first-child]:sr-only"
              />
            </div>
          </>
        ) : (
          <WorkDayTypeCards onOpenDraftsChange={setOpenDrafts} />
        )}
      </div>
    </FactScreen>
  );
}

/**
 * The cards, as a list that appends (UX v1.2 §4, the frame rules; §4.3;
 * §4.16). Shared by screen 3's *No* path and Settings → Your day → Work-day
 * types, which mounts it without the radio. Empty: *Nothing yet.* left-aligned
 * and *Add a work-day type* full width; a new card lands last and opens.
 */
export function WorkDayTypeCards({
  onOpenDraftsChange,
}: {
  /** How many appended cards are still open — the screen's primary waits on them. */
  onOpenDraftsChange?: (count: number) => void;
}) {
  const utils = trpc.useUtils();
  const types = trpc.template.list.useQuery({ includeArchived: false, kind: "work" });

  const rows = React.useMemo(() => types.data ?? [], [types.data]);
  // One entry, one key, per card for the life of the screen (DAY-2): Done's create never remounts it.
  const { entries, add, created, removed, pending } = useCardEntries<TemplateSummaryView, WorkDayTypeSeed>(rows);

  React.useEffect(() => {
    onOpenDraftsChange?.(pending);
  }, [pending, onOpenDraftsChange]);

  const refresh = () => utils.template.list.invalidate();

  const addButton = (
    <Button variant="secondary" className="w-full wide:w-auto wide:self-start" onClick={add}>
      {COPY.addAWorkDayType}
    </Button>
  );

  if (types.isLoading) {
    return (
      <div className="flex flex-col gap-(--space-2)">
        <SkeletonRow />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-(--space-3)">
      {entries.length === 0 ? (
        <Text as="p" variant="secondary" tone="secondary">
          {COPY.nothingYet}
        </Text>
      ) : null}

      {entries.map((entry) => (
        <div key={entry.key} data-draft={entry.key}>
          <WorkDayTypeCard
            template={entry.row}
            initiallyOpen={entry.added}
            onSaved={(row) => {
              if (entry.added) created(entry.key, row.id, row);
              void refresh();
            }}
            onRemoved={() => {
              removed(entry.key);
              void refresh();
            }}
            onDiscard={() => removed(entry.key)}
          />
        </div>
      ))}

      {addButton}
    </div>
  );
}
