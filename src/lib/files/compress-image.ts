import { fitWithin } from "./image-fit";
import { IMAGE_MAX_SIDE, IMAGE_QUALITY } from "./limits";

export type CompressedImage = {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
};

function toBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/webp", IMAGE_QUALITY));
}

function readDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Resizes a picked image to at most IMAGE_MAX_SIDE on its longest side and re-encodes it as WebP.
 * Re-encoding through a canvas also drops EXIF (camera, location). Rejects when the file cannot be
 * decoded or the browser cannot encode WebP (the caller shows that as an unreadable image).
 */
export async function compressImage(file: Blob): Promise<CompressedImage> {
  // `imageOrientation` keeps phone photos upright now that EXIF is dropped.
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const { width, height } = fitWithin(bitmap.width, bitmap.height, IMAGE_MAX_SIDE);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("canvas unavailable");
    context.drawImage(bitmap, 0, 0, width, height);
    const blob = await toBlob(canvas);
    if (!blob || blob.type !== "image/webp") throw new Error("webp unavailable");
    return { blob, dataUrl: await readDataUrl(blob), width, height };
  } finally {
    bitmap.close();
  }
}
