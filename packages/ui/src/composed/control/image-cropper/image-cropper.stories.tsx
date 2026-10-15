import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Button } from "../../../primitives/control/button";
import { Text } from "../../../primitives/typography/text";
import { ImageCropper, type ImageCropperHandle } from "./image-cropper";

/**
 * The Profile sheet's crop step (USE-84, D-USE-37): a 280px area under a
 * 240px circle mask, the zoom slider and the hint. The step's primary lives
 * in the caller's footer, which calls `crop()` through a ref.
 *
 * Re-drawing through the canvas discards every EXIF tag, which is also how the
 * location a photo was taken stops travelling with it.
 */
const meta: Meta<typeof ImageCropper> = {
  title: "Composed/Control/ImageCropper",
  component: ImageCropper,
};

export default meta;

/** A generated landscape file, so the story needs no fixture asset on disk. */
function useSampleFile(): Blob | null {
  const [file, setFile] = React.useState<Blob | null>(null);

  React.useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 360;
    const context = canvas.getContext("2d");
    if (context === null) return;
    const styles = getComputedStyle(document.documentElement);
    const gradient = context.createLinearGradient(0, 0, 640, 360);
    gradient.addColorStop(0, styles.getPropertyValue("--syn-brand-500"));
    gradient.addColorStop(1, styles.getPropertyValue("--syn-neutral-900"));
    context.fillStyle = gradient;
    context.fillRect(0, 0, 640, 360);
    canvas.toBlob((blob) => setFile(blob), "image/jpeg");
  }, []);

  return file;
}

export const Cropping: StoryObj = {
  render: function Render() {
    const file = useSampleFile();
    const cropper = React.useRef<ImageCropperHandle>(null);
    const [cropped, setCropped] = React.useState<string | null>(null);

    if (file === null) return <Text as="p">Preparing a sample image</Text>;

    return (
      <div className="flex w-80 flex-col gap-(--space-4) p-(--space-8)">
        <ImageCropper ref={cropper} file={file} />
        <Button
          onClick={() =>
            void cropper.current
              ?.crop()
              .then((blob) => setCropped(URL.createObjectURL(blob)))
          }
        >
          Use photo
        </Button>
        {cropped === null ? null : (
          <img
            src={cropped}
            alt="The cropped result"
            className="size-24 rounded-full"
          />
        )}
      </div>
    );
  },
};
