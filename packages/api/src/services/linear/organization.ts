/**
 * Which workspace a grant is for: `viewer { organization { … } }` [NOT
 * VERIFIED live; confirm on the first connect, C8]. A logo that is not a
 * plain URL is dropped, and the letter tile stands in (calls.md).
 */
import {
  linearOrganizationSchema,
  type LinearOrganization,
} from "@syn/validators";
import { LINEAR_GRAPHQL_URL, type FetchLike } from "./oauth";

const QUERY = "query { viewer { organization { id name urlKey logoUrl } } }";

export class LinearOrganizationError extends Error {
  constructor() {
    super("Linear's workspace could not be read.");
    this.name = "LinearOrganizationError";
  }
}

function plainUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

export async function readLinearOrganization(
  fetchFn: FetchLike,
  accessToken: string,
): Promise<LinearOrganization> {
  const response = await fetchFn(LINEAR_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query: QUERY }),
  });
  if (!response.ok) throw new LinearOrganizationError();
  const body = (await response.json()) as {
    data?: { viewer?: { organization?: Record<string, unknown> } };
  };
  const organization = body.data?.viewer?.organization;
  const parsed = linearOrganizationSchema.safeParse(
    organization
      ? { ...organization, logoUrl: plainUrl(organization.logoUrl) }
      : null,
  );
  if (!parsed.success) throw new LinearOrganizationError();
  return parsed.data;
}
