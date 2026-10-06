"use client";

import * as React from "react";

import { Button, HelperText, ResponsiveSheet, SelectRow, SelectRowList, SkeletonRow } from "@syn/ui";

import { SheetHost } from "@/components/page-frame";
import { trpc } from "@/lib/trpc/client";

import { DAY_LIST_COPY as COPY } from "./copy";

/**
 * The evening's pool — UX v1.3 §5.3, §6, TD-26 (DAY-12). *Choose when you're
 * there* on the Today tab opens this: the pool's activities with their
 * lengths, nothing preselected, several allowed; *Add* calls
 * `day.chooseFromPool`, the chosen become ordinary items in the free-time
 * block, and the sheet closes. It adds; it never removes (*Not today* on an
 * item is how one goes). A closed day refuses with one line.
 */
export function PoolSheet({
  open,
  onOpenChange,
  date,
  templateId,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  templateId: string;
  onAdded: () => void;
}) {
  const utils = trpc.useUtils();
  const detail = trpc.template.get.useQuery({ id: templateId }, { enabled: open });
  const choose = trpc.day.chooseFromPool.useMutation();
  const [chosen, setChosen] = React.useState<ReadonlySet<string>>(new Set());
  const [line, setLine] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setChosen(new Set());
    setLine(null);
  }, [open]);

  const members = (detail.data?.slots ?? []).filter((slot) => slot.role === "pool");

  const add = async () => {
    setLine(null);
    try {
      await choose.mutateAsync({ date, habitIds: [...chosen] });
      await utils.day.get.invalidate({ date });
      onAdded();
      onOpenChange(false);
    } catch (error) {
      setLine(error instanceof Error && error.message === "closed" ? COPY.poolClosed : COPY.poolError);
    }
  };

  return (
    <SheetHost open={open}>
      <ResponsiveSheet
        open={open}
        onOpenChange={onOpenChange}
        title={COPY.chooseWhenThere}
        footer={
          <div className="flex justify-end gap-(--space-2)">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {COPY.cancel}
            </Button>
            <Button busy={choose.isPending} disabled={chosen.size === 0} onClick={() => void add()}>
              {COPY.addChosen(chosen.size)}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-(--space-3)">
          {detail.isLoading ? (
            <SkeletonRow />
          ) : (
            <SelectRowList>
              {members.map((slot) => (
                <SelectRow
                  key={slot.id}
                  icon={slot.icon}
                  title={slot.title}
                  detail={COPY.minutes(slot.durationMin)}
                  selected={chosen.has(slot.habitId)}
                  onToggle={(selected) =>
                    setChosen((current) => {
                      const next = new Set(current);
                      if (selected) next.add(slot.habitId);
                      else next.delete(slot.habitId);
                      return next;
                    })
                  }
                />
              ))}
            </SelectRowList>
          )}
          {line === null ? null : <HelperText error>{line}</HelperText>}
        </div>
      </ResponsiveSheet>
    </SheetHost>
  );
}
