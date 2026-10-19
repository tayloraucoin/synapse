import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { initTRPC } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { describe, expect, it } from "vitest";
import { refuse, withRefusal } from "@syn/api";
import { callLive } from "@/lib/data/live/errors";
import { PlannerRefusal, SavedColourRefusal } from "@/lib/data/refusals";

/**
 * USE-90's C4, over the wire: a procedure that refuses (`refuse`) reaches
 * the live server's call as the refusal class the fixture server throws,
 * with its reason and its words, through the formatter `@syn/api` uses
 * (`withRefusal`) and a real HTTP round trip.
 */

const t = initTRPC.create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => withRefusal(shape, error),
});

const router = t.router({
  saveColour: t.procedure.mutation(() => {
    throw refuse("duplicate", "That colour is saved already.");
  }),
  moveBlock: t.procedure.mutation(() => {
    throw refuse("not-on-date", "That block does not run on Tuesday.");
  }),
  broken: t.procedure.query(() => {
    throw new Error("boom");
  }),
});

const client = createTRPCClient<typeof router>({
  links: [
    httpBatchLink({
      url: "http://test.local/api/trpc",
      transformer: superjson,
      fetch: (input, init) =>
        fetchRequestHandler({
          endpoint: "/api/trpc",
          req: new Request(input as string, init as RequestInit),
          router,
        }),
    }),
  ],
});

describe("C4: a refused TRPCError reaches the hook as its refusal class", () => {
  it("carries the reason and the words", async () => {
    const save = callLive("savedColour", () => client.saveColour.mutate());
    await expect(save).rejects.toBeInstanceOf(SavedColourRefusal);
    await expect(save).rejects.toMatchObject({
      reason: "duplicate",
      message: "That colour is saved already.",
    });
  });

  it("maps by the domain's kind", async () => {
    const move = callLive("planner", () => client.moveBlock.mutate());
    await expect(move).rejects.toBeInstanceOf(PlannerRefusal);
    await expect(move).rejects.toMatchObject({ reason: "not-on-date" });
  });

  it("leaves any other error as it came", async () => {
    const read = callLive("planner", () => client.broken.query());
    await expect(read).rejects.not.toBeInstanceOf(PlannerRefusal);
    await expect(read).rejects.toMatchObject({
      data: { code: "INTERNAL_SERVER_ERROR", refusal: null },
    });
  });
});
