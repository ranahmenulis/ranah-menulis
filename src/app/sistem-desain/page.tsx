import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Avatar } from "@/components/ui/avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Field, Input, Select, describedBy } from "@/components/ui/field";
import { Monogram, Wordmark } from "@/components/ui/logo";
import { EmptyState, ErrorBanner, FeedItemSkeleton, Notice, RetryButton } from "@/components/ui/states";
import { StatusSubmission, type SubmissionStatus } from "@/components/ui/status-submission";
import { TextLink } from "@/components/ui/text-link";
import { VisibilityTag } from "@/components/ui/visibility-tag";
import { Tabs } from "@/components/ui/tabs";

// Papan pratinjau komponen untuk pengembangan. Tidak tersedia di produksi.
export const metadata: Metadata = { title: "Sistem desain · RanahMenulis", robots: { index: false } };

const statuses: SubmissionStatus[] = [
  "draf", "terkirim", "peninjauan", "perlu-revisi", "revisi-terkirim", "diterima", "ditolak", "ditarik",
];

const swatches = [
  "canvas", "surface", "subtle", "ink", "ink-muted", "ink-faint", "line", "line-strong", "danger", "danger-subtle",
] as const;

function Pane({ theme }: { theme: "light" | "dark" }) {
  const emailError = "Alamat email belum lengkap. Tambahkan nama domain, misalnya @gmail.com.";
  return (
    <div data-theme={theme} className="min-w-0 bg-canvas p-6 text-ink md:p-8">
      <p className="mb-6 text-xs text-ink-muted">{theme === "light" ? "Terang" : "Gelap"}</p>

      <div className="grid gap-12">
        <section className="grid gap-4">
          <h2 className="heading-md">Warna</h2>
          <div className="grid grid-cols-5 gap-2">
            {swatches.map((s) => (
              <div key={s} className="grid gap-1">
                <div className="h-10 border border-line" style={{ background: `var(--${s})` }} />
                <span className="truncate text-xs text-ink-muted">{s}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4">
          <h2 className="heading-md">Tipografi</h2>
          <p className="read-title">Rumah yang kutinggalkan dengan pintu terbuka</p>
          <p className="read-subtitle">Prolog sebuah cerpen tentang pulang.</p>
          <p className="read-body text-ink-read">
            Hujan turun pelan di atas atap seng, dan Laras menghitung jam dari bunyinya. Ia belum memutuskan apakah akan membuka surat itu.
          </p>
          <p className="feed-title">Catatan dari kamar sewa di Bandung</p>
          <p className="feed-excerpt">Cuplikan dua baris yang dipotong di feed, ditulis dalam serif agar terasa seperti suara penulis.</p>
          <p className="figure">12<span className="text-ink-muted"> hari</span></p>
          <p className="text-sm tabular-nums">Perlu Revisi · 3 hari lagi · Rp75.000</p>
        </section>

        <section className="grid gap-4">
          <h2 className="heading-md">Tombol</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Mulai menulis</Button>
            <Button variant="secondary">Simpan draf</Button>
            <Button variant="text">Batal</Button>
            <Button variant="danger">Hapus permanen</Button>
            <Button variant="danger-text">Hapus</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Kecil</Button>
            <Button size="sm" variant="secondary">Kecil</Button>
            <Button disabled>Nonaktif</Button>
            <Button loading>Mengirim</Button>
            <ButtonLink href="/sistem-desain" size="hero">Tombol hero</ButtonLink>
          </div>
          <p className="text-xs text-ink-muted">Satu tombol terisi per layar; papan ini sengaja memperlihatkan semuanya.</p>
        </section>

        <section className="grid gap-4">
          <h2 className="heading-md">Form</h2>
          <Field id={`email-${theme}`} label="Email" hint="Dipakai untuk masuk.">
            <Input id={`email-${theme}`} type="email" autoComplete="email" placeholder="nama@contoh.id" aria-describedby={describedBy(`email-${theme}`, { hint: true })} />
          </Field>
          <Field id={`galat-${theme}`} label="Email" error={emailError}>
            <Input id={`galat-${theme}`} defaultValue="rinjani@" aria-invalid aria-describedby={describedBy(`galat-${theme}`, { error: true })} />
          </Field>
          <Field id={`negara-${theme}`} label="Negara" optional>
            <Select id={`negara-${theme}`} defaultValue="id">
              <option value="id">Indonesia</option>
              <option value="my">Malaysia</option>
            </Select>
          </Field>
          <Field id={`ok-${theme}`} label="Email" success="Email ini belum terdaftar. Kamu bisa melanjutkan.">
            <Input id={`ok-${theme}`} defaultValue="hafiz@contoh.id" />
          </Field>
        </section>

        <section className="grid gap-4">
          <h2 className="heading-md">Chip, tab, avatar, tautan</h2>
          <div role="group" aria-label="Genre" className="flex flex-wrap gap-2">
            <Chip pressed>Cerpen</Chip>
            <Chip>Puisi</Chip>
            <Chip>Esai</Chip>
            <Chip>Novel</Chip>
          </div>
          <Tabs
            label="Contoh tab"
            value="mengikuti"
            items={[
              { id: "mengikuti", label: "Mengikuti", href: "#" },
              { id: "jelajahi", label: "Jelajahi", href: "#" },
            ]}
          />
          <div className="flex items-end gap-4">
            {([20, 32, 44, 64, 88] as const).map((s) => (
              <Avatar key={s} name="Rinjani Putri" size={s} />
            ))}
            <Avatar name="H" size={44} />
            <Avatar name="Anak Agung Gede Ngurah Pemayun" size={44} />
          </div>
          <p className="text-sm">
            <TextLink href="#">Tautan antarmuka</TextLink> dan{" "}
            <TextLink href="#" prose>tautan di teks karya</TextLink>.
          </p>
        </section>

        <section className="grid gap-4">
          <h2 className="heading-md">Status dan visibilitas</h2>
          <div className="flex flex-wrap items-center gap-2">
            {statuses.map((s) => (
              <StatusSubmission key={s} status={s} />
            ))}
            <StatusSubmission status="perlu-revisi" outlineRevisi />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <VisibilityTag visibility="pribadi" />
            <VisibilityTag visibility="grup" groupName="Penulis Fiksi Medan" />
            <VisibilityTag visibility="publik" />
          </div>
        </section>

        <section className="grid gap-4">
          <h2 className="heading-md">Keadaan</h2>
          <EmptyState action={<Button>Mulai menulis</Button>}>Belum ada tulisan di sini.</EmptyState>
          <FeedItemSkeleton />
          <ErrorBanner action={<RetryButton />}>Daftar tulisan gagal dimuat. Tulisanmu tetap aman.</ErrorBanner>
          <Notice>Zona waktu perangkatmu berbeda dari profil. Hari menulis mengikuti profil.</Notice>
        </section>

        <section className="grid gap-4">
          <h2 className="heading-md">Logo</h2>
          <Wordmark height={32} />
          <Monogram height={24} />
        </section>
      </div>
    </div>
  );
}

export default function SistemDesainPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="mx-auto grid max-w-6xl border border-line md:grid-cols-2">
      <Pane theme="light" />
      <Pane theme="dark" />
    </main>
  );
}
