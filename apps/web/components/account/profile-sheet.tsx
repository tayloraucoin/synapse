"use client";

/**
 * ProfileSheet — the name and the photo (USE-84; profile-sheet/index.md).
 * Opened at `?sheet=profile` by the avatar menu's "Profile".
 *
 * SAVE IS FOR THE NAME. Faded and inert until the name changes, and still
 * reachable with its reason (`aria-disabled`, C-USE-profile-sheet-2). The
 * photo needs no Save: "Use photo" uploads at once (C-USE-profile-sheet-4).
 *
 * NOTHING TYPED IS LOST. The name lives in `useProfile`'s draft: × keeps it
 * for the next open, a failed save or offline keeps it with "Not saved. Try
 * again." above a live Save; a failed upload brings the old photo back with
 * the same line. No Remove photo, and the email is text, not a field
 * (C-USE-profile-sheet-7).
 *
 * `useProfile().start` stands a capture in one of the states
 * (`?state=profile-*`); unset, the sheet opens as the account has it.
 */
import * as React from "react";
import {
  Avatar,
  Button,
  CloseIcon,
  Input,
  LoadingText,
  NotSavedIcon,
  ResponsiveSheet,
  Text,
  type ImageCropperHandle,
} from "@syn/ui";
import { useProfile } from "@/lib/data/use-profile";
import { PROFILE_COPY as COPY } from "./copy";
import { CropStep, CropStepHeader } from "./crop-step";

export interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Where focus goes on close when the opener (a menu row) is gone. */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

/** A photo inline in a scenario, as the device's picker would hand it over. */
async function readPhoto(url: string): Promise<Blob> {
  const response = await fetch(url);
  return response.blob();
}

export function ProfileSheet({
  open,
  onOpenChange,
  returnFocusRef,
}: ProfileSheetProps) {
  const { account, start, draft, setDraft, saveName, uploadPhoto } =
    useProfile();
  const [picked, setPicked] = React.useState<Blob | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [notSaved, setNotSaved] = React.useState(false);
  const [announce, setAnnounce] = React.useState("");
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const cropperRef = React.useRef<ImageCropperHandle>(null);
  const started = React.useRef(false);
  const ids = {
    reason: React.useId(),
    line: React.useId(),
  };

  const saved = account.data;
  const name = draft ?? saved?.name ?? "";
  const trimmed = name.trim();
  const changed =
    saved !== undefined && trimmed !== "" && trimmed !== saved.name;
  const uploading = uploadPhoto.isPending;

  const upload = React.useCallback(
    (photo: Blob) => {
      setNotSaved(false);
      setPreview(URL.createObjectURL(photo));
      setAnnounce(COPY.uploading);
      uploadPhoto.mutate(photo, {
        onSuccess: () => setAnnounce(COPY.photoUpdated),
        onError: () => {
          setNotSaved(true);
          setAnnounce(COPY.notSaved);
        },
        onSettled: () => setPreview(null),
      });
    },
    [uploadPhoto],
  );

  // The object URL of a photo under way goes when the upload settles.
  React.useEffect(() => {
    if (preview === null) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  // A capture's starting state, once (`?state=profile-*`).
  React.useEffect(() => {
    if (!open || start === undefined || started.current) return;
    started.current = true;
    if (start.draftName !== undefined) setDraft(start.draftName);
    if (start.step === "not-saved") setNotSaved(true);
    if (start.photo === undefined) return;
    void readPhoto(start.photo).then((photo) =>
      start.step === "crop" ? setPicked(photo) : upload(photo),
    );
  }, [open, start, setDraft, upload]);

  // Each opening focuses the title; the sheet's frame focuses only its own.
  React.useEffect(() => {
    if (!open || picked !== null) return;
    const frame = requestAnimationFrame(() => titleRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open, picked]);

  function close(next: boolean) {
    if (next) return;
    // A picked photo is dropped; the typed name stays in the draft.
    setPicked(null);
    setNotSaved(false);
    onOpenChange(false);
  }

  function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // The same file picked twice still fires next time.
    event.target.value = "";
    if (file !== undefined) setPicked(file);
  }

  async function onUsePhoto() {
    const cropper = cropperRef.current;
    if (cropper === null) return;
    try {
      const photo = await cropper.crop();
      setPicked(null);
      upload(photo);
    } catch {
      setPicked(null);
      setNotSaved(true);
      setAnnounce(COPY.notSaved);
    }
  }

  function onSave() {
    if (!changed || saveName.isPending) return;
    saveName.mutate(trimmed, {
      onSuccess: () => {
        setNotSaved(false);
        close(false);
      },
      onError: () => {
        setNotSaved(true);
        setAnnounce(COPY.notSaved);
      },
    });
  }

  const inCrop = picked !== null;

  const header = inCrop ? (
    <CropStepHeader onBack={() => setPicked(null)} />
  ) : (
    <div className="flex min-w-0 flex-1 items-center gap-(--space-2)">
      <Button
        variant="ghost"
        size="icon"
        aria-label={COPY.close}
        onClick={() => close(false)}
        className="-ms-(--space-3)"
      >
        <CloseIcon aria-hidden="true" />
      </Button>
      <Text
        ref={titleRef}
        as="h2"
        variant="row-title"
        weight={600}
        tabIndex={-1}
        className="outline-none"
      >
        {COPY.title}
      </Text>
    </div>
  );

  const footer = inCrop ? (
    <Button className="w-full" onClick={() => void onUsePhoto()}>
      {COPY.crop.use}
    </Button>
  ) : (
    <div className="flex flex-col gap-(--space-3)">
      {notSaved ? (
        <div
          id={ids.line}
          className="text-foreground flex items-center gap-(--space-2)"
        >
          <NotSavedIcon aria-hidden="true" className="size-4 shrink-0" />
          <Text as="span" variant="secondary">
            {COPY.notSaved}
          </Text>
        </div>
      ) : null}
      <Button
        className="w-full aria-disabled:opacity-40"
        aria-disabled={changed ? undefined : true}
        aria-describedby={
          notSaved ? ids.line : changed ? undefined : ids.reason
        }
        onClick={onSave}
      >
        {COPY.save}
      </Button>
      <span id={ids.reason} className="sr-only">
        {COPY.nothingToSave}
      </span>
    </div>
  );

  const photoUrl = preview ?? saved?.photoUrl ?? null;

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={close}
      title={inCrop ? COPY.crop.heading : COPY.title}
      header={header}
      // The × (or the back link) is in the header: no second close.
      headerAction={null}
      footer={footer}
      initialFocus="first-field"
      returnFocusRef={returnFocusRef}
      size="tall"
      classes={{
        content: inCrop
          ? "data-[vaul-drawer-direction=bottom]:h-(--profile-crop-h)"
          : "data-[vaul-drawer-direction=bottom]:h-(--profile-sheet-h)",
        header: "items-center pt-(--space-2)",
        body: "pt-(--space-2)",
        footer: "border-t-0",
      }}
    >
      {/* Polite: the upload's start and end, and a failure. Focus stays. */}
      <span role="status" aria-live="polite" className="sr-only">
        {announce}
      </span>

      {inCrop ? (
        <CropStep photo={picked} cropperRef={cropperRef} />
      ) : (
        <div className="flex flex-col gap-(--space-6)">
          <div
            aria-busy={uploading || undefined}
            className="flex flex-col items-center gap-(--space-2)"
          >
            <div className="relative">
              <Avatar
                src={photoUrl}
                name={saved?.name ?? ""}
                size={96}
                label={COPY.photo}
                decorative={photoUrl === null}
              />
              {uploading ? (
                // The pale wash over the new photo while it uploads.
                <span
                  aria-hidden="true"
                  className="bg-background absolute inset-0 rounded-full opacity-60"
                />
              ) : null}
            </div>
            {uploading ? (
              <div className="flex h-(--target) items-center">
                <LoadingText label={COPY.uploading} spinner />
              </div>
            ) : (
              <Button
                variant="ghost"
                onClick={() => fileRef.current?.click()}
                className="underline underline-offset-4 hover:bg-transparent"
              >
                {photoUrl === null ? COPY.addPhoto : COPY.changePhoto}
              </Button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              tabIndex={-1}
              aria-hidden="true"
              className="sr-only"
              onChange={onPick}
            />
          </div>

          <Input
            label={COPY.name}
            classes={{ label: "text-muted-foreground" }}
            value={name}
            autoComplete="name"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onSave();
            }}
          />

          <div className="flex flex-col gap-(--space-2)">
            <Text as="p" variant="secondary" tone="muted" weight={500}>
              {COPY.email}
            </Text>
            <Text as="p" variant="body" className="break-all">
              {saved?.email ?? ""}
            </Text>
          </div>
        </div>
      )}
    </ResponsiveSheet>
  );
}
