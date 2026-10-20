import type { FixtureServer } from "@/lib/fixtures/server";
import type { TrpcClient } from "@/lib/trpc/client";
import { accountDomain } from "./account";
import { clientsDomain } from "./clients";
import { connectionsDomain } from "./connections";
import { googleEventsDomain } from "./google";
import { linearDomain } from "./linear";
import { mealTopicsDomain } from "./meal-topics";
import { morningReadingDomain } from "./morning-reading";
import { orientDomain } from "./orient";
import { plannerRead } from "./planner";
import { plannerWrites } from "./planner-writes";
import { savedColoursDomain } from "./saved-colours";
import { slotsAndClock } from "./slots-and-clock";
import { todosDomain } from "./todos";
import { workDomain } from "./work";

/**
 * A domain served live (USE-90): the server methods it answers, each a call
 * through the tRPC client with its refusal mapped (`callLive`). Each module
 * beside this file declares its domain with `satisfies LiveDomain`, so its
 * method names stay in its type and `createLiveServer` can check that the
 * domains together answer every method (USE-108).
 */
export interface LiveDomain {
  name: string;
  methods: (client: TrpcClient) => Partial<FixtureServer>;
}

export const LIVE_DOMAINS = [
  accountDomain,
  connectionsDomain,
  savedColoursDomain,
  mealTopicsDomain,
  orientDomain,
  morningReadingDomain,
  plannerRead,
  plannerWrites,
  slotsAndClock,
  clientsDomain,
  googleEventsDomain,
  linearDomain,
  todosDomain,
  workDomain,
] as const satisfies readonly LiveDomain[];

type MethodsOf<D> = D extends LiveDomain ? ReturnType<D["methods"]> : never;

/** Every method one of `LIVE_DOMAINS` answers. */
export type LiveMethods = UnionToIntersection<
  MethodsOf<(typeof LIVE_DOMAINS)[number]>
>;

type UnionToIntersection<U> = (
  U extends unknown ? (arg: U) => void : never
) extends (arg: infer I) => void
  ? I
  : never;
