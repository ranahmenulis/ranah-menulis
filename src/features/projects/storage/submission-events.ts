const listeners = new Set<() => void>();

/** Runs `listener` whenever submissions changed on this device. Returns the way to stop. */
export function onSubmissionsChanged(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Tells every screen that reads submissions to read them again. Next keeps earlier pages alive
 * behind the current one, so without this the project page, the dialog in Studio, and the document
 * tags would still show the old count after a work is sent (same lesson as the registration store).
 */
export function notifySubmissionsChanged() {
  listeners.forEach((listener) => listener());
}
