"use client";

import { createTRPCReact } from "@trpc/react-query";

import type { AppRouter } from "@syn/api";

/**
 * The React tRPC client. `AppRouter` is a type import, so nothing from the
 * server package reaches the browser bundle — only its shape.
 */
export const trpc = createTRPCReact<AppRouter>();
