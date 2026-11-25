import type { studioImport as source } from "./import-id";

export const studioImport: typeof source = {
  title: "There are manuscripts on this device",
  body: "This device holds {count} manuscripts and folders that are not in your account yet. Copy them to your account so they open on your other devices too?",
  note: "They stay on this device. Version history is not copied.",
  copy: "Copy to account",
  later: "Not now",
  running: "Copying…",
  link: "Copy manuscripts from this device ({count})",
  done: "{imported} manuscripts copied to your account.",
  doneFolders: "{folders} folders copied.",
  skipped: "{skipped} manuscripts were skipped (too large or not valid) and stay on this device.",
  nothing: "Everything is already in your account.",
  close: "Close",
  failed: "Nothing was copied. Nothing was lost from this device. Try again.",
  retry: "Try again",
};
