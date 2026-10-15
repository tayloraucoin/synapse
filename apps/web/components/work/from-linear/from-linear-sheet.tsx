"use client";

import * as React from "react";
import type { WorkSize, WorkTier } from "@syn/types";
import {
  Button,
  Checkbox,
  CloseIcon,
  cn,
  LinearStatusShape,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RegionRetry,
  ResponsiveSheet,
  SearchField,
  SkeletonRow,
  Text,
  toastUndo,
  ToggleGroup,
  ToggleGroupItem,
} from "@syn/ui";
import { useDataSource } from "@/lib/data/source";
import { useAccount } from "@/lib/data/use-account";
import { useConnectionsQuery } from "@/lib/data/use-connections";
import { useLinearIssues } from "@/lib/data/use-linear";
import { deriveSetUpDay, type SetUpDay } from "@/lib/data/use-set-up-day";
import { useWeekQuery } from "@/lib/data/use-week";
import { refusalWords, useWorkWrites } from "@/lib/data/use-work-writes";
import type { WeekRecords } from "@/lib/data/week-records";
import { readWeekFit, shortDate, SIZES, weekOf } from "../add/new-task/form";
import { ClientTile } from "../client-tile";
import { FROM_LINEAR_COPY as COPY } from "./copy";
import {
  DEFAULT_FILTERS,
  derivePicker,
  type PickerFilters,
  type PickerGroup,
  type PickerLine,
  type PickerRow,
} from "./picker-view";

/**
 * FromLinearSheet — From Linear on a Work tier's add row (USE-52;
 * add/states/from-linear-by-size.md, D-USE-57, D-USE-77): × on the left, the
 * scope caption over "From Linear", Search, the Assigned to <name>, Not done
 * and Size chips, the snapshot's issues by client with team and project
 * lines, each ticked by its checkbox and showing its points word and length
 * range, an issue already on the date faded with no checkbox, the line above
 * Add and Add to <tier>. Adding writes each issue's work item and its slot
 * in the tier for the date (`placeIssues`), never Linear; a toast names
 * where they went, with Undo. At the desk ResponsiveSheet opens it in the
 * right panel (D-USE-39, D-USE-65).
 */
export interface FromLinearSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateKey: string;
  /** The Work block the add row belongs to. */
  blockId: string;
  tier: WorkTier;
  onAdded?: () => void;
  /** For a capture: rows ticked, filters set, the Size chip open. */
  initial?: {
    ticked?: string[];
    filters?: Partial<PickerFilters>;
    sizeOpen?: boolean;
  };
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

interface WeekRead {
  days: SetUpDay[];
  timeZone: string;
}

function selectWeek(records: WeekRecords): WeekRead {
  return {
    days: records.days.map((day) => deriveSetUpDay(day, records.timeZone)),
    timeZone: records.timeZone,
  };
}

export function FromLinearSheet({
  open,
  onOpenChange,
  dateKey,
  blockId,
  tier,
  onAdded,
  initial,
  returnFocusRef,
}: FromLinearSheetProps) {
  const source = useDataSource();
  const writes = useWorkWrites();
  const linear = useLinearIssues();
  const connections = useConnectionsQuery();
  const weekQuery = useWeekQuery(weekOf(dateKey).key, selectWeek);
  const week = weekQuery.data;
  const personName = (useAccount().data?.name ?? "").split(" ")[0] ?? "";
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  const freshFilters = () => ({ ...DEFAULT_FILTERS, ...initial?.filters });
  const [filters, setFilters] = React.useState<PickerFilters>(freshFilters);
  const [ticked, setTicked] = React.useState<string[]>(
    () => initial?.ticked ?? [],
  );
  const [sizeOpen, setSizeOpen] = React.useState(initial?.sizeOpen ?? false);
  const [error, setError] = React.useState<string | null>(null);

  // Each open starts from the props as they are then.
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setFilters(freshFilters());
      setTicked(initial?.ticked ?? []);
      setSizeOpen(initial?.sizeOpen ?? false);
      setError(null);
    }
  }

  React.useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => headingRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const timeZone = week?.timeZone ?? source.scenario.records.timeZone;
  const fit = readWeekFit({
    days: week?.days ?? [],
    today: source.todayKey(),
    timeZone,
    picked: [],
    blockId,
  });
  const chip = fit.chips.find((c) => c.dateKey === dateKey);
  const blockName = chip?.block?.name ?? "";
  const ready = linear.data && connections.data && week;
  const view = ready
    ? derivePicker({
        linear: linear.data!,
        connections: connections.data!,
        day: week!.days.find((d) => d.date === dateKey),
        fit: fit.days.get(dateKey),
        blockName,
        dateKey,
        tier,
        timeZone,
        filters,
        ticked,
        personName,
      })
    : null;
  const failed = linear.isError || connections.isError || weekQuery.isError;

  function toggle(issueId: string) {
    setError(null);
    setTicked((now) =>
      now.includes(issueId)
        ? now.filter((id) => id !== issueId)
        : [...now, issueId],
    );
  }

  async function add() {
    if (!view || view.ticked.length === 0) return;
    try {
      const done = await writes.placeIssues({
        issueIds: view.ticked,
        dateKey,
        blockId,
        tier,
      });
      onOpenChange(false);
      onAdded?.();
      toastUndo({
        text: COPY.added(COPY.tiers[tier], shortDate(dateKey)),
        onUndo: () => void writes.undo(done.undo),
      });
    } catch (cause) {
      setError(refusalWords(cause) ?? COPY.notAdded);
    }
  }

  const lineId = React.useId();
  const header = (
    <div className="flex min-w-0 flex-1 flex-col">
      <Button
        variant="ghost"
        size="icon"
        aria-label={COPY.close}
        onClick={() => onOpenChange(false)}
        className="text-foreground -ms-(--space-3) self-start"
      >
        <CloseIcon aria-hidden="true" />
      </Button>
      <Text as="p" variant="caption" tone="muted">
        {view?.context ??
          COPY.context(shortDate(dateKey), blockName, COPY.tiers[tier])}
      </Text>
      <Text
        ref={headingRef}
        as="h2"
        variant="heading"
        tabIndex={-1}
        className="outline-none"
      >
        {COPY.title}
      </Text>
    </div>
  );

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={COPY.title}
      header={header}
      headerAction={null}
      initialFocus="first-field"
      returnFocusRef={returnFocusRef}
      size="tall"
      classes={{
        header: "pt-(--space-2)",
        body: "flex flex-col gap-(--space-3) pt-(--space-3)",
        footer: "border-t-0",
      }}
      footer={
        <div className="flex flex-col gap-(--space-3)">
          {view?.line ? (
            <Text
              as="p"
              id={lineId}
              variant="secondary"
              aria-live="polite"
              data-fit-line=""
            >
              {view.line}
            </Text>
          ) : null}
          {error === null ? null : (
            <Text as="p" variant="secondary" role="alert">
              {error}
            </Text>
          )}
          <Button
            size="lg"
            className="w-full"
            aria-describedby={view?.line ? lineId : undefined}
            disabled={!view || view.ticked.length === 0 || writes.isPending}
            onClick={() => void add()}
          >
            {COPY.addTo(COPY.tiers[tier])}
          </Button>
        </div>
      }
    >
      <SearchField
        aria-label={COPY.search}
        placeholder={COPY.search}
        value={filters.query}
        onChange={(event) =>
          setFilters({ ...filters, query: event.target.value })
        }
        onClear={() => setFilters({ ...filters, query: "" })}
      />
      <Filters
        personName={personName}
        filters={filters}
        onChange={setFilters}
        sizeOpen={sizeOpen}
        onSizeOpen={setSizeOpen}
      />
      {failed ? (
        <RegionRetry
          label={COPY.failed}
          onRetry={() => {
            void linear.refetch();
            void connections.refetch();
            void weekQuery.refetch();
          }}
        />
      ) : !view ? (
        <div aria-busy="true" aria-label={COPY.loading}>
          {[0, 1, 2, 3].map((n) => (
            <SkeletonRow key={n} className="px-0" />
          ))}
        </div>
      ) : view.groups.length === 0 ? (
        // At the top of the list, never centred (A-08).
        <Text as="p" variant="body" tone="muted">
          {filters.query.trim() === ""
            ? COPY.nothing
            : COPY.noMatch(filters.query.trim())}
        </Text>
      ) : (
        <div className="flex flex-col gap-(--space-3)">
          {view.groups.map((group) => (
            <Group key={group.key} group={group} onToggle={toggle} />
          ))}
        </div>
      )}
    </ResponsiveSheet>
  );
}

const CHIP =
  "inline-flex h-8 items-center rounded-full border px-(--space-3) text-(length:--fs-caption) font-medium";

function Filters({
  personName,
  filters,
  onChange,
  sizeOpen,
  onSizeOpen,
}: {
  personName: string;
  filters: PickerFilters;
  onChange: (next: PickerFilters) => void;
  sizeOpen: boolean;
  onSizeOpen: (open: boolean) => void;
}) {
  const sizesOn = filters.sizes.length > 0;
  const chipLook = (on: boolean) =>
    cn(
      CHIP,
      on
        ? "border-ink text-foreground"
        : "border-hairline text-muted-foreground",
    );
  return (
    <div
      role="group"
      aria-label={COPY.filters}
      className="flex flex-wrap gap-(--space-2)"
    >
      <button
        type="button"
        aria-pressed={filters.assigned}
        className={chipLook(filters.assigned)}
        onClick={() => onChange({ ...filters, assigned: !filters.assigned })}
      >
        {COPY.assignedTo(personName)}
      </button>
      <button
        type="button"
        aria-pressed={filters.notDone}
        className={chipLook(filters.notDone)}
        onClick={() => onChange({ ...filters, notDone: !filters.notDone })}
      >
        {COPY.notDone}
      </button>
      <Popover open={sizeOpen} onOpenChange={onSizeOpen}>
        <PopoverTrigger asChild>
          <button type="button" className={chipLook(sizesOn)}>
            {sizesOn
              ? COPY.sizePicked(
                  filters.sizes.map((s) => COPY.sizes[s]).join(", "),
                )
              : COPY.size}
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-(--space-2)">
          {/* The five words, any number at once [ASSUMPTION, D-USE-77]. */}
          <ToggleGroup
            type="multiple"
            aria-label={COPY.sizeChoices}
            value={filters.sizes}
            onValueChange={(next) =>
              onChange({
                ...filters,
                sizes: SIZES.filter((s) => next.includes(s)) as WorkSize[],
              })
            }
            className="flex flex-col items-stretch gap-(--space-1)"
          >
            {SIZES.map((size) => (
              <ToggleGroupItem
                key={size}
                value={size}
                className="justify-start rounded-(--radius) border border-transparent px-(--space-3) data-[state=on]:border-ink data-[state=on]:bg-transparent"
              >
                {COPY.sizes[size]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function Group({
  group,
  onToggle,
}: {
  group: PickerGroup;
  onToggle: (issueId: string) => void;
}) {
  const headId = React.useId();
  return (
    <section aria-labelledby={group.head ? headId : undefined}>
      {group.head ? (
        <h3
          id={headId}
          className="text-caption text-muted-foreground flex h-7 items-center gap-(--space-2) font-semibold"
        >
          {group.head.hue ? (
            <ClientTile letter={group.head.letter} hue={group.head.hue} />
          ) : null}
          {group.head.name}
        </h3>
      ) : null}
      {group.lines.map((line) => (
        <Line key={line.key} line={line} onToggle={onToggle} />
      ))}
    </section>
  );
}

function Line({
  line,
  onToggle,
}: {
  line: PickerLine;
  onToggle: (issueId: string) => void;
}) {
  const parts = [
    line.workspace,
    line.team
      ? [line.team.emoji, line.team.name].filter(Boolean).join(" ")
      : null,
    line.project
      ? [line.project.emoji, line.project.name].filter(Boolean).join(" ")
      : null,
  ].filter((part): part is string => part !== null);
  return (
    <div>
      {parts.length > 0 ? (
        <p className="text-caption text-text-muted flex h-6 items-center truncate">
          {parts.join(" · ")}
        </p>
      ) : null}
      <ul className="flex flex-col">
        {line.rows.map((row) => (
          <IssueRow key={row.issueId} row={row} onToggle={onToggle} />
        ))}
      </ul>
    </div>
  );
}

function IssueRow({
  row,
  onToggle,
}: {
  row: PickerRow;
  onToggle: (issueId: string) => void;
}) {
  const id = React.useId();
  return (
    <li
      data-issue={row.identifier}
      data-placed={row.placed || undefined}
      className={cn(
        "border-hairline flex min-h-(--row-min) items-center gap-(--space-3) border-b py-(--space-2)",
        // Placed rows stay, faded (as the pool's); the words keep 4.5:1.
        row.placed && "opacity-60",
      )}
    >
      {row.placed ? (
        // No checkbox to tick: one item, one block a day.
        <span aria-hidden="true" className="size-5 shrink-0" />
      ) : (
        <Checkbox
          id={id}
          checked={row.ticked}
          onCheckedChange={() => onToggle(row.issueId)}
        />
      )}
      <span
        aria-hidden="true"
        className="inline-flex w-5 shrink-0 justify-center"
      >
        {row.icon.kind === "emoji" ? (
          <span className="font-emoji">{row.icon.emoji}</span>
        ) : (
          <LinearStatusShape
            type={row.icon.type}
            label={row.icon.label}
            progress={row.icon.progress}
            color={row.icon.color}
          />
        )}
      </span>
      <label
        htmlFor={row.placed ? undefined : id}
        className={cn(
          "flex min-h-(--target) min-w-0 flex-1 flex-col justify-center",
          !row.placed && "cursor-pointer",
        )}
      >
        <Text as="span" className="truncate">
          {row.title}
        </Text>
        <Text as="span" variant="secondary" tone="muted" className="truncate">
          {row.meta}
        </Text>
      </label>
      {row.placed ? null : (
        <Text
          as="span"
          variant="secondary"
          tone="muted"
          className="shrink-0 whitespace-nowrap"
        >
          {row.sizeWord}
        </Text>
      )}
    </li>
  );
}
