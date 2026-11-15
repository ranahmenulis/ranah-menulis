"use client";

import { Trash } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Drawer } from "@/components/ui/drawer";
import { Menu } from "@/components/ui/menu";
import { useToast } from "@/components/ui/toast";
import { ConflictDialog } from "@/features/studio/components/conflict-dialog";
import { HelpDrawer } from "@/features/studio/components/help-drawer";

const local = {
  title: "Yang Ditunggu Nenek di Bawah Jambu Air",
  savedAt: new Date(2026, 10, 15, 14, 36),
  words: 170,
  paragraphs: [
    "Hujan pertama bulan November selalu datang sore hari.",
    "Nasi sisa itu selalu ia bungkus daun pisang dan ia taruh di ambang jendela. Aku tidak pernah bertanya siapa yang mengambilnya, dan Nenek tidak pernah merasa perlu menjelaskan.",
  ],
};
const remote = {
  title: local.title,
  savedAt: new Date(2026, 10, 15, 14, 31),
  words: 163,
  paragraphs: [
    local.paragraphs[0],
    "Nasi sisa itu selalu ia bungkus daun pisang dan ia taruh di ambang jendela. Mungkin kucing, kata Ibu. Nenek hanya tersenyum.",
  ],
};

/** Component gallery for the overlay primitives. Development only (the page returns 404 in production). */
export function OverlayDemo() {
  const toast = useToast();
  const [theme, setTheme] = useState<"auto" | "light" | "dark">("auto");
  const [dialog, setDialog] = useState<"plain" | "danger" | "conflict" | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [help, setHelp] = useState(false);

  return (
    <div
      data-theme={theme === "auto" ? undefined : theme}
      className="min-h-dvh bg-canvas p-4 text-ink md:p-8"
    >
      <div className="mx-auto grid max-w-170 gap-8">
        <div className="flex items-center justify-between">
          <h1 className="heading-lg">Overlay</h1>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setTheme((t) => (t === "auto" ? "light" : t === "light" ? "dark" : "auto"))
            }
          >
            Tema: {theme === "auto" ? "ikut sistem" : theme === "light" ? "terang" : "gelap"}
          </Button>
        </div>

        <section className="grid gap-3">
          <h2 className="heading-sm">Dialog</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setDialog("plain")}>
              Dialog biasa
            </Button>
            <Button variant="secondary" onClick={() => setDialog("danger")}>
              Dialog berbahaya
            </Button>
            <Button variant="secondary" onClick={() => setDialog("conflict")}>
              Dialog konflik
            </Button>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="heading-sm">Laci</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setDrawer(true)}>
              Laci
            </Button>
            <Button variant="secondary" onClick={() => setHelp(true)}>
              Bantuan menulis
            </Button>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="heading-sm">Menu</h2>
          <div className="flex justify-end">
            <Menu
              label="Menu dokumen"
              items={[
                {
                  id: "a",
                  label: "Kirim ke proyek",
                  onSelect: () => toast({ message: "Dikirim." }),
                },
                { id: "b", label: "Ekspor", hint: "TXT, PDF", onSelect: () => {} },
                { id: "s", type: "separator" },
                {
                  id: "d",
                  label: "Hapus permanen",
                  danger: true,
                  icon: <Trash />,
                  onSelect: () => setDialog("danger"),
                },
              ]}
            />
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="heading-sm">Toast</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => toast({ message: "Tautan disalin.", key: "copy" })}
            >
              Kabar
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                toast({
                  message: "Dokumen dipindah ke Sampah.",
                  action: { label: "Urungkan", onSelect: () => {} },
                })
              }
            >
              Dengan aksi
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                toast({
                  tone: "error",
                  key: "err",
                  message: "Tautan gagal disalin. Coba lagi.",
                  action: { label: "Coba lagi", onSelect: () => {} },
                })
              }
            >
              Galat
            </Button>
          </div>
        </section>
      </div>

      <Dialog
        open={dialog === "plain"}
        onClose={() => setDialog(null)}
        title="Ubah nama dokumen"
        description="Nama baru hanya terlihat olehmu. Dokumen tetap pribadi."
        actions={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>
              Batal
            </Button>
            <Button onClick={() => setDialog(null)}>Simpan</Button>
          </>
        }
      />
      <Dialog
        open={dialog === "danger"}
        onClose={() => setDialog(null)}
        role="alertdialog"
        title="Hapus permanen dokumen ini?"
        description="Isi dokumen akan hilang dan tidak bisa dipulihkan. Karya yang sudah kamu bagikan ke Community tetap ada."
        actions={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>
              Batal
            </Button>
            <Button variant="danger" onClick={() => setDialog(null)}>
              Hapus permanen
            </Button>
          </>
        }
      />
      <ConflictDialog
        open={dialog === "conflict"}
        local={local}
        remote={remote}
        onResolve={() => setDialog(null)}
      />
      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title="Komentar"
        closeLabel="Tutup komentar"
        className="md:top-0"
        width={420}
      >
        <p className="p-5 text-sm text-ink-muted">
          Belum ada komentar. Jadilah yang pertama membaca dengan saksama.
        </p>
      </Drawer>
      <HelpDrawer open={help} onClose={() => setHelp(false)} />
    </div>
  );
}
