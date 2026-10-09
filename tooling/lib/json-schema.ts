/**
 * Validates a value against the subset of JSON Schema the toolkit's schema
 * files use, so each schema file is the one home of its shape (no validator
 * dependency, record 0003). Supported: type, required, properties,
 * additionalProperties (false or a schema), items, enum, pattern, minimum,
 * minLength, $ref to "#/$defs/<name>", and oneOf.
 *
 * Anything else in a schema file is a defect: the validator refuses it rather
 * than ignore a rule it cannot apply.
 */

type Schema = Record<string, unknown>;

const KNOWN = new Set([
  "$schema",
  "$id",
  "$defs",
  "title",
  "description",
  "type",
  "required",
  "properties",
  "additionalProperties",
  "items",
  "enum",
  "pattern",
  "minimum",
  "minLength",
  "$ref",
  "oneOf",
]);

const typeOf = (value: unknown) =>
  value === null
    ? "null"
    : Array.isArray(value)
      ? "array"
      : Number.isInteger(value)
        ? "integer"
        : typeof value;

const matchesType = (value: unknown, type: string) =>
  type === "number" ? typeof value === "number" : typeOf(value) === type;

/** Every way `value` breaks `schema`, each with the JSON path where it does. */
export function validateJson(
  value: unknown,
  schema: Schema,
  root: Schema = schema,
  at = "$",
): string[] {
  for (const key of Object.keys(schema))
    if (!KNOWN.has(key))
      throw new Error(`schema keyword "${key}" at ${at} is not supported`);

  if (typeof schema.$ref === "string") {
    const name = schema.$ref.replace(/^#\/\$defs\//, "");
    const target = (root.$defs as Record<string, Schema> | undefined)?.[name];
    if (!target) throw new Error(`schema $ref ${schema.$ref} does not resolve`);
    return validateJson(value, target, root, at);
  }
  if (Array.isArray(schema.oneOf)) {
    const passing = (schema.oneOf as Schema[]).filter(
      (option) => validateJson(value, option, root, at).length === 0,
    );
    return passing.length === 1
      ? []
      : [`${at} must match exactly one allowed shape`];
  }

  const problems: string[] = [];
  if (schema.type !== undefined) {
    const types = [schema.type].flat() as string[];
    if (!types.some((type) => matchesType(value, type)))
      return [`${at} must be ${types.join(" or ")}, not ${typeOf(value)}`];
  }
  if (Array.isArray(schema.enum) && !schema.enum.includes(value))
    problems.push(
      `${at} must be one of ${schema.enum.map((v) => JSON.stringify(v)).join(", ")}`,
    );
  if (typeof value === "string") {
    if (
      typeof schema.pattern === "string" &&
      !new RegExp(schema.pattern).test(value)
    )
      problems.push(`${at} must match ${schema.pattern}`);
    if (typeof schema.minLength === "number" && value.length < schema.minLength)
      problems.push(`${at} must not be empty`);
  }
  if (
    typeof value === "number" &&
    typeof schema.minimum === "number" &&
    value < schema.minimum
  )
    problems.push(`${at} must be at least ${schema.minimum}`);

  if (Array.isArray(value) && schema.items)
    value.forEach((item, i) =>
      problems.push(
        ...validateJson(item, schema.items as Schema, root, `${at}[${i}]`),
      ),
    );

  if (typeOf(value) === "object") {
    const object = value as Record<string, unknown>;
    for (const key of (schema.required as string[] | undefined) ?? [])
      if (!(key in object)) problems.push(`${at}.${key} is missing`);
    const properties = (schema.properties as Record<string, Schema>) ?? {};
    for (const [key, item] of Object.entries(object)) {
      if (properties[key])
        problems.push(
          ...validateJson(item, properties[key], root, `${at}.${key}`),
        );
      else if (schema.additionalProperties === false)
        problems.push(`${at}.${key} is not an allowed key`);
      else if (typeOf(schema.additionalProperties) === "object")
        problems.push(
          ...validateJson(
            item,
            schema.additionalProperties as Schema,
            root,
            `${at}.${key}`,
          ),
        );
    }
  }
  return problems;
}
