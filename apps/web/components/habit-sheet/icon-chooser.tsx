"use client";

import * as React from "react";

import {
  Button,
  CuratedIconGrid,
  EmojiPicker,
  HelperText,
  ImageCropper,
  ItemIcon,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from "@syn/ui";
import type { CategoryKey, IconValue } from "@syn/types";

import { iconImageUrl } from "@/lib/assets/icon-url";
import { ICON_ACCEPT } from "@/lib/hooks/use-icon-upload";

import { HABIT_SHEET_COPY as COPY } from "./copy";

/**
 * LB-02's icon control: a well showing the current icon, which expands into
 * three tabs.
 *
 * INLINE, NOT A NESTED SHEET (SET-4's dev call, and the document's word —
 * "an inline three-tab chooser"). A sheet inside a sheet on a phone puts two
 * scrims between a person and the form they were filling in, for a decision
 * that is decoration.
 *
 * ONE CONTROL, THREE TABS. Radix `Tabs` gives arrow-key movement and a single
 * Tab stop, so the whole chooser is one thing to move through rather than
 * eighty glyphs in the tab order.
 *
 * The image tab is the only one that is asynchronous: crop, then park, and the
 * parked blob is committed by the sheet's save. Nothing reaches the bucket
 * until the habit is saved, which is why abandoning the sheet costs nothing.
 */
export function IconChooser({
  value,
  onChange,
  pendingPreviewUrl,
  onPickFile,
  onRemoveImage,
  uploading,
  error,
  disabled = false,
}: {
  value: IconValue;
  onChange: (icon: IconValue) => void;
  /** A local object URL while a cropped image is parked. */
  pendingPreviewUrl: string | null;
  onPickFile: (file: File) => void;
  onRemoveImage: () => void;
  uploading: boolean;
  error: string | null;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [cropping, setCropping] = React.useState<File | null>(null);

  const previewUrl = pendingPreviewUrl ?? iconImageUrl(value);

  return (
    <div className="flex flex-col gap-(--space-2)">
      <Label>{COPY.icon}</Label>

      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-label={`${COPY.icon}: ${describeIcon(value)}`}
        onClick={() => {
          setOpen((current) => !current);
        }}
        className="flex size-12 items-center justify-center rounded-(--radius) border border-edge disabled:opacity-40"
      >
        <ItemIcon icon={value} size={48} imageUrl={previewUrl} />
      </button>

      {!open ? null : (
        <Tabs defaultValue="emoji" className="mt-(--space-2)">
          <TabsList>
            <TabsTrigger value="emoji">{COPY.iconTabs.emoji}</TabsTrigger>
            <TabsTrigger value="curated">{COPY.iconTabs.curated}</TabsTrigger>
            <TabsTrigger value="image">{COPY.iconTabs.image}</TabsTrigger>
          </TabsList>

          <TabsContent value="emoji">
            <EmojiPicker
              onSelect={(emoji) => {
                onChange({ kind: "emoji", value: emoji });
                setOpen(false);
              }}
            />
          </TabsContent>

          <TabsContent value="curated">
            <CuratedIconGrid
              value={value.kind === "curated" ? value.value : null}
              onChange={(name) => {
                onChange({
                  kind: "curated",
                  value: name,
                  colorKey:
                    value.kind === "curated" ? value.colorKey : null,
                });
              }}
              colorKey={value.kind === "curated" ? value.colorKey : null}
              onColorKeyChange={(key: CategoryKey | null) => {
                onChange({
                  kind: "curated",
                  value: value.kind === "curated" ? value.value : "dot",
                  colorKey: key,
                });
              }}
              search
            />
          </TabsContent>

          <TabsContent value="image">
            <div className="flex flex-col gap-(--space-3)">
              {cropping === null ? (
                <>
                  <input
                    type="file"
                    accept={ICON_ACCEPT}
                    disabled={disabled || uploading}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) setCropping(file);
                      // Let the same file be picked twice in a row.
                      event.target.value = "";
                    }}
                    className="text-(length:--fs-secondary)"
                  />
                  {value.kind === "image" || pendingPreviewUrl !== null ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        onRemoveImage();
                        onChange({
                          kind: "curated",
                          value: "dot",
                          colorKey: null,
                        });
                      }}
                      className="self-start"
                    >
                      {COPY.removeImage}
                    </Button>
                  ) : null}
                </>
              ) : (
                <ImageCropper
                  file={cropping}
                  onCrop={(blob) => {
                    onPickFile(
                      new File([blob], "icon.jpg", { type: "image/jpeg" }),
                    );
                    setCropping(null);
                    setOpen(false);
                  }}
                  onCancel={() => {
                    setCropping(null);
                  }}
                />
              )}

              {uploading ? (
                <Text as="p" variant="secondary" tone="secondary">
                  {COPY.uploading}
                </Text>
              ) : null}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {error === null ? null : <HelperText error>{error}</HelperText>}
    </div>
  );
}

/** The accessible name for the well — a word, never "icon". */
function describeIcon(icon: IconValue): string {
  if (icon.kind === "emoji") return icon.value;
  if (icon.kind === "image") return "your image";
  return icon.value;
}
