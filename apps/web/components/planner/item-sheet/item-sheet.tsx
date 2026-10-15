"use client";

/**
 * ItemSheet — one item of today, changed without leaving the day (USE-64;
 * day/item-sheet). Opened at `?sheet=item&id=<item>` over the screen beneath:
 * a bottom sheet at 402, `ResponsiveSheet`'s right panel at `--sheet-w` at
 * the desk (D-USE-103).
 *
 * NO SAVE (D-USE-60, C-USE-item-sheet-1). Each field saves as made, for
 * today only, through `useItemSheet`; the usual week changes only through
 * ··· › Make it <weekday>'s usual, with Undo in the toast.
 *
 * STEPS, NEVER A SECOND SHEET. The icon tile opens USE-11's IconPickerStep
 * inside this sheet with "‹ <name>" on the left, and back returns focus to
 * the tile. Swap opens SwapStep in place, × alone in its header as drawn
 * (swap.md): one tap picks and closes, × closes with nothing changed.
 *
 * FOCUS. On open it moves to the item's name (a heading); × and Escape close
 * to the screen beneath, focus back on the opener (C-USE-item-sheet-5).
 *
 * A work item's id hands the sheet to WorkItemSheet (USE-65), which keeps
 * this route, close and focus return.
 *
 * A scenario's `view.open` stands a capture in a step (`item:more`,
 * `item:swap`, `item:icon`); `&view=swap` in the route opens Swap, as Now's
 * long-press Swap does.
 */
import * as React from "react";
import { parseAsString, useQueryStates } from "nuqs";
import type { IconValue } from "@syn/types";
import {
  Button,
  CloseIcon,
  MoveToIcon,
  NotTodayIcon,
  ResponsiveSheet,
  SetMyDaysIcon,
  Text,
  toastUndo,
} from "@syn/ui";
import { useDataSource } from "@/lib/data/source";
import {
  useIsWorkItem,
  useItemSheet,
  type SwapRow,
} from "@/lib/data/use-item-sheet";
import { IconPickerStep } from "../icon-picker-step";
import { NowBlockMenu } from "../now-block-menu";
import { ITEM_SHEET_COPY as COPY } from "./copy";
import { PlainItemFields } from "./plain-item-fields";
import { SwapStep } from "./swap-step";
import { WorkItemSheet } from "./work-item-sheet";

type Step = "fields" | "icon" | "swap";

export interface ItemSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Where focus goes on close when the opener (a menu row) is gone. */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
  /** ··· › Move to…: USE-69's step; absent, the row waits for it. */
  onMoveTo?: (id: string) => void;
}

/** `view.open` from a scenario: "item:<start>". */
function seededStart(open: string | undefined): "more" | Step | null {
  if (open === undefined || !open.startsWith("item:")) return null;
  const start = open.slice("item:".length);
  return start === "more" || start === "swap" || start === "icon"
    ? start
    : null;
}

export function ItemSheet({
  open,
  onOpenChange,
  returnFocusRef,
  onMoveTo,
}: ItemSheetProps) {
  const { scenario } = useDataSource();
  const [params, setParams] = useQueryStates({
    id: parseAsString,
    view: parseAsString,
  });
  const id = open ? params.id : null;
  const seeded = seededStart(scenario.view?.open);
  const openRef = React.useRef(open);
  openRef.current = open;
  // A copy written while open becomes the sheet's item; after close, nothing.
  const sheet = useItemSheet(id, (copy) => {
    if (openRef.current) void setParams({ id: copy });
  });
  const { view } = sheet;
  // A work item's sheet is its own (USE-65); the route and the close are these.
  const isWork = useIsWorkItem(id);

  const [step, setStep] = React.useState<Step>("fields");
  const [announce, setAnnounce] = React.useState("");
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const iconRef = React.useRef<HTMLButtonElement | null>(null);
  const opener = React.useRef<HTMLElement | null>(null);
  const started = React.useRef(false);

  // Where focus goes back to: the row that opened the sheet, if still there.
  React.useEffect(() => {
    if (!open) {
      started.current = false;
      return;
    }
    if (
      opener.current === null &&
      document.activeElement instanceof HTMLElement
    ) {
      opener.current = document.activeElement;
    }
  }, [open]);

  // The start, once per opening: Swap by the route or a capture's step.
  React.useEffect(() => {
    if (!open || started.current) return;
    started.current = true;
    if (params.view === "swap" || seeded === "swap") setStep("swap");
    else if (seeded === "icon") setStep("icon");
    else setStep("fields");
  }, [open, params.view, seeded]);

  // Each opening and each step focuses its title; back from the icon step,
  // the tile that opened it (drawn again, so read once it is there).
  const backToTile = React.useRef(false);
  const loaded = view !== null;
  React.useEffect(() => {
    if (!open || !loaded || step === "icon") return;
    const frame = requestAnimationFrame(() => {
      const target = backToTile.current ? iconRef.current : titleRef.current;
      backToTile.current = false;
      target?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open, step, loaded]);

  const returnRef = React.useMemo<React.RefObject<HTMLElement | null>>(
    () => ({
      get current() {
        const mine = opener.current;
        if (mine !== null && mine.isConnected) return mine;
        return returnFocusRef?.current ?? null;
      },
    }),
    [returnFocusRef],
  );

  function close(next: boolean) {
    if (next) return;
    setStep("fields");
    void setParams({ id: null, view: null });
    onOpenChange(false);
    // The opener is read on close; the next opening finds its own.
    requestAnimationFrame(() => {
      opener.current = null;
    });
  }

  function backFromIcon() {
    backToTile.current = true;
    setStep("fields");
  }

  async function pickSwap(row: SwapRow) {
    if (view === null) return;
    if (row.current) {
      close(false);
      return;
    }
    const from = view.item.title;
    close(false);
    const written = await sheet.swap(row);
    if (written === null) return;
    const text = COPY.toast.swapped(from, row.title);
    setAnnounce(text);
    toastUndo({ text, onUndo: () => void sheet.undo(written) });
  }

  async function notToday() {
    if (view === null) return;
    const name = view.item.title;
    close(false);
    const written = await sheet.notToday();
    if (written === null) return;
    toastUndo({
      text: COPY.toast.offToday(name),
      onUndo: () => void sheet.undo(written),
    });
  }

  async function makeUsual() {
    if (view === null) return;
    const { title } = view.item;
    const written = await sheet.makeUsual();
    if (written === null) return;
    const text = COPY.toast.madeUsual(title, view.date);
    setAnnounce(text);
    toastUndo({ text, onUndo: () => void sheet.undo(written) });
  }

  function pickIcon(icon: IconValue) {
    void sheet.setIcon(icon);
    backFromIcon();
  }

  const closeButton = (
    <Button
      variant="ghost"
      size="icon"
      aria-label={COPY.close}
      onClick={() => close(false)}
      className="-ms-(--space-3)"
    >
      <CloseIcon aria-hidden="true" />
    </Button>
  );

  const header =
    view === null || step === "icon" ? null : step === "swap" ? (
      <div className="flex min-w-0 flex-1 items-center">{closeButton}</div>
    ) : (
      <div className="flex min-w-0 flex-1 items-center gap-(--space-2)">
        {closeButton}
        <span className="flex-1" />
        <Button
          variant="ghost"
          className="border-border rounded-full border"
          onClick={() => setStep("swap")}
        >
          {COPY.swap}
        </Button>
        <NowBlockMenu
          label={COPY.more(view.item.title)}
          title={COPY.menu.title(view.item.title)}
          defaultOpen={seeded === "more"}
          rows={[
            {
              label: COPY.menu.moveTo,
              icon: MoveToIcon,
              onSelect: () => onMoveTo?.(view.item.id),
            },
            {
              label: COPY.menu.notToday,
              icon: NotTodayIcon,
              onSelect: () => void notToday(),
            },
            {
              label: COPY.menu.makeUsual(view.date),
              icon: SetMyDaysIcon,
              onSelect: () => void makeUsual(),
              separated: true,
            },
          ]}
        />
      </div>
    );

  if (isWork && id !== null) {
    return (
      <WorkItemSheet
        open={open}
        id={id}
        onClose={() => close(false)}
        returnFocusRef={returnRef}
        seededMore={seeded === "more"}
        onMoveTo={onMoveTo}
      />
    );
  }

  const title = view?.item.title ?? COPY.gone;

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={close}
      title={title}
      header={header}
      // × (or the step's back link) is in the sheet: no second close.
      headerAction={null}
      returnFocusRef={returnRef}
      size="tall"
      classes={{
        header: step === "icon" ? "hidden" : "items-center pt-(--space-2)",
        body: step === "icon" ? "flex flex-col" : "pt-(--space-1)",
      }}
    >
      <span role="status" aria-live="polite" className="sr-only">
        {announce}
      </span>

      {view === null ? (
        sheet.isPending && id !== null ? null : (
          <Text as="p" variant="body" tone="secondary">
            {COPY.gone}
          </Text>
        )
      ) : step === "icon" ? (
        <IconPickerStep
          name={view.item.title}
          value={view.item.icon}
          backLabel={view.item.title}
          onPick={pickIcon}
          onRecolour={(icon) => void sheet.setIcon(icon)}
          onBack={backFromIcon}
        />
      ) : step === "swap" ? (
        <SwapStep
          view={view}
          titleRef={titleRef}
          onPick={(row) => void pickSwap(row)}
        />
      ) : (
        <PlainItemFields
          view={view}
          notes={sheet.notes}
          titleRef={titleRef}
          iconRef={iconRef}
          onIcon={() => setStep("icon")}
          onLength={(lengthMin) => void sheet.setLength(lengthMin)}
          onAtTime={(atTime) => void sheet.setAtTime(atTime)}
          onNotes={sheet.setNotes}
        />
      )}
    </ResponsiveSheet>
  );
}
