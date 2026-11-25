const IMAGE_URL = /^data:(image\/(?:webp|jpeg|png));base64,([A-Za-z0-9+/=]+)$/;

/** Turns a base64 image data URL into a Blob; null for anything that is not one of the allowed types. */
export function dataUrlToBlob(dataUrl: string): Blob | null {
  const match = IMAGE_URL.exec(dataUrl);
  if (!match) return null;
  try {
    const binary = atob(match[2]);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: match[1] });
  } catch {
    return null;
  }
}
