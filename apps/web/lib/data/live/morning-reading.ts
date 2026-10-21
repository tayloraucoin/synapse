import {
  linkFormSchema,
  passageFormSchema,
  readingRowInput,
  reorderReadingInput,
  turnOnInput,
} from "@syn/validators";
import { MorningReadingRefusal } from "@/lib/data/refusals";
import type { LiveDomain } from "./domains";
import { callLive } from "./errors";

/**
 * Settings › Morning reading, live (USE-151): USE-150's `morning.list` and
 * its writes. Each write parses its input here first, as `orient.ts` does,
 * so a bad one is refused with the schema's words (the limit lines, the link
 * line) before any call, as the fixture refuses it; the router's own
 * refusals come back by code (`not_off`, `incomplete_reorder`, …).
 */

function parsed<T>(
  result:
    | { success: true; data: T }
    | { success: false; error: { issues: { message: string }[] } },
): T {
  if (!result.success) {
    throw new MorningReadingRefusal(
      "invalid",
      result.error.issues[0]?.message ?? "Invalid input.",
    );
  }
  return result.data;
}

export const morningReadingDomain = {
  name: "morningReading",
  methods: (client) => ({
    readMorningReading: () => client.morning.list.query(),

    saveReadingPassage: async (raw) => {
      const input = parsed(passageFormSchema.safeParse(raw));
      return callLive("morningReading", () =>
        client.morning.savePassage.mutate(input),
      );
    },

    saveReadingLink: async (raw) => {
      const input = parsed(linkFormSchema.safeParse(raw));
      return callLive("morningReading", () =>
        client.morning.saveLink.mutate(input),
      );
    },

    reorderReading: async (raw) => {
      const input = parsed(reorderReadingInput.safeParse(raw));
      await callLive("morningReading", () =>
        client.morning.reorder.mutate(input),
      );
    },

    turnReadingOff: async (raw) => {
      const input = parsed(readingRowInput.safeParse(raw));
      await callLive("morningReading", () =>
        client.morning.turnOff.mutate(input),
      );
    },

    turnReadingOn: async (raw) => {
      const input = parsed(turnOnInput.safeParse(raw));
      await callLive("morningReading", () =>
        client.morning.turnOn.mutate(input),
      );
    },

    deleteReadingRow: async (raw) => {
      const input = parsed(readingRowInput.safeParse(raw));
      await callLive("morningReading", () =>
        client.morning.delete.mutate(input),
      );
    },
  }),
} satisfies LiveDomain;
