import { weekKeyOf } from "@syn/utils";
import { dayBoundsRecord } from "@syn/validators";
import type {
  NewBlockPreset,
  NewBlockSheetStart,
} from "@/components/planner/new-block-sheet";
import { fixtureId } from "../ids";
import type { FixtureRecords } from "../records";
import { baseMealTopics, emptyRecords, MEAL_TOPIC_IDS } from "./base-day";
import type { Scenario } from "./index";
import {
  SET_UP_IDS,
  SET_UP_NOW,
  setUpThisWeekRecords,
  setUpUsualRecords,
} from "./set-up";

/**
 * The New block sheet's states (USE-46; set-my-days/new-block-sheet/), over
 * the set-up week at Sunday 11 October, 21:10, so This week is 12 to 18 Oct
 * and the usual Sunday's presets read from Sunday 18 October. Each opens the
 * sheet on load (`sheet:new-block`) with its start and the fields the frame
 * shows typed. The block a frame is adding is left out of its day, so the
 * day reads as it did before the add.
 * `/dev/parts?state=new-block-<state>&sheet=new-block`.
 */

export interface NewBlockScenarioStart {
  start: NewBlockSheetStart;
  preset?: NewBlockPreset;
}

const B = SET_UP_IDS.blocks;
const I = SET_UP_IDS.items;

function without(
  records: FixtureRecords,
  blockIds: readonly string[],
  itemIds: readonly string[] = [],
): FixtureRecords {
  return {
    ...records,
    blocks: records.blocks.filter((block) => !blockIds.includes(block.id)),
    blockItems: records.blockItems.filter(
      (item) => !blockIds.includes(item.blockId) && !itemIds.includes(item.id),
    ),
  };
}

/** The empty usual Thursday of empty-day.md: Up at 7:00, nothing else. */
function emptyThursdayRecords(): FixtureRecords {
  return {
    ...emptyRecords(),
    dayBounds: [
      dayBoundsRecord.parse({
        createdAt: "2026-10-01T12:00:00.000Z",
        updatedAt: "2026-10-01T12:00:00.000Z",
        id: fixtureId(0, 461),
        weekday: 3,
        onDate: null,
        upAt: "07:00",
        lightsOut: "22:30",
      }),
    ],
  };
}

/** Training typed over as "Stretch", 17:00 to 17:20 on the usual Monday. */
const STRETCH: NewBlockScenarioStart = {
  start: {
    week: "usual",
    day: 0,
    mode: "block",
    at: "17:00",
    end: "17:20",
    kind: "training",
  },
  preset: { fields: { name: "Stretch", nameTyped: true } },
};

function scenario(
  name: string,
  records: () => FixtureRecords,
  newBlock: NewBlockScenarioStart,
  options: Partial<Scenario> = {},
): [string, () => Scenario] {
  return [
    name,
    () => ({
      name,
      now: SET_UP_NOW,
      records: records(),
      mode: "ready",
      view: { open: "sheet:new-block" },
      newBlock,
      ...options,
    }),
  ];
}

const sundayRecords = () => without(setUpUsualRecords(), [B.sundayReset]);
const SUNDAY_RESET: NewBlockScenarioStart = {
  start: {
    week: "usual",
    day: 6,
    mode: "block",
    at: "13:00",
    end: "16:00",
    kind: "todos",
  },
  preset: { fields: { name: "Sunday reset", nameTyped: true } },
};

export const NEW_BLOCK_SCENARIOS: Record<string, () => Scenario> =
  Object.fromEntries([
    scenario("new-block-from-a-tapped-time", setUpUsualRecords, STRETCH),
    scenario("new-block-wellness", emptyThursdayRecords, {
      start: { week: "usual", day: 3, mode: "block", kind: "wellness" },
    }),
    // This week's Monday 12, after Lunch; its afternoon Work is the one being added.
    scenario(
      "new-block-work",
      () => without(setUpThisWeekRecords(), [B.workAfternoon]),
      {
        start: {
          week: weekKeyOf("2026-10-12"),
          day: 0,
          mode: "block",
          at: "13:00",
          end: "15:00",
          kind: "work",
        },
      },
    ),
    scenario("new-block-todos-kind", sundayRecords, SUNDAY_RESET),
    scenario("new-block-repeats-menu", sundayRecords, {
      ...SUNDAY_RESET,
      preset: { ...SUNDAY_RESET.preset, open: "repeats" },
    }),
    scenario("new-block-checklist", setUpUsualRecords, {
      start: {
        week: "usual",
        day: 6,
        mode: "block",
        at: "10:00",
        end: "11:00",
        kind: "wellness",
      },
      preset: { fields: { name: "Sunday", nameTyped: true, checklist: true } },
    }),
    // Training holds only Workout: gym; the drive is the one being added.
    scenario(
      "new-block-transition",
      () => without(setUpUsualRecords(), [], [I.driveToGym, I.driveHome]),
      {
        start: { week: "usual", day: 0, mode: "transition", at: "08:00" },
        preset: {
          fields: {
            name: "Drive to the YMCA",
            nameTyped: true,
            icon: { kind: "emoji", value: "🚗" },
          },
        },
      },
    ),
    scenario(
      "new-block-meal",
      () => ({
        ...without(setUpUsualRecords(), [B.breakfast]),
        mealTopics: baseMealTopics(),
      }),
      {
        start: {
          week: "usual",
          day: 0,
          mode: "block",
          at: "09:00",
          end: "09:30",
          kind: "break",
        },
        preset: {
          fields: {
            name: "Breakfast",
            nameTyped: true,
            icon: { kind: "emoji", value: "🍳" },
            meal: true,
            topics: [MEAL_TOPIC_IDS.agentWorkflows, MEAL_TOPIC_IDS.strengthTraining],
          },
        },
      },
    ),
    scenario("new-block-clash", setUpUsualRecords, {
      ...STRETCH,
      start: { ...STRETCH.start, at: "11:30", end: "11:50" },
    }),
    scenario("new-block-invalid", setUpUsualRecords, {
      ...STRETCH,
      preset: { fields: { name: "", nameTyped: false, nameCleared: true } },
    }),
    scenario(
      "new-block-error",
      setUpUsualRecords,
      { ...STRETCH, preset: { ...STRETCH.preset, add: true } },
      { failWrites: ["new-block"] },
    ),
  ]);
