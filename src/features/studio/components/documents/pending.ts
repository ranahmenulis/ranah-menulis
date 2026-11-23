import type { DocumentSummary, StudioFolder } from "../../storage/document-store";

/** The dialog currently open in the Dokumen tab, with what it acts on. */
export type Pending =
  | { kind: "rename"; doc: DocumentSummary }
  | { kind: "classification"; doc: DocumentSummary }
  | { kind: "renameFolder"; id: string; name: string }
  | { kind: "newFolder" }
  | { kind: "newBook" }
  | { kind: "bookSettings"; folder: StudioFolder }
  | { kind: "move"; doc: DocumentSummary }
  | { kind: "sendToProject"; doc: DocumentSummary }
  | { kind: "delete"; doc: DocumentSummary };
