"use client";

import * as React from "react";

import {
  ArchivedSection,
  Button,
  EllipsesMenu,
  GroupHeading,
  ListRow,
  SkeletonRow,
  StatusLine,
  Text,
} from "@syn/ui";
import type { MissTier, ReasonView } from "@syn/types";

import { REMINDER_COPY as COPY } from "@/components/reminder-prompt";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc } from "@/lib/trpc/client";

import { ReasonSheet } from "./reason-sheet";

/**
 * ST-06 — the reasons the Day Review and the shift will offer.
 *
 * THE THREE HEADINGS ARE THE TIER DEFINITIONS, not labels above groups. A
 * person reading *Something came up — counts as done for the record* has
 * learned the whole scoring rule for that tier in one line, which is why the
 * screen needs no explanation above it beyond the intro sentence.
 *
 * THERE IS NO DRAG AND NO MOVE-BETWEEN-GROUPS. A reason's tier is what it
 * MEANS, not where it sits, and dragging a row between headings would make a
 * meaning change look like a sort. It is edited in the sheet, where the three
 * definitions are visible next to the choice.
 *
 * *ARCHIVE* IS ABSENT ON THE TWO STRUCTURAL ROWS rather than present and
 * disabled — a greyed control is a thing you can fail to use, and these are
 * things that do not apply.
 */
export function ReasonsScreen() {
  const online = useOnline();
  const utils = trpc.useUtils();

  const list = trpc.reason.list.useQuery();
  const archive = trpc.reason.archive.useMutation();

  const [sheet, setSheet] = React.useState<{
    reason: ReasonView | null;
    structural: boolean;
  } | null>(null);

  if (list.isLoading) {
    return (
      <div className="flex flex-col gap-(--space-2)">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    );
  }

  const data = list.data;
  const structuralKeys = new Set(["chose_not_to", "other"]);

  const groups: Array<{ tier: MissTier; heading: string }> = [
    { tier: "circumstance", heading: COPY.tierCircumstance },
    { tier: "scoping", heading: COPY.tierScoping },
    { tier: "chose_not_to", heading: COPY.tierChoseNotTo },
  ];

  function setArchived(key: string, archived: boolean): void {
    void archive
      .mutateAsync({ key, archived })
      .then(() => utils.reason.list.invalidate());
  }

  return (
    <div className="flex flex-col gap-(--space-5)">
      {!online ? <StatusLine variant="offline" placement="inline" /> : null}

      <Text as="p" tone="secondary">
        {COPY.reasonsIntro}
      </Text>

      <div className="flex justify-start">
        <Button
          variant="secondary"
          disabled={!online}
          onClick={() => setSheet({ reason: null, structural: false })}
        >
          {COPY.add}
        </Button>
      </div>

      {groups.map((group) => {
        const rows = data?.byTier[group.tier] ?? [];
        // *Other* is rendered in its own tier's group, since it has no tier of
        // its own and the service returns it separately.
        const withOther =
          group.tier === "chose_not_to" && data?.other
            ? [...rows, data.other]
            : rows;

        if (withOther.length === 0) return null;

        return (
          <section key={group.tier} className="flex flex-col gap-(--space-2)">
            <GroupHeading>{group.heading}</GroupHeading>
            <ul className="flex flex-col">
              {withOther.map((reason) => {
                const structural = structuralKeys.has(reason.key);
                return (
                  <ListRow
                    key={reason.key}
                    as="li"
                    title={reason.label}
                    tag={reason.builtIn ? COPY.defaultTag : undefined}
                    onClick={() => setSheet({ reason, structural })}
                    trailing={
                      structural ? undefined : (
                        <EllipsesMenu
                          label={`More actions for ${reason.label}`}
                          disabled={!online}
                          items={[
                            {
                              label: COPY.archive,
                              onClick: () => setArchived(reason.key, true),
                            },
                          ]}
                        />
                      )
                    }
                  />
                );
              })}
            </ul>
          </section>
        );
      })}

      <Text as="p" variant="caption" tone="secondary">
        {COPY.tradedUpLine}
      </Text>

      {data && data.archived.length > 0 ? (
        <ArchivedSection count={data.archived.length}>
          <ul className="flex flex-col">
            {data.archived.map((reason) => (
              <ListRow
                key={reason.key}
                as="li"
                muted
                title={reason.label}
                trailing={
                  <Button
                    variant="ghost"
                    disabled={!online}
                    onClick={() => setArchived(reason.key, false)}
                  >
                    {COPY.restore}
                  </Button>
                }
              />
            ))}
          </ul>
        </ArchivedSection>
      ) : null}

      <ReasonSheet
        open={sheet !== null}
        reason={sheet?.reason ?? null}
        structural={sheet?.structural ?? false}
        onOpenChange={(next) => {
          if (!next) setSheet(null);
        }}
      />
    </div>
  );
}
