"use client";

import * as React from "react";

import { TEMPLATE_NAME_MAX } from "@syn/constants";
import { Button, Input, PickerList, Text } from "@syn/ui";

import { DAY_BUILDER_COPY as COPY } from "./copy";
import type { useListScreen } from "./use-list-screen";

/**
 * The head of a list screen — 13d, 13e, 13h (UX v1.2 §4.13): the picker of
 * existing lists when there are any, then the name field. Choosing writes
 * the FK; *New list* creates; the name writes on blur and Enter.
 */
export function ListHeader({
  list,
  nameLabel,
  newLabel,
  disabled,
}: {
  list: ReturnType<typeof useListScreen>;
  nameLabel: string;
  newLabel: string;
  disabled: boolean;
}) {
  const [name, setName] = React.useState(list.name ?? "");
  React.useEffect(() => {
    if (list.name !== null) setName(list.name);
  }, [list.name]);

  const others = list.pickerItems.filter((item) => item.id !== list.templateId);

  return (
    <div className="flex flex-col gap-(--space-4)">
      {list.missing ? (
        <div className="flex flex-col gap-(--space-3)">
          <Text as="p" tone="secondary">
            {COPY.d.listRemoved}
          </Text>
          <Button variant="secondary" disabled={disabled} busy={list.busy} onClick={() => void list.createNew()} className="w-full wide:w-auto wide:self-start">
            {newLabel}
          </Button>
        </div>
      ) : null}

      {others.length === 0 ? null : (
        <PickerList
          groups={[{ heading: COPY.yourLists, items: list.pickerItems }]}
          value={list.templateId}
          onSelect={(id) => {
            if (id !== list.templateId) void list.choose(id);
          }}
          createLabel={newLabel}
          onCreate={() => void list.createNew()}
          searchLabel={COPY.d.pickerSearch}
          emptyText={COPY.d.pickerEmpty}
          presentation="inline"
        />
      )}

      {list.templateId === null || list.missing ? null : (
        <Input
          label={nameLabel}
          value={name}
          maxLength={TEMPLATE_NAME_MAX}
          disabled={disabled}
          onChange={(event) => setName(event.target.value)}
          onBlur={() => {
            if (name.trim() !== "" && name.trim() !== list.name) void list.setName(name);
            else setName(list.name ?? "");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              event.currentTarget.blur();
            }
          }}
        />
      )}
    </div>
  );
}
