"use client";

/**
 * CropStep — the Profile sheet's crop step (USE-84; profile-sheet/states/
 * crop.md): "‹ Profile" on the left, "Crop photo", and `ImageCropper`. A step
 * inside the same sheet, never a second sheet. The step's one primary, "Use
 * photo", sits in the sheet's foot, so the sheet holds `cropperRef`.
 */
import * as React from "react";
import {
  BackIcon,
  Button,
  ImageCropper,
  Text,
  type ImageCropperHandle,
} from "@syn/ui";
import { PROFILE_COPY } from "./copy";

const COPY = PROFILE_COPY.crop;

export interface CropStepHeaderProps {
  onBack: () => void;
}

/** The step's header: the back link alone, no × (crop.md). */
export function CropStepHeader({ onBack }: CropStepHeaderProps) {
  return (
    <div className="flex min-w-0 flex-1 items-center">
      <Button
        variant="ghost"
        aria-label={COPY.backLabel}
        onClick={onBack}
        className="-ms-(--space-3) gap-(--space-1) px-(--space-3) text-(length:--fs-body) font-normal"
      >
        <BackIcon aria-hidden="true" />
        {COPY.back}
      </Button>
    </div>
  );
}

export interface CropStepProps {
  photo: Blob;
  cropperRef: React.Ref<ImageCropperHandle>;
}

export function CropStep({ photo, cropperRef }: CropStepProps) {
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  // The heading takes focus on entry (words-and-access.md › Crop step).
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => headingRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="flex flex-col gap-(--space-4)">
      <Text
        ref={headingRef}
        as="h3"
        variant="heading"
        tabIndex={-1}
        className="outline-none"
      >
        {COPY.heading}
      </Text>
      <ImageCropper
        ref={cropperRef}
        file={photo}
        copy={{ region: COPY.region, zoom: COPY.zoom, hint: COPY.hint }}
      />
    </div>
  );
}
