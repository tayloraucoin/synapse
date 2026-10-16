import { describe, expect, it } from "vitest";
import { z } from "zod";
import { appRouter } from "../root";

// USE-100 C4: no linear, google or connections procedure's output schema
// has a field whose name holds token, secret or refresh, at any depth.

const FORBIDDEN = /token|secret|refresh/i;

type AnyProcedure = { _def: { output?: unknown } };

/** Every object key a zod schema can produce, by path. */
function keysOf(schema: unknown, path = "output"): string[] {
  if (schema instanceof z.ZodObject) {
    return Object.entries(schema.shape as Record<string, unknown>).flatMap(
      ([key, value]) => [`${path}.${key}`, ...keysOf(value, `${path}.${key}`)],
    );
  }
  if (schema instanceof z.ZodArray) return keysOf(schema.element, `${path}[]`);
  if (
    schema instanceof z.ZodOptional ||
    schema instanceof z.ZodNullable ||
    schema instanceof z.ZodDefault
  ) {
    return keysOf(schema._def.innerType, path);
  }
  if (schema instanceof z.ZodEffects) return keysOf(schema._def.schema, path);
  if (
    schema instanceof z.ZodUnion ||
    schema instanceof z.ZodDiscriminatedUnion
  ) {
    return (schema._def.options as unknown[]).flatMap((option) =>
      keysOf(option, path),
    );
  }
  if (schema instanceof z.ZodRecord)
    return keysOf(schema._def.valueType, `${path}{}`);
  return [];
}

/** The router's flat record, "connections.list" to its procedure, at runtime. */
const flat = appRouter._def.procedures as unknown as Record<
  string,
  AnyProcedure
>;

const procedures = Object.entries(flat).filter(([name]) =>
  /^(linear|google|connections)\./.test(name),
);

describe("C4: integration procedures never output a credential", () => {
  it("covers the integration procedures there are", () => {
    const names = procedures.map(([name]) => name);
    expect(names).toContain("connections.list");
    expect(names).toContain("linear.disconnect");
  });

  it.each(procedures)("%s declares an output schema", (_name, procedure) => {
    expect(procedure._def.output).toBeInstanceOf(z.ZodType);
  });

  it.each(procedures)(
    "%s has no token, secret or refresh field",
    (_name, procedure) => {
      const keys = keysOf(procedure._def.output);
      expect(
        keys.filter((key) => FORBIDDEN.test(key.split(".").at(-1)!)),
      ).toEqual([]);
    },
  );

  it("the walk finds a forbidden field when there is one", () => {
    const leaky = z.object({
      linear: z.array(z.object({ accessToken: z.string() })),
    });
    expect(keysOf(leaky).some((key) => FORBIDDEN.test(key))).toBe(true);
  });

  it("connections.list's output is strict: an extra column fails the parse", () => {
    const output = flat["connections.list"]!;
    const schema = output._def.output as z.ZodTypeAny;
    const view = {
      linear: [
        {
          id: "00000000-0000-4000-8000-000000000001",
          organizationName: "Lighthouse",
          urlKey: "lighthouse",
          logoUrl: null,
          clientId: null,
          perProject: false,
          lastSyncedAt: null,
          lastSyncError: null,
        },
      ],
      googleAccounts: [],
      googleCalendars: [],
      clientsEnabled: false,
      clients: [],
      projectClients: [],
    };
    expect(schema.safeParse(view).success).toBe(true);
    const leaked = structuredClone(view) as Record<string, unknown>;
    (leaked.linear as Record<string, unknown>[])[0]!.accessTokenCt = "x";
    expect(schema.safeParse(leaked).success).toBe(false);
  });
});
