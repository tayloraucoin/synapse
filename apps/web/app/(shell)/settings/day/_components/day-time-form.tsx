"use client";

import * as React from "react";

import {
  Button,
  HelperText,
  SettingsRow,
  StatusLine,
  TimeField,
  TimezoneSelect,
} from "@syn/ui";
import { TIMEZONE_REGIONS } from "@syn/constants";
import { dayTimeFormSchema, type DayTimeFormInput } from "@syn/validators";

import { useSynapseForm } from "@/lib/forms/use-synapse-form";
import { useOnline } from "@/lib/hooks/use-online";
import { settingsHabitsRoute } from "@/lib/routes";
import { trpc } from "@/lib/trpc/client";

import { SETTINGS_COPY as COPY } from "../../_components/copy";

/**
 * ST-08 — the shape of a day.
 *
 * THE DAY CLOSE AND THE ZONE NEVER WRITE THE LIVE COLUMN. Both go to the
 * pending pair (cross-cutting §7.3, §7.5). A close time that took effect the
 * instant it was saved would move the boundary of the day the person is
 * standing in: items could jump to yesterday mid-afternoon, and a review
 * window could close behind them. The helper says *Applies from tomorrow.* and
 * means it.
 *
 * A PENDING VALUE IS WHAT THE FIELD SHOWS. Displaying the old one after a
 * successful save would look exactly like a failure, and the person would
 * change it again.
 *
 * THE WAKE-UP HABIT IS A LINK, NOT A PICKER. The flag lives on the habit
 * (SET-1's ruling: one home for "at most one per user"), so this names the
 * current one and points at the library. A second control that set the same
 * flag would be a second place the uniqueness rule is enforced.
 */
export function DayTimeForm() {
  const online = useOnline();
  const utils = trpc.useUtils();

  const me = trpc.user.me.useQuery();
  const habits = trpc.habit.list.useQuery({ includeArchived: false });
  const save = trpc.user.updatePreferences.useMutation();

  const [error, setError] = React.useState<string | null>(null);

  // The pending value when there is one — see the note above.
  const shownClose =
    me.data?.pendingDayCloseTime ?? me.data?.dayCloseTime ?? "03:00";
  const shownZone = me.data?.pendingTimezone ?? me.data?.timezone ?? "UTC";

  const form = useSynapseForm<DayTimeFormInput>({
    schema: dayTimeFormSchema,
    defaultValues: {
      usualWakeTime: "07:00",
      dayCloseTime: "03:00",
      reviewReminderTime: "21:00",
      timezone: "UTC",
    },
  });

  const loaded = React.useRef(false);
  React.useEffect(() => {
    if (loaded.current || !me.data) return;
    loaded.current = true;
    form.reset({
      usualWakeTime: me.data.usualWakeTime,
      dayCloseTime: shownClose,
      reviewReminderTime: me.data.reviewReminderTime,
      timezone: shownZone,
    });
  }, [me.data, form, shownClose, shownZone]);

  const values = form.watch();
  const closeChanged = values.dayCloseTime !== me.data?.dayCloseTime;
  const zoneChanged = values.timezone !== me.data?.timezone;
  const anchor = habits.data?.habits.find((habit) => habit.isWakeAnchor);

  async function onSubmit(input: DayTimeFormInput): Promise<void> {
    setError(null);
    try {
      await save.mutateAsync({
        usualWakeTime: input.usualWakeTime,
        reviewReminderTime: input.reviewReminderTime,
        // The two deferred ones, sent as the pending half. The date they
        // start applying is computed on the server, never here.
        ...(closeChanged ? { pendingDayCloseTime: input.dayCloseTime } : {}),
        ...(zoneChanged ? { pendingTimezone: input.timezone } : {}),
      });
      await utils.user.me.invalidate();
      form.reset(input);
    } catch {
      setError(COPY.saveFailed);
    }
  }

  return (
    <form
      onSubmit={(event) => {
        void form.handleSubmit(onSubmit)(event);
      }}
      className="flex flex-col gap-(--space-5)"
    >
      {!online ? <StatusLine variant="offline" placement="inline" /> : null}

      <TimeField
        label={COPY.usualWakeTime}
        helperText={COPY.usualWakeTimeHelper}
        value={values.usualWakeTime}
        onChange={(next) =>
          form.setValue("usualWakeTime", next, { shouldDirty: true })
        }
        disabled={!online}
      />

      <div className="flex flex-col gap-(--space-1)">
        <SettingsRow
          title={COPY.wakeUpHabit}
          description={anchor?.title ?? COPY.none}
          href={`${settingsHabitsRoute()}?type=habit`}
        />
        <HelperText>{COPY.wakeUpHabitHelper}</HelperText>
      </div>

      <TimeField
        label={COPY.dayClosesAt}
        // The bound is passed to the picker as well as enforced by the schema:
        // the field is a suggestion to a browser, the schema is the rule.
        min="00:00"
        max="06:00"
        value={values.dayCloseTime}
        onChange={(next) =>
          form.setValue("dayCloseTime", next, { shouldDirty: true })
        }
        error={form.formState.errors.dayCloseTime?.message}
        helperText={
          closeChanged
            ? `${COPY.dayClosesAtHelper} ${COPY.appliesFromTomorrow}`
            : COPY.dayClosesAtHelper
        }
        disabled={!online}
      />

      <TimeField
        label={COPY.reviewReminder}
        helperText={COPY.reviewReminderHelper}
        value={values.reviewReminderTime}
        onChange={(next) =>
          form.setValue("reviewReminderTime", next, { shouldDirty: true })
        }
        disabled={!online}
      />

      <div className="flex flex-col gap-(--space-1)">
        <TimezoneSelect
          label={COPY.timezone}
          zones={TIMEZONE_REGIONS}
          value={values.timezone}
          onChange={(next) =>
            form.setValue("timezone", next, { shouldDirty: true })
          }
          disabled={!online}
        />
        {zoneChanged ? (
          <HelperText>{COPY.appliesFromTomorrow}</HelperText>
        ) : null}
      </div>

      {error === null ? null : <HelperText error>{error}</HelperText>}

      {/*
       * No toast and no confirmation line: Epic 1 §7 says a save returns the
       * screen to idle showing the new values, and the fields already do. The
       * *Applies from tomorrow.* helper is what a deferred change gets instead.
       */}
      <Button
        type="submit"
        className="self-start"
        busy={save.isPending}
        disabled={!online || !form.formState.isDirty}
      >
        {COPY.saveChanges}
      </Button>
    </form>
  );
}
