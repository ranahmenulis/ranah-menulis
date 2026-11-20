"use client";

import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { FileStore } from "@/lib/files/file-store";
import { fileStore } from "@/lib/files/store";

type Props = {
  fileId: string;
  /** The name the downloaded file gets. */
  name: string;
  label?: string;
  store?: FileStore;
};

/**
 * Downloads a file kept on this device. The file is read when the button is pressed; when it is
 * gone (storage cleared) the button says so instead of failing silently.
 */
export function DownloadFileButton({ fileId, name, label = "Unduh", store }: Props) {
  const [missing, setMissing] = useState(false);

  async function download() {
    setMissing(false);
    try {
      const stored = await (store ?? fileStore()).get(fileId);
      if (!stored) return setMissing(true);
      const url = URL.createObjectURL(stored.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch {
      setMissing(true);
    }
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-3">
      <Button variant="secondary" size="sm" onClick={() => void download()}>
        <DownloadSimple size={18} aria-hidden />
        {label}
      </Button>
      {missing && (
        <span role="alert" className="text-sm text-danger">
          Berkas ini tidak ada di perangkat ini.
        </span>
      )}
    </span>
  );
}
