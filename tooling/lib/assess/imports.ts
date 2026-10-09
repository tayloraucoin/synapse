/**
 * The module specifiers a JS or TS source imports (MIG T6, the SDK listing).
 *
 * A static import or export-from statement, a require call or a dynamic
 * import, read from a small token scan that skips comments and keeps strings
 * whole, so a module named in a comment or a string never counts. This mirrors
 * the matcher in tooling/lib/specs.ts (MIG-4) without importing it: that file
 * reads YAML, and assess runs from a cold session with node built-ins only.
 */

type Token = { kind: "word" | "string" | "punct"; text: string };

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = source.length;
  while (i < n) {
    const c = source[i]!;
    const next = source[i + 1];
    if (/\s/.test(c)) {
      i++;
    } else if (c === "/" && next === "/") {
      while (i < n && source[i] !== "\n") i++;
    } else if (c === "/" && next === "*") {
      const end = source.indexOf("*/", i + 2);
      i = end === -1 ? n : end + 2;
    } else if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      let j = i + 1;
      let text = "";
      while (j < n && source[j] !== quote) {
        if (source[j] === "\\") j++;
        else if (quote === "`" && source[j] === "$" && source[j + 1] === "{") {
          // A template substitution: skip to its closing brace, one level deep.
          let depth = 0;
          while (j < n) {
            if (source[j] === "{") depth++;
            else if (source[j] === "}" && --depth === 0) break;
            j++;
          }
        } else if (source[j] === "\n" && quote !== "`") break;
        else text += source[j];
        j++;
      }
      tokens.push({ kind: "string", text });
      i = j + 1;
    } else if (/[A-Za-z_$]/.test(c)) {
      let j = i;
      while (j < n && /[A-Za-z0-9_$]/.test(source[j]!)) j++;
      tokens.push({ kind: "word", text: source.slice(i, j) });
      i = j;
    } else {
      tokens.push({ kind: "punct", text: c });
      i++;
    }
  }
  return tokens;
}

/** Every module specifier the source names in an import, export-from, require or dynamic import. */
export function listImportedModules(source: string): string[] {
  const tokens = tokenize(source);
  const found = new Set<string>();
  tokens.forEach((token, k) => {
    if (token.kind !== "word" || tokens[k - 1]?.text === ".") return;
    const at = (offset: number) => tokens[k + offset];
    const called = at(1)?.text === "(" && at(2)?.kind === "string";
    if (token.text === "from" && at(1)?.kind === "string")
      found.add(at(1)!.text);
    else if (token.text === "import" && at(1)?.kind === "string")
      found.add(at(1)!.text);
    else if ((token.text === "import" || token.text === "require") && called)
      found.add(at(2)!.text);
  });
  return [...found];
}

/** Whether a specifier names the module: itself, a subpath of it, or a package of its `@scope/*`. */
export function importsModule(specifier: string, module: string): boolean {
  if (module.endsWith("/*"))
    return (
      specifier.startsWith(module.slice(0, -1)) &&
      specifier.length > module.length - 1
    );
  return specifier === module || specifier.startsWith(`${module}/`);
}

/** A tracked path the import scan reads: JavaScript or TypeScript source. */
export const SOURCE_FILE = /\.(?:[cm]?[jt]sx?)$/;
