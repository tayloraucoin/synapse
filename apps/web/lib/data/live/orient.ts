import { journalSaveInput, morningLinesInput } from "@syn/validators";
import { JournalWriteRefusal, MorningLinesRefusal } from "@/lib/data/refusals";
import type { LiveDomain } from "./domains";
import { callLive } from "./errors";

/**
 * The morning and evening loop, live (USE-96): Orient's reading, lines and
 * last night (`morning.*`), the day's stamps and the welcome's first-go read
 * (`day.*`), and Close the day's journal (`journal.*`). The writes parse
 * their input here first, so a bad one is refused with the schema's words,
 * as the fixture refuses it, before any call. `readMorning` is not served:
 * nothing reads both together.
 */
export const orientDomain: LiveDomain = {
  name: "orient",
  methods: (client) => ({
    readReading: (dateKey) => client.morning.reading.query({ dateKey }),

    readMorningDay: (dateKey) => client.morning.day.query({ dateKey }),

    async writeMorningLines(raw) {
      const parsed = morningLinesInput.safeParse(raw);
      if (!parsed.success) {
        throw new MorningLinesRefusal(
          parsed.error.issues[0]?.message ?? "Invalid lines.",
        );
      }
      return callLive("morningLines", () =>
        client.morning.saveLines.mutate(parsed.data),
      );
    },

    stampOrient: (dateKey, at) =>
      client.day.stampOrient.mutate({ dateKey, at }),

    readyGo: (dateKey, at) => client.day.readyGo.mutate({ dateKey, at }),

    readReadiedBefore: (dateKey) => client.day.readiedBefore.query({ dateKey }),

    readJournal: (dateKey) => client.journal.read.query({ date: dateKey }),

    async writeJournalAnswer(raw) {
      const parsed = journalSaveInput.safeParse(raw);
      if (!parsed.success) {
        throw new JournalWriteRefusal(
          parsed.error.issues[0]?.message ?? "Invalid answer.",
        );
      }
      return callLive("journal", () => client.journal.save.mutate(parsed.data));
    },
  }),
};
