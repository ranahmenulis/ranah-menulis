/** A file kept on this device. Replaced by Supabase Storage (with RLS) when the backend arrives. */
export type StoredFile = {
  id: string;
  name: string;
  type: string;
  size: number;
  blob: Blob;
  createdAt: number;
};

export interface FileStore {
  put(file: StoredFile): Promise<void>;
  get(id: string): Promise<StoredFile | null>;
  delete(id: string): Promise<void>;
}
