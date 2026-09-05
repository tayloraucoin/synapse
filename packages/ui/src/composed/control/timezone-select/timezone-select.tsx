/**
 * TimezoneSelect — pick an IANA zone (v2 handoff §5.4).
 *
 * FR-01 and ST-08. Two presentations for one control: a native `select` on
 * compact, where the OS wheel handles four hundred options better than
 * anything in a webview, and a `PickerList` on wide, where a search box beats
 * a very long dropdown.
 *
 * The zone list is a prop. There are ~600 IANA zones and the grouping people
 * actually want is regional and editorial; that is content, supplied by
 * `@syn/constants`, not a decision this component makes (§11).
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "../../../primitives/control/native-select";
import { Text } from "../../../primitives/typography/text";
import { useIsWide } from "../../../lib/use-media-query";
import { PickerList } from "../picker-list";

export interface TimezoneZone {
  id: string;
  label: string;
}

export interface TimezoneRegion {
  region: string;
  zones: readonly TimezoneZone[];
}

export interface TimezoneSelectProps {
  value: string;
  onChange: (iana: string) => void;
  label: React.ReactNode;
  zones: readonly TimezoneRegion[];
  disabled?: boolean;
  className?: string;
}

export function TimezoneSelect({
  value,
  onChange,
  label,
  zones,
  disabled = false,
  className,
}: TimezoneSelectProps) {
  const isWide = useIsWide();
  const selectId = React.useId();
  const labelId = React.useId();

  if (isWide) {
    return (
      <div className={cn("flex flex-col gap-(--space-2)", className)}>
        <Text as="span" id={labelId} variant="secondary" weight={500}>
          {label}
        </Text>
        <PickerList
          groups={zones.map((region) => ({
            heading: region.region,
            items: region.zones.map((zone) => ({
              id: zone.id,
              title: zone.label,
            })),
          }))}
          value={value}
          onSelect={onChange}
          searchLabel="Search time zones"
          emptyText="No time zones match that search."
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-(--space-2)", className)}>
      <Text as="label" htmlFor={selectId} variant="secondary" weight={500}>
        {label}
      </Text>
      <NativeSelect
        id={selectId}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {zones.map((region) => (
          <NativeSelectOptGroup key={region.region} label={region.region}>
            {region.zones.map((zone) => (
              <NativeSelectOption key={zone.id} value={zone.id}>
                {zone.label}
              </NativeSelectOption>
            ))}
          </NativeSelectOptGroup>
        ))}
      </NativeSelect>
    </div>
  );
}
