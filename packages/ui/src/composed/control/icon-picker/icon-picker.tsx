/**
 * IconPicker — one icon picker, a step inside whichever sheet opens it
 * (USE-11; D-USE-35, D-USE-36). Back on the left returns to that sheet; it is
 * never a second sheet.
 *
 * Two tabs of one height, Emoji and Icon, that work the same way: search,
 * "Suggested for <name>", Recent, Everyday, then every group, with a pinned
 * group bar at the foot. The Icon tab adds the colour rows above, and draws
 * every icon in the picked colour. One tap picks and hands the pick back.
 *
 * DATA AND CALLBACKS ONLY. Suggestions come from `suggest` (the app passes
 * `suggestIcons` over the name), Recent and Saved colours from props, every
 * change out through callbacks. Search and Suggested run here, on the
 * device; the two sets load lazily from our own origin and bundle when the
 * picker mounts (`icon-sets.ts`), so nothing is fetched while typing.
 *
 * An icon is handed back as `{ kind: "lucide", value: <name>, color }`, the
 * colour a kind key or `#rrggbb`; an emoji as its character.
 */
"use client";

import * as React from "react";
import {
  Car,
  ChevronLeft,
  Clock,
  Flag,
  Hash,
  Leaf,
  Lightbulb,
  Smile,
  Star,
  User,
  UtensilsCrossed,
  Volleyball,
  type LucideIcon,
} from "lucide-react";
import type { CategoryKey, IconValue } from "@syn/types";
import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../primitives/control/tabs";
import { Skeleton } from "../../../primitives/display/skeleton";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "../../../primitives/feedback/popover";
import { Text } from "../../../primitives/typography/text";
import { SearchField } from "../search-field";
import {
  IconColourRows,
  isKind,
  KIND_INK,
  useLongPress,
  type ColourPanel,
  type SavedColour,
} from "./icon-colour-rows";
import {
  emojiKey,
  EVERYDAY_EMOJI,
  EVERYDAY_ICONS,
  loadEmojiSet,
  loadIconSet,
  searchEntries,
  type EmojiSet,
  type IconSet,
  type PickerEntry,
} from "./icon-sets";
import {
  cellRows,
  GroupBar,
  PickerGrid,
  type GridRow,
  type GroupBarItem,
  type PickerGridHandle,
} from "./picker-grid";

export type IconPick =
  | { kind: "emoji"; value: string }
  | { kind: "lucide"; value: string; color: string };

export type IconPickerTab = "emoji" | "icon";

export interface IconSuggestCandidate {
  id: string;
  keywords: readonly string[];
}

/** Where the picker opens: every drawn state is reachable (canon C-P08). */
export interface IconPickerInitial {
  tab?: IconPickerTab;
  panel?: ColourPanel;
  editing?: boolean;
  /** The hex field's text when a panel opens. */
  hexText?: string;
}

export interface IconPickerProps {
  /** The item's name; empty or null shows "Add a name first to see suggestions." */
  name: string | null;
  value: IconValue | null;
  backLabel: string;
  onBack: () => void;
  onPick: (pick: IconPick) => void;
  /** A colour changed without a new icon: the current icon in that colour. */
  onRecolour?: (color: string) => void;
  /** The name's matches in a set, best first, at most five. */
  suggest: (entries: readonly IconSuggestCandidate[]) => readonly string[];
  recent?: { emoji: readonly string[]; icon: readonly string[] };
  savedColours: readonly SavedColour[];
  onSaveColour: (hex: string) => void;
  onUpdateColour: (id: string, hex: string) => void;
  onRemoveColour: (id: string) => void;
  /** Where the Emojibase data is served from; our own origin. */
  emojiDataUrl?: string;
  initial?: IconPickerInitial;
  className?: string;
}

export const ICON_PICKER_WORDS = {
  title: "Icon",
  emoji: "Emoji",
  icon: "Icon",
  searchEmoji: "Search emoji",
  searchIcons: "Search icons",
  suggested: "Suggested",
  suggestedFor: (name: string) => `Suggested for ${name}`,
  matched: "Matched from the name, on this phone",
  noName: "Add a name first to see suggestions.",
  noMatch: "Nothing matched the name.",
  recent: "Recent",
  everyday: "Everyday",
  results: "Results",
  nothing: (query: string) => `Nothing for “${query}”.`,
  loadFailed: "The set could not be loaded.",
  retry: "Try again",
  back: (label: string) => `Back to ${label}`,
};

/** The colour an icon is drawn in before one is picked. */
const DEFAULT_COLOUR: CategoryKey = "leaf";

export function IconPicker({
  name,
  value,
  backLabel,
  onBack,
  onPick,
  onRecolour,
  suggest,
  recent = { emoji: [], icon: [] },
  savedColours,
  onSaveColour,
  onUpdateColour,
  onRemoveColour,
  emojiDataUrl = "/emoji/en",
  initial,
  className,
}: IconPickerProps) {
  const [tab, setTab] = React.useState<IconPickerTab>(
    initial?.tab ?? (value?.kind === "lucide" ? "icon" : "emoji"),
  );
  const [colour, setColour] = React.useState(
    value?.kind === "lucide" ? value.color : DEFAULT_COLOUR,
  );
  const [panel, setPanel] = React.useState<ColourPanel>(initial?.panel ?? null);
  const [editing, setEditing] = React.useState(initial?.editing ?? false);
  const [lastCustom, setLastCustom] = React.useState<string | null>(null);

  const emoji = useSet(() => loadEmojiSet(emojiDataUrl));
  const icons = useSet(loadIconSet);

  const trimmed = name?.trim() ?? "";

  function recolour(next: string) {
    setColour(next);
    if (!isKind(next)) setLastCustom(next);
    onRecolour?.(next);
  }

  return (
    <div
      className={cn("flex h-full min-h-0 flex-col gap-(--space-3)", className)}
    >
      <div className="flex flex-col gap-(--space-1)">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          aria-label={ICON_PICKER_WORDS.back(backLabel)}
          className="-ms-(--space-3) gap-(--space-1) self-start"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
          {backLabel}
        </Button>
        <Text as="h2" variant="heading">
          {ICON_PICKER_WORDS.title}
        </Text>
      </div>

      <Tabs
        value={tab}
        onValueChange={(next) => setTab(next as IconPickerTab)}
        className="flex min-h-0 flex-1 flex-col gap-(--space-3)"
      >
        <TabsList className="h-(--target) w-full shrink-0">
          <TabsTrigger value="emoji">{ICON_PICKER_WORDS.emoji}</TabsTrigger>
          <TabsTrigger value="icon">{ICON_PICKER_WORDS.icon}</TabsTrigger>
        </TabsList>

        <TabsContent
          value="emoji"
          className="flex min-h-0 flex-col gap-(--space-3)"
        >
          <SetPane
            state={emoji}
            searchLabel={ICON_PICKER_WORDS.searchEmoji}
            name={trimmed}
            suggest={suggest}
            recent={recent.emoji}
            everyday={EVERYDAY_EMOJI}
            isPicked={(entry) =>
              value?.kind === "emoji" &&
              emojiKey(value.value) === emojiKey(entry.id)
            }
            onPick={(id) => onPick({ kind: "emoji", value: id })}
            renderGlyph={(entry) => (
              <span
                aria-hidden="true"
                className="font-emoji text-[1.5rem] leading-none"
              >
                {entry.id}
              </span>
            )}
          />
        </TabsContent>

        <TabsContent
          value="icon"
          className="flex min-h-0 flex-col gap-(--space-3)"
        >
          <IconColourRows
            colour={colour}
            onColour={recolour}
            onCustomDone={(hex) => {
              recolour(hex);
              if (!savedColours.some((s) => s.hex === hex)) onSaveColour(hex);
            }}
            saved={savedColours}
            onUpdateSaved={(id, hex) => {
              const old = savedColours.find((s) => s.id === id);
              onUpdateColour(id, hex);
              if (old && old.hex === colour) recolour(hex);
            }}
            onRemoveSaved={onRemoveColour}
            panel={panel}
            onPanel={setPanel}
            editing={editing}
            onEditing={setEditing}
            hexText={initial?.hexText}
            customStart={lastCustom ?? savedColours[0]?.hex ?? "#2f6f62"}
          />
          <SetPane
            state={icons}
            searchLabel={ICON_PICKER_WORDS.searchIcons}
            name={trimmed}
            suggest={suggest}
            recent={recent.icon}
            everyday={EVERYDAY_ICONS}
            isPicked={(entry) =>
              value?.kind === "lucide" && value.value === entry.id
            }
            onPick={(id) =>
              onPick({ kind: "lucide", value: id, color: colour })
            }
            renderGlyph={(entry, set) => {
              const Drawing =
                set.kind === "icon" ? set.draw(entry.id) : undefined;
              return Drawing ? (
                <Drawing
                  aria-hidden="true"
                  size={22}
                  strokeWidth={1.75}
                  className={isKind(colour) ? KIND_INK[colour] : undefined}
                  style={isKind(colour) ? undefined : { color: colour }}
                />
              ) : null;
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

type SetState<T> =
  | { status: "loading" }
  | { status: "error"; retry: () => void }
  | { status: "ready"; set: T };

function useSet<T>(load: () => Promise<T>): SetState<T> {
  const [attempt, setAttempt] = React.useState(0);
  const [state, setState] = React.useState<SetState<T>>({ status: "loading" });
  const loadRef = React.useRef(load);
  loadRef.current = load;

  React.useEffect(() => {
    let live = true;
    setState({ status: "loading" });
    loadRef.current().then(
      (set) => live && setState({ status: "ready", set }),
      () =>
        live &&
        setState({ status: "error", retry: () => setAttempt((n) => n + 1) }),
    );
    return () => {
      live = false;
    };
  }, [attempt]);

  return state;
}

interface SetPaneProps {
  state: SetState<EmojiSet | IconSet>;
  searchLabel: string;
  name: string;
  suggest: IconPickerProps["suggest"];
  recent: readonly string[];
  everyday: readonly string[];
  isPicked: (entry: PickerEntry) => boolean;
  onPick: (id: string) => void;
  renderGlyph: (entry: PickerEntry, set: EmojiSet | IconSet) => React.ReactNode;
}

function SetPane({
  state,
  searchLabel,
  name,
  suggest,
  recent,
  everyday,
  isPicked,
  onPick,
  renderGlyph,
}: SetPaneProps) {
  const [query, setQuery] = React.useState("");
  const [current, setCurrent] = React.useState<string | null>(null);
  const grid = React.useRef<PickerGridHandle>(null);
  const set = state.status === "ready" ? state.set : null;

  const lookup = React.useCallback(
    (id: string) =>
      set?.kind === "emoji" ? set.byId.get(emojiKey(id)) : set?.byId.get(id),
    [set],
  );

  const all = React.useMemo(
    () => set?.groups.flatMap((group) => group.entries) ?? [],
    [set],
  );

  const suggested = React.useMemo(() => {
    if (!set || name === "") return [];
    return suggest(all)
      .map(lookup)
      .filter((entry): entry is PickerEntry => entry !== undefined);
  }, [set, name, all, suggest, lookup]);

  const rows = React.useMemo<GridRow[]>(() => {
    if (!set) return [];
    const needle = query.trim();
    if (needle !== "") {
      const found = searchEntries(all, needle);
      return found.length === 0
        ? [
            {
              kind: "note",
              key: "none",
              text: ICON_PICKER_WORDS.nothing(needle),
            },
          ]
        : [
            {
              kind: "heading",
              key: "results",
              text: ICON_PICKER_WORDS.results,
            },
            ...cellRows("results", found),
          ];
    }

    const out: GridRow[] = [];
    if (name === "") {
      out.push(
        {
          kind: "heading",
          key: "suggested",
          text: ICON_PICKER_WORDS.suggested,
        },
        { kind: "note", key: "suggested-note", text: ICON_PICKER_WORDS.noName },
      );
    } else {
      out.push({
        kind: "heading",
        key: "suggested",
        text: ICON_PICKER_WORDS.suggestedFor(name),
      });
      out.push(
        ...(suggested.length > 0 ? cellRows("suggested", suggested) : []),
        {
          kind: "note",
          key: "suggested-note",
          text:
            suggested.length > 0
              ? ICON_PICKER_WORDS.matched
              : ICON_PICKER_WORDS.noMatch,
        },
      );
    }
    out.push({ kind: "rule", key: "rule" });

    const recentEntries = recent
      .map(lookup)
      .filter((entry): entry is PickerEntry => entry !== undefined);
    if (recentEntries.length > 0) {
      out.push(
        {
          kind: "heading",
          key: "recent",
          text: ICON_PICKER_WORDS.recent,
          section: "recent",
        },
        ...cellRows("recent", recentEntries),
      );
    }
    const everydayEntries = everyday
      .map(lookup)
      .filter((entry): entry is PickerEntry => entry !== undefined);
    out.push(
      {
        kind: "heading",
        key: "everyday",
        text: ICON_PICKER_WORDS.everyday,
        section: "everyday",
      },
      ...cellRows("everyday", everydayEntries),
    );
    for (const group of set.groups) {
      out.push(
        {
          kind: "heading",
          key: group.id,
          text: group.title,
          section: group.id,
        },
        ...cellRows(group.id, group.entries),
      );
    }
    return out;
  }, [set, all, query, name, suggested, recent, everyday, lookup]);

  const bar = React.useMemo<GroupBarItem[]>(() => {
    if (!set) return [];
    const items: GroupBarItem[] = [];
    if (recent.length > 0) {
      items.push({
        id: "recent",
        label: ICON_PICKER_WORDS.recent,
        icon: (
          <Clock aria-hidden="true" className="size-5" strokeWidth={1.75} />
        ),
      });
    }
    items.push({
      id: "everyday",
      label: ICON_PICKER_WORDS.everyday,
      icon: <Star aria-hidden="true" className="size-5" strokeWidth={1.75} />,
    });
    for (const group of set.groups) {
      const Drawing =
        set.kind === "icon"
          ? set.draw((group as IconSet["groups"][number]).icon)
          : undefined;
      items.push({
        id: group.id,
        label: group.title,
        icon: Drawing ? (
          <Drawing aria-hidden="true" className="size-5" strokeWidth={1.75} />
        ) : (
          <EmojiGroupIcon id={group.id} />
        ),
      });
    }
    return items;
  }, [set, recent.length]);

  const press = useLongPress();
  const [skinsFor, setSkinsFor] = React.useState<string | null>(null);

  const renderCell = React.useCallback(
    (entry: PickerEntry) => {
      if (!set) return null;
      const picked = isPicked(entry);
      const hasSkins = (entry.skins?.length ?? 0) > 0;
      const cell = (
        <button
          type="button"
          aria-label={entry.label}
          aria-pressed={picked}
          title={entry.label}
          onClick={() => onPick(entry.id)}
          {...(hasSkins ? press(() => setSkinsFor(entry.id)) : {})}
          className={cn(
            "flex size-(--target) items-center justify-center rounded-(--radius) border-2",
            "transition-colors duration-(--dur-state) ease-(--ease-settle)",
            picked ? "border-ink" : "hover:bg-surface border-transparent",
          )}
        >
          {renderGlyph(entry, set)}
        </button>
      );
      if (!hasSkins || skinsFor !== entry.id) return cell;
      return (
        <Popover open onOpenChange={(open) => !open && setSkinsFor(null)}>
          <PopoverAnchor asChild>{cell}</PopoverAnchor>
          <PopoverContent
            side="top"
            className="flex w-auto gap-(--space-1) p-(--space-1) motion-reduce:animate-none"
          >
            {entry.skins!.map((skin) => (
              <button
                key={skin.id}
                type="button"
                aria-label={skin.label}
                title={skin.label}
                onClick={() => {
                  setSkinsFor(null);
                  onPick(skin.id);
                }}
                className="hover:bg-surface flex size-(--target) items-center justify-center rounded-(--radius)"
              >
                <span
                  aria-hidden="true"
                  className="font-emoji text-[1.5rem] leading-none"
                >
                  {skin.id}
                </span>
              </button>
            ))}
          </PopoverContent>
        </Popover>
      );
    },
    [set, isPicked, onPick, renderGlyph, press, skinsFor],
  );

  const onSectionChange = React.useCallback(
    (section: string | null) => setCurrent(section),
    [],
  );

  return (
    <>
      <SearchField
        aria-label={searchLabel}
        placeholder={searchLabel}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onClear={() => setQuery("")}
        className="shrink-0"
      />

      {state.status === "loading" ? (
        <div
          aria-hidden="true"
          className="flex flex-1 flex-col gap-(--space-3)"
        >
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      ) : state.status === "error" ? (
        <div className="flex flex-1 flex-col items-start gap-(--space-2)">
          <Text as="p" variant="secondary">
            {ICON_PICKER_WORDS.loadFailed}
          </Text>
          <Button variant="secondary" size="sm" onClick={state.retry}>
            {ICON_PICKER_WORDS.retry}
          </Button>
        </div>
      ) : (
        <>
          <PickerGrid
            ref={grid}
            rows={rows}
            renderCell={renderCell}
            onSectionChange={onSectionChange}
            label={searchLabel}
          />
          {query.trim() === "" ? (
            <GroupBar
              items={bar}
              current={current ?? "everyday"}
              onJump={(id) => grid.current?.scrollToSection(id)}
            />
          ) : null}
        </>
      )}
    </>
  );
}

/** The emoji groups' bar icons: line icons, as the boards draw them. */
function EmojiGroupIcon({ id }: { id: string }) {
  const Icon = EMOJI_GROUP_ICON[id];
  return Icon ? (
    <Icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
  ) : null;
}

const EMOJI_GROUP_ICON: Record<string, LucideIcon> = {
  "smileys-emotion": Smile,
  "people-body": User,
  "animals-nature": Leaf,
  "food-drink": UtensilsCrossed,
  "travel-places": Car,
  activities: Volleyball,
  objects: Lightbulb,
  symbols: Hash,
  flags: Flag,
};
