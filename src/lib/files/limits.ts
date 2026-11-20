/** Upload limits shared by every screen that accepts a file. */

/** A picked image may be this big before it is resized (it never gets stored at this size). */
export const IMAGE_INPUT_MAX_BYTES = 10 * 1024 * 1024;

/** Longest side of a stored image, in pixels. */
export const IMAGE_MAX_SIDE = 1600;

/** WebP quality of a stored image. */
export const IMAGE_QUALITY = 0.82;

/**
 * Largest manuscript (DOCX or PDF) or preview file.
 * PROVISIONAL: the client has not given a number yet (agreed with the user on 20 November 2026);
 * change it here once they do.
 */
export const FILE_MAX_BYTES = 10 * 1024 * 1024;
