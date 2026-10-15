"use client";

import * as React from "react";
import type { IconValue } from "@syn/types";
import { IconTile, Input, SegmentedControl, Text } from "@syn/ui";
import type { MealTopicLinkKind } from "@syn/utils";
import { MEAL_TOPICS_COPY } from "./meal-topics-copy";

const COPY = MEAL_TOPICS_COPY.edit;

/**
 * MealTopicEditStep (USE-22): a topic's icon, name and one link, as a step
 * inside the Meal topics sheet. Not drawn [ASSUMPTION: the archived default's
 * note — name, one link (playlist, channel or search words) and the icon
 * tile]. The icon tile opens USE-11's picker as the next step; the sheet
 * holds the draft and the Save in its footer.
 */

export interface MealTopicDraft {
  name: string;
  icon: IconValue | null;
  linkKind: MealTopicLinkKind;
  linkValue: string;
}

export const EMPTY_TOPIC: MealTopicDraft = {
  name: "",
  icon: null,
  linkKind: "search",
  linkValue: "",
};

/** What is missing, or null when the draft can be saved. */
export function draftProblems(
  draft: MealTopicDraft,
): { name?: string; link?: string } | null {
  const name = draft.name.trim() === "" ? COPY.needsName : undefined;
  const link = draft.linkValue.trim() === "" ? COPY.needsLink : undefined;
  return name || link ? { name, link } : null;
}

const KINDS: readonly { value: MealTopicLinkKind; label: string }[] = [
  { value: "playlist", label: "Playlist" },
  { value: "channel", label: "Channel" },
  { value: "search", label: "Search" },
];

export interface MealTopicEditStepProps {
  draft: MealTopicDraft;
  onChange: (draft: MealTopicDraft) => void;
  onOpenIcon: () => void;
  /** Shown after a Save with something missing. */
  problems: { name?: string; link?: string } | null;
  nameRef?: React.Ref<HTMLInputElement>;
}

export function MealTopicEditStep({
  draft,
  onChange,
  onOpenIcon,
  problems,
  nameRef,
}: MealTopicEditStepProps) {
  const iconLabelId = React.useId();
  return (
    <div className="flex flex-col gap-(--space-6)">
      <div className="flex items-center gap-(--space-3)">
        <button
          type="button"
          aria-label={COPY.chooseIcon(draft.name.trim())}
          aria-describedby={iconLabelId}
          onClick={onOpenIcon}
          className="cursor-pointer rounded-(--radius) focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <IconTile icon={draft.icon} />
        </button>
        <Text as="span" id={iconLabelId} variant="secondary" tone="secondary">
          {COPY.icon}
        </Text>
      </div>

      <Input
        ref={nameRef}
        label={COPY.name}
        value={draft.name}
        maxLength={120}
        error={problems?.name}
        onChange={(event) => onChange({ ...draft, name: event.target.value })}
      />

      <SegmentedControl
        label={COPY.link}
        options={KINDS}
        value={draft.linkKind}
        onChange={(linkKind) => onChange({ ...draft, linkKind })}
        stacked={false}
      />

      <Input
        label={COPY.value[draft.linkKind]}
        mode={draft.linkKind === "playlist" ? "url" : "text"}
        placeholder={COPY.placeholder[draft.linkKind]}
        value={draft.linkValue}
        maxLength={512}
        error={problems?.link}
        autoCapitalize="none"
        onChange={(event) =>
          onChange({ ...draft, linkValue: event.target.value })
        }
      />
    </div>
  );
}
