export type SniffedType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const DOCX_TYPE: SniffedType =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0) =>
  signature.every((value, i) => bytes[offset + i] === value);

/**
 * The real type of a file from its first bytes, ignoring the name and the type the browser
 * reports (both are chosen by whoever picked the file). Null when it is none of the allowed types.
 * A DOCX is a ZIP that holds word/document.xml; any other ZIP is refused.
 */
export function sniffType(bytes: Uint8Array): SniffedType | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8))
    return "image/webp";
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) return "application/pdf";
  if (startsWith(bytes, [0x50, 0x4b, 0x03, 0x04])) {
    const text = new TextDecoder("latin1").decode(bytes);
    return text.includes("word/document.xml") ? DOCX_TYPE : null;
  }
  return null;
}
