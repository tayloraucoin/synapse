"use client";

import { useCallback } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import type { FixtureServer } from "@/lib/fixtures/server";
import { useDataSource } from "./source";
import { accountQueryKey, type AccountView } from "./use-account";

/**
 * The Profile sheet's data (USE-84): the account the avatar reads, the name
 * typed and not yet saved, and the two writes. On the fixture server now; the
 * account wiring (wave 3) swaps the bodies for the user router's name update
 * and the asset router's upload, and nothing the sheet sees changes.
 *
 * THE DRAFT. A typed name outlives a close (C-USE-profile-sheet-default-2)
 * and a failed save (not-saved-1): it is kept in the query cache for the
 * page's session, cleared only by a save that lands. Never sent in any event
 * payload or log line, nor is the photo.
 */

/** Where the sheet starts for a capture (`?state=profile-*`); unset, as the account has it. */
export interface ProfileSheetStart {
  step: "crop" | "uploading" | "not-saved";
  /** The photo picked from the device, inline so a capture needs no picker. */
  photo?: string;
  /** The name typed and not saved, as the not-saved board draws it. */
  draftName?: string;
}

export function profileDraftKey(scenario: string) {
  return ["profile-draft", scenario] as const;
}

type ProfileServer = Pick<
  FixtureServer,
  "writeAccountName" | "uploadAccountPhoto"
>;

/** The writes, apart from React, so the test drives them as the hook does. */
export function profileActions(
  server: ProfileServer,
  queryClient: QueryClient,
  scenario: string,
) {
  const accountKey = accountQueryKey(scenario);
  const draftKey = profileDraftKey(scenario);
  return {
    setDraft(name: string | null): void {
      queryClient.setQueryData<string | null>(draftKey, name);
    },
    /** Saved, the account takes the name and the draft goes; failed, both stay. */
    async saveName(name: string): Promise<AccountView> {
      queryClient.setQueryData<string | null>(draftKey, name);
      const account = await server.writeAccountName(name);
      queryClient.setQueryData<AccountView>(accountKey, account);
      queryClient.setQueryData<string | null>(draftKey, null);
      return account;
    },
    /** Landed, the avatar shows the new photo; failed, the old one stays. */
    async uploadPhoto(photo: Blob): Promise<AccountView> {
      const account = await server.uploadAccountPhoto(photo);
      // Only the photo: a name saved meanwhile stays as the cache holds it.
      queryClient.setQueryData<AccountView>(accountKey, (current) =>
        current === undefined
          ? account
          : { ...current, photoUrl: account.photoUrl },
      );
      return account;
    },
  };
}

export function useProfile() {
  const source = useDataSource();
  const queryClient = useQueryClient();
  const scenario = source.scenario.name;
  const actions = profileActions(source.server, queryClient, scenario);

  const account = useQuery({
    queryKey: accountQueryKey(scenario),
    queryFn: () => source.server.readAccount(),
  });
  // Never fetched: written by the sheet, held for the page's session.
  const draft = useQuery<string | null>({
    queryKey: profileDraftKey(scenario),
    queryFn: () => null,
    // Fresh from the start, so no first fetch lands over a draft set before it.
    initialData: null,
    staleTime: Infinity,
    gcTime: Infinity,
  });
  const saveName = useMutation<AccountView, Error, string>({
    mutationFn: (name) => actions.saveName(name),
  });
  const uploadPhoto = useMutation<AccountView, Error, Blob>({
    mutationFn: (photo) => actions.uploadPhoto(photo),
  });

  const setDraft = useCallback(
    (name: string | null) =>
      queryClient.setQueryData<string | null>(profileDraftKey(scenario), name),
    [queryClient, scenario],
  );

  return {
    account,
    /** The scenario's starting state; the account wiring drops it with the fixtures. */
    start: source.scenario.profileSheet,
    draft: draft.data ?? null,
    setDraft,
    saveName,
    uploadPhoto,
  };
}
