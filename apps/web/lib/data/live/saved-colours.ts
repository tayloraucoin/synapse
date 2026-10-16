import { savedColourWriteInput } from "@syn/validators";
import { SavedColourRefusal } from "@/lib/data/refusals";
import type { LiveDomain } from "./domains";
import { callLive } from "./errors";

/**
 * Saved colours, live (USE-97): `planner.savedColours.*`. The input is parsed
 * here first, so a bad hex is refused "invalid" with the schema's words, as
 * the fixture refuses it, before any call.
 */
export const savedColoursDomain: LiveDomain = {
  name: "saved-colours",
  methods: (client) => ({
    listSavedColours: () =>
      callLive("savedColour", () => client.planner.savedColours.list.query()),

    async writeSavedColour(raw) {
      const parsed = savedColourWriteInput.safeParse(raw);
      if (!parsed.success) {
        throw new SavedColourRefusal(
          "invalid",
          parsed.error.issues[0]?.message ?? "Invalid saved colour.",
        );
      }
      return callLive("savedColour", () =>
        client.planner.savedColours.write.mutate(parsed.data),
      );
    },

    removeSavedColour: (id) =>
      callLive("savedColour", () =>
        client.planner.savedColours.remove.mutate({ id }),
      ),
  }),
};
