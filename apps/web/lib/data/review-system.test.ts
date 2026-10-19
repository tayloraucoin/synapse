import { MutationObserver, QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { resolveDayEntry } from "@syn/utils";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { BASE_DATE } from "@/lib/fixtures/scenarios/base-day";
import { onNowDay } from "@/lib/fixtures/scenarios/now-day";
import { createFixtureServer } from "@/lib/fixtures/server";
import type { TodayRecords } from "./today-records";
import { isConnected, reconnectSource } from "./use-connection";
import { readyGoOptions } from "./use-review-day";
import { retryToday, todayQueryKey } from "./use-today";
import { todosQueryKey } from "./use-todos";

/**
 * Review the day's system states through the fixtures (USE-34, C5): the day
 * and the to-dos are two queries that fail apart (D-USE-69), and Ready, go
 * made offline is held on the phone and applied once the connection is back.
 */
function setup(name: string) {
  const nowMs = Date.parse(onNowDay("06:58"));
  const now = () => new Date(nowMs);
  const scenario = resolveScenario(name);
  const server = createFixtureServer(scenario, now);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return { source: { scenario, server, now }, server, queryClient };
}

describe("C5: Try again on a failed day reads the day alone", () => {
  it("lands on success and leaves the loaded to-dos unread", async () => {
    const { source, server, queryClient } = setup("review-partial-day");
    const dayKey = todayQueryKey(source.scenario.name, BASE_DATE);
    const todosKey = todosQueryKey(source.scenario.name, BASE_DATE);
    let todoReads = 0;

    await queryClient
      .fetchQuery({
        queryKey: dayKey,
        queryFn: () => server.readToday(BASE_DATE),
      })
      .catch(() => undefined);
    await queryClient.fetchQuery({
      queryKey: todosKey,
      queryFn: () => {
        todoReads += 1;
        return server.readTodos(BASE_DATE);
      },
    });
    expect(queryClient.getQueryState(dayKey)?.status).toBe("error");
    expect(queryClient.getQueryState(todosKey)?.status).toBe("success");

    await retryToday(queryClient, source, BASE_DATE);

    expect(queryClient.getQueryState(dayKey)?.status).toBe("success");
    expect(queryClient.getQueryData<TodayRecords>(dayKey)?.date).toBe(
      BASE_DATE,
    );
    expect(todoReads).toBe(1);
  });

  it("the to-dos failing leaves the day readable (partial: to-dos)", async () => {
    const { server } = setup("review-partial-todos");
    await expect(server.readTodos(BASE_DATE)).rejects.toThrow();
    expect((await server.readToday(BASE_DATE)).date).toBe(BASE_DATE);
  });
});

describe("C5: Ready, go offline is applied once the connection is back", () => {
  it("reads at once, holds the write, then writes it on reconnect", async () => {
    const { source, server, queryClient } = setup("review-offline");
    const dayKey = todayQueryKey(source.scenario.name, BASE_DATE);
    await queryClient.fetchQuery({
      queryKey: dayKey,
      queryFn: () => server.readToday(BASE_DATE),
    });
    expect(isConnected(source)).toBe(false);

    const observer = new MutationObserver(
      queryClient,
      readyGoOptions(source, queryClient),
    );
    const sent = observer.mutate(BASE_DATE);
    // The press settles its read of the day, then waits on the connection.
    await new Promise((resolve) => setTimeout(resolve, 0));

    // The day reads it at once: the entry tree goes on to the welcome.
    const optimistic = queryClient.getQueryData<TodayRecords>(dayKey);
    expect(optimistic?.dayRecord?.readyAt).not.toBeNull();
    expect(
      resolveDayEntry({
        dayRecord: optimistic!.dayRecord,
        startedOnDevice: false,
      }),
    ).toBe("welcome");
    // Held on the phone: the server has nothing yet.
    expect(
      (await server.readToday(BASE_DATE)).dayRecord?.readyAt ?? null,
    ).toBeNull();
    expect(observer.getCurrentResult().isPending).toBe(true);

    reconnectSource(source);
    const record = await sent;

    expect(record.readyAt).toBe(new Date(onNowDay("06:58")).toISOString());
    expect((await server.readToday(BASE_DATE)).dayRecord?.readyAt).toBe(
      record.readyAt,
    );
  });
});
