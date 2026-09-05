import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Text } from "../../../primitives/typography/text";
import { ImageCropper } from "./image-cropper";

/**
 * Item icons are read at 24px in a column; an uncropped landscape photo at
 * 24px is a smear. Letting a person choose which square survives is the
 * difference between an icon and a stain.
 *
 * Zoom is two buttons, not a range input: official spec §9.7 rules out
 * sliders, and a slider here would be the hardest control on the screen to use
 * one-handed — which is the hand holding the phone that took the photo.
 *
 * Re-drawing through the canvas discards every EXIF tag, which is also how the
 * location a photo was taken stops travelling with it.
 */
const meta: Meta<typeof ImageCropper> = {
  title: "Composed/Control/ImageCropper",
  component: ImageCropper,
};

export default meta;

/** A generated file, so the story needs no fixture asset on disk. */
function useSampleFile(): File | null {
  const [file, setFile] = React.useState<File | null>(null);

  React.useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 360;
    const context = canvas.getContext("2d");
    if (context === null) return;

    const gradient = context.createLinearGradient(0, 0, 640, 360);
    gradient.addColorStop(0, "#2F8F80");
    gradient.addColorStop(1, "#7C63B8");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 640, 360);
    context.fillStyle = "#FAFAF8";
    context.font = "48px sans-serif";
    context.fillText("640 × 360", 200, 200);

    canvas.toBlob((blob) => {
      if (blob !== null)
        setFile(new File([blob], "sample.jpg", { type: "image/jpeg" }));
    }, "image/jpeg");
  }, []);

  return file;
}

export const Cropping: StoryObj = {
  render: function Render() {
    const file = useSampleFile();
    const [cropped, setCropped] = React.useState<string | null>(null);

    if (file === null) return <Text as="p">Preparing a sample image…</Text>;

    return (
      <div className="flex flex-col gap-(--space-4) p-(--space-6)">
        <ImageCropper
          file={file}
          onCrop={(blob) => setCropped(URL.createObjectURL(blob))}
          onCancel={() => setCropped(null)}
        />
        {cropped === null ? null : (
          <div className="flex flex-col gap-(--space-2)">
            <Text as="p" variant="caption" tone="secondary">
              Cropped output at 256px:
            </Text>
            <img
              src={cropped}
              alt="The cropped result"
              className="size-16 rounded-(--radius)"
            />
          </div>
        )}
      </div>
    );
  },
};
