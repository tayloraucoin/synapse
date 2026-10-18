import { resolveDayKey } from "@syn/utils";
import type { FixtureEntry } from "@/lib/data/source";
import { resolveScenario } from "./scenarios";
import { railAddSeedOf } from "./scenarios/add-from-the-rail";
import { roomSeedOf } from "./scenarios/review-day";
import { blockPanelSeedOf, weekPlaceSeedOf } from "./scenarios/week";
import { createFixtureServer } from "./server";

/**
 * The fixtures' one way in from the live path (USE-108): `?state=`'s source
 * and its capture seeds. A production build resolves this module to
 * `lib/no-fixtures/entry.ts` (`next.config.ts`), so no fixture reaches it.
 */
export const fixtures: FixtureEntry | null = {
  scenarioName: (name) => resolveScenario(name).name,

  createSource(name) {
    const scenario = resolveScenario(name);
    const base = Date.parse(scenario.now);
    const loadedAt = Date.now();
    const now = () => new Date(base + (Date.now() - loadedAt));
    const { timeZone, dayCloseTime } = scenario.records;
    return {
      scenario,
      server: createFixtureServer(scenario, now),
      now,
      todayKey: () => resolveDayKey(now(), timeZone, dayCloseTime),
      live: false,
      seeds: {
        blockPanel: blockPanelSeedOf(scenario.name),
        railAdd: railAddSeedOf(scenario.name),
        room: roomSeedOf(scenario.name),
        weekPlace: weekPlaceSeedOf(scenario.name),
      },
    };
  },
};
