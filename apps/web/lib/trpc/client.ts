"use client";

import { createTRPCReact } from "@trpc/react-query";
import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@syn/api";

/**
 * The React tRPC client. `AppRouter` is a type import, so nothing from the
 * server package reaches the browser bundle — only its shape.
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * What a procedure returns, by name — `RouterOutputs["week"]["get"]`.
 *
 * A component that renders one row of a result needs a name for that row's
 * type. Deriving it here keeps the app from importing the service module the
 * type was declared in, which would drag server code across a boundary to get
 * at a shape the router already publishes.
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;
