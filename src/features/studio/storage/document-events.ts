import { createLocalChangeSignal } from "@/lib/local-change-signal";

export const { subscribe: onDocumentListChanged, notify: notifyDocumentListChanged } =
  createLocalChangeSignal("ranah:document-list-changed");
