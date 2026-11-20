const SIZE = 256;

/**
 * Turns the chosen photo into a small square WebP data URL (centre crop) so it fits in
 * localStorage. Rejects when the file is not a readable image; the caller shows that as the photo
 * type error. The photo never leaves the device while accounts are dummy.
 */
export async function fileToAvatar(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const side = Math.min(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("canvas unavailable");
    // Keep a white backdrop so a cut-out PNG does not turn black where it is transparent.
    context.fillStyle = "#fff";
    context.fillRect(0, 0, SIZE, SIZE);
    context.drawImage(
      bitmap,
      (bitmap.width - side) / 2,
      (bitmap.height - side) / 2,
      side,
      side,
      0,
      0,
      SIZE,
      SIZE,
    );
    return canvas.toDataURL("image/webp", 0.85);
  } finally {
    bitmap.close();
  }
}
