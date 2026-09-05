import { type SQL } from "drizzle-orm";
import { pgPolicy } from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";

import {
  allowAuthenticatedRead,
  denyAuthenticated,
  isOwner,
} from "./helpers";

/**
 * Three factories, and deliberately only three.
 *
 * Conscious Connections has eight, because it has couples, admins, and
 * catalogues an admin writes. Synapse has one shape of user data — yours,
 * private — plus system tables and read-only catalogues. `ownerRowPolicies`,
 * `coupleScopedPolicies`, `catalogAdminWritePolicies`, and
 * `holderScopedPolicies` are not copied: each of them admits a reader who is
 * not the owner, and there is no such reader here.
 */

type PolicyOptions = {
  /** Stable prefix for policy names (usually the table name). */
  prefix: string;
  ownerColumn: SQL;
};

/**
 * Strictly-owner CRUD — the row's owner is the only reader and the only
 * writer. This is the code form of the product's promise, and it is the
 * default for every table that holds a person's day.
 */
export function ownerPrivateCrudPolicies({
  prefix,
  ownerColumn,
}: PolicyOptions) {
  const access = isOwner(ownerColumn);
  return [
    pgPolicy(`${prefix}_select`, {
      for: "select",
      to: authenticatedRole,
      using: access,
    }),
    pgPolicy(`${prefix}_insert`, {
      for: "insert",
      to: authenticatedRole,
      withCheck: access,
    }),
    pgPolicy(`${prefix}_update`, {
      for: "update",
      to: authenticatedRole,
      using: access,
      withCheck: access,
    }),
    pgPolicy(`${prefix}_delete`, {
      for: "delete",
      to: authenticatedRole,
      using: access,
    }),
  ];
}

/**
 * Read-only catalogue for any authenticated user — a table the product ships
 * rather than a person writes (the curated icon set, if it ever moves to the
 * database). No admin write path exists; a catalogue changes by migration.
 */
export function catalogReadPolicies(prefix: string) {
  return [
    pgPolicy(`${prefix}_select`, {
      for: "select",
      to: authenticatedRole,
      using: allowAuthenticatedRead,
    }),
    pgPolicy(`${prefix}_insert`, {
      for: "insert",
      to: authenticatedRole,
      withCheck: denyAuthenticated,
    }),
    pgPolicy(`${prefix}_update`, {
      for: "update",
      to: authenticatedRole,
      using: denyAuthenticated,
    }),
    pgPolicy(`${prefix}_delete`, {
      for: "delete",
      to: authenticatedRole,
      using: denyAuthenticated,
    }),
  ];
}

/**
 * Service-role / system paths only — the scheduler's delivery bookkeeping, and
 * nothing a person wrote. Denies the authenticated role outright; the service
 * role reaches the table by bypassing RLS through `SET LOCAL role`.
 */
export function serviceRoleOnlyPolicies(prefix: string) {
  return [
    pgPolicy(`${prefix}_select`, {
      for: "select",
      to: authenticatedRole,
      using: denyAuthenticated,
    }),
    pgPolicy(`${prefix}_insert`, {
      for: "insert",
      to: authenticatedRole,
      withCheck: denyAuthenticated,
    }),
    pgPolicy(`${prefix}_update`, {
      for: "update",
      to: authenticatedRole,
      using: denyAuthenticated,
    }),
    pgPolicy(`${prefix}_delete`, {
      for: "delete",
      to: authenticatedRole,
      using: denyAuthenticated,
    }),
  ];
}
