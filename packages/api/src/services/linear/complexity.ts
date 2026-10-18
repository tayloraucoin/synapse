/**
 * A GraphQL document's cost by Linear's published rule (USE-101, C5): a
 * property is 0.1 point, an object 1, and a connection multiplies its
 * children by its page size (`first`). One query may cost at most 10,000.
 *
 * Counted on the high side: a connection is an object too, and its
 * `pageInfo` is multiplied with its nodes. Only the shapes this folder's
 * documents use are read: one operation, named fragments, `first:` as a
 * number literal. No GraphQL library: the documents are ours and fixed.
 */

export const LINEAR_QUERY_CAP = 10_000;

const PROPERTY = 0.1;
const OBJECT = 1;

interface Field {
  name: string;
  first: number | null;
  children: Selection[] | null;
}

type Selection = Field | { spread: string };

function tokenize(source: string): string[] {
  const tokens: string[] = [];
  const pattern =
    /"(?:[^"\\]|\\.)*"|\.\.\.|[{}():[\]!,=]|\$?[A-Za-z_][\w]*|-?\d+(?:\.\d+)?/g;
  for (const match of source.replace(/#[^\n]*/g, "").matchAll(pattern)) {
    if (match[0] !== ",") tokens.push(match[0]);
  }
  return tokens;
}

function parse(source: string) {
  const tokens = tokenize(source);
  let at = 0;
  const peek = () => tokens[at];
  const next = () => tokens[at++]!;
  const expect = (token: string) => {
    if (next() !== token) throw new Error(`Expected ${token} at ${at - 1}.`);
  };

  /** `( … )`, balanced; returns the `first:` literal if there is one. */
  function args(): number | null {
    let first: number | null = null;
    expect("(");
    for (let depth = 1; depth > 0;) {
      const token = next();
      if (token === "(" || token === "{" || token === "[") depth += 1;
      else if (token === ")" || token === "}" || token === "]") depth -= 1;
      else if (depth === 1 && token === "first" && peek() === ":") {
        next();
        const value = Number(peek());
        if (Number.isFinite(value)) first = value;
      }
    }
    return first;
  }

  function selections(): Selection[] {
    const out: Selection[] = [];
    expect("{");
    while (peek() !== "}") {
      if (peek() === "...") {
        next();
        out.push({ spread: next() });
        continue;
      }
      const name = next();
      const first = peek() === "(" ? args() : null;
      const children = peek() === "{" ? selections() : null;
      out.push({ name, first, children });
    }
    expect("}");
    return out;
  }

  let operation: Selection[] | null = null;
  const fragments = new Map<string, Selection[]>();
  while (at < tokens.length) {
    const keyword = next();
    if (keyword === "fragment") {
      const name = next();
      expect("on");
      next();
      fragments.set(name, selections());
    } else if (keyword === "query") {
      if (peek() !== "{" && peek() !== "(") next();
      if (peek() === "(") args();
      operation = selections();
    } else {
      throw new Error(`Unexpected ${keyword}.`);
    }
  }
  if (!operation) throw new Error("No query in the document.");
  return { operation, fragments };
}

/** The document's cost in Linear's points. */
export function linearQueryComplexity(document: string): number {
  const { operation, fragments } = parse(document);

  function cost(list: Selection[]): number {
    let total = 0;
    for (const selection of list) {
      if ("spread" in selection) {
        const fragment = fragments.get(selection.spread);
        if (!fragment) throw new Error(`No fragment ${selection.spread}.`);
        total += cost(fragment);
      } else if (selection.children === null) {
        total += PROPERTY;
      } else {
        const inner = cost(selection.children);
        total +=
          selection.first === null
            ? OBJECT + inner
            : OBJECT + selection.first * inner;
      }
    }
    return total;
  }

  // Rounded to a tenth, so float sums compare cleanly.
  return Math.round(cost(operation) * 10) / 10;
}
