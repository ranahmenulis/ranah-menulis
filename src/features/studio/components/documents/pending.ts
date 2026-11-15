import type { StudioDocument } from "../../storage/document-store";

/** The dialog currently open in the Dokumen tab, with what it acts on. */
export type Pending =
  | { kind: "rename"; doc: StudioDocument }
  | { kind: "renameFolder"; id: string; name: string }
  | { kind: "newFolder" }
  | { kind: "move"; doc: StudioDocument }
  | { kind: "sendToProject"; doc: StudioDocument }
  | { kind: "delete"; doc: StudioDocument };
