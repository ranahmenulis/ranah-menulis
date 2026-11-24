import type { DocumentSummary, StudioFolder } from "../../storage/document-store";
import type { Work } from "../../works";

/** The dialog currently open in the Dokumen tab, with what it acts on. */
export type Pending =
  | { kind: "rename"; doc: DocumentSummary }
  | { kind: "classification"; doc: DocumentSummary }
  | { kind: "renameFolder"; id: string; name: string }
  | { kind: "newFolder" }
  | { kind: "newBook"; collectionId: string | null }
  | { kind: "newWork"; collectionId: string | null }
  | { kind: "sendBook"; folder: StudioFolder }
  | { kind: "bookSettings"; folder: StudioFolder }
  | { kind: "classifyBook"; folder: StudioFolder }
  | { kind: "move"; doc: DocumentSummary }
  | { kind: "moveWork"; work: Work }
  | { kind: "sendToProject"; doc: DocumentSummary }
  | { kind: "delete"; doc: DocumentSummary };
