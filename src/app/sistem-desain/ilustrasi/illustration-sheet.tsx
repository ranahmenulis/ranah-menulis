import type { ReactNode } from "react";
import { Campfire, LitWindows } from "@/components/illustrations/community-art";
import { ClassPath } from "@/components/illustrations/class-art";
import { SentEnvelopes } from "@/components/illustrations/envelope-art";
import { Bunting } from "@/components/illustrations/event-art";
import { Podium } from "@/components/illustrations/podium-art";
import {
  AnthologyCover,
  ClassCover,
  ContestCover,
  SoloCover,
} from "@/components/illustrations/cover-art";
import { SkyByHour, type DayPart } from "@/components/illustrations/home-art";
import {
  LetterQuill,
  NoticeLantern,
  ProfileShelf,
  SavedBook,
} from "@/components/illustrations/personal-art";
import { BookAssembly, Bookshelf } from "@/components/illustrations/projects-art";
import {
  AdminArt,
  EditorArt,
  JudgeArt,
  MentorArt,
  OrganizerArt,
} from "@/components/illustrations/role-art";
import { RisingPath } from "@/components/illustrations/path-art";
import { WritingDesk } from "@/components/illustrations/studio-art";
import { heroArtClass, heroCardClass, heroSceneClass } from "@/components/ui/card";
import { MountainScene } from "@/features/studio/components/streak/streak-art";

type Item = {
  page: string;
  title: string;
  meaning: string;
  art: (cls: string) => ReactNode;
  /** A sky landscape filling the right side (Streak hero), not an object at bottom right. */
  scene?: boolean;
};

const DAY_PARTS: DayPart[] = ["pagi", "siang", "senja", "malam"];

const ITEMS: Item[] = [
  {
    page: "Studio · Streak",
    title: "Gunung, bulan, pinus",
    meaning: "Mendaki sedikit demi sedikit (sudah terpasang)",
    art: (c) => <MountainScene className={c} />,
    scene: true,
  },
  {
    page: "Studio · Dokumen",
    title: "Meja tulis",
    meaning: "Tempat kerja menulis",
    art: (c) => <WritingDesk className={c} />,
  },
  {
    page: "Studio · Statistik",
    title: "Jalan menanjak",
    meaning: "Perkembangan dari waktu ke waktu",
    art: (c) => <RisingPath className={c} />,
    scene: true,
  },
  ...DAY_PARTS.map((part) => ({
    page: `Beranda · ${part}`,
    title: "Langit menurut jam",
    meaning: "Menyapa sesuai waktu penulis",
    art: (c: string) => <SkyByHour part={part} className={c} />,
    scene: true,
  })),
  {
    page: "Community",
    title: "Jendela yang menyala",
    meaning: "Banyak penulis menulis bersama",
    art: (c) => <LitWindows className={c} />,
    scene: true,
  },
  {
    page: "Grup Penulis",
    title: "Api unggun",
    meaning: "Kelompok kecil yang akrab",
    art: (c) => <Campfire className={c} />,
    scene: true,
  },
  {
    page: "Event",
    title: "Tenda dan umbul-umbul",
    meaning: "Acara bersama",
    art: (c) => <Bunting className={c} />,
    scene: true,
  },
  {
    page: "Projects · katalog",
    title: "Rak buku",
    meaning: "Pintu ke penerbitan",
    art: (c) => <Bookshelf className={c} />,
  },
  {
    page: "Dasbor Kelas",
    title: "Jalan bertanda modul",
    meaning: "Belajar bertahap",
    art: (c) => <ClassPath className={c} />,
    scene: true,
  },
  {
    page: "Dasbor Solo",
    title: "Buku yang dirakit",
    meaning: "Naskah, sampul, buku jadi",
    art: (c) => <BookAssembly className={c} />,
  },
  {
    page: "Hasil Lomba",
    title: "Podium dan daun salam",
    meaning: "Pengumuman pemenang",
    art: (c) => <Podium className={c} />,
  },
  {
    page: "Proyek saya",
    title: "Amplop terkirim",
    meaning: "Karya yang sedang berjalan",
    art: (c) => <SentEnvelopes className={c} />,
  },
  {
    page: "Profil",
    title: "Rak pribadi",
    meaning: "Satu buku per karya (contoh: 7)",
    art: (c) => <ProfileShelf works={7} className={c} />,
  },
  {
    page: "Tersimpan",
    title: "Buku berpita",
    meaning: "Disimpan untuk dibaca",
    art: (c) => <SavedBook className={c} />,
  },
  {
    page: "Notifikasi",
    title: "Amplop dan lentera",
    meaning: "Kabar masuk",
    art: (c) => <NoticeLantern className={c} />,
  },
  {
    page: "Pengaturan dan akun",
    title: "Surat dan pena bulu",
    meaning: "Identitas",
    art: (c) => <LetterQuill className={c} />,
  },
  {
    page: "Kelola · Editor",
    title: "Kaca pembesar",
    meaning: "Meninjau naskah",
    art: (c) => <EditorArt className={c} />,
  },
  {
    page: "Kelola · Juri",
    title: "Timbangan",
    meaning: "Menilai dengan adil",
    art: (c) => <JudgeArt className={c} />,
  },
  {
    page: "Kelola · Mentor",
    title: "Papan tulis",
    meaning: "Mengajar",
    art: (c) => <MentorArt className={c} />,
  },
  {
    page: "Kelola · Organizer",
    title: "Papan jadwal",
    meaning: "Mengatur proyek",
    art: (c) => <OrganizerArt className={c} />,
  },
  {
    page: "Kelola · Admin",
    title: "Perisai",
    meaning: "Menjaga platform",
    art: (c) => <AdminArt className={c} />,
  },
];

const COVERS = [
  { label: "Antologi", art: <AnthologyCover className="size-full" /> },
  { label: "Solo", art: <SoloCover className="size-full" /> },
  { label: "Kelas Menulis", art: <ClassCover className="size-full" /> },
  { label: "Lomba", art: <ContestCover className="size-full" /> },
];

/** The Streak hero card, so each drawing is judged where it will live. */
function HeroCard({ item }: { item: Item }) {
  return (
    <div className={`${heroCardClass} h-44 md:p-5`}>
      {item.art(item.scene ? heroSceneClass : heroArtClass)}
      <p className="text-xs text-ink-muted">{item.page}</p>
      <p className="mt-1 heading-sm">{item.title}</p>
      <p className="mt-1 max-w-40 text-xs text-ink-soft">{item.meaning}</p>
    </div>
  );
}

function ThemePane({ theme }: { theme: "light" | "dark" }) {
  return (
    <section data-theme={theme} className="grid content-start gap-5 bg-canvas p-4 text-ink md:p-6">
      <h2 className="heading-md">{theme === "light" ? "Terang" : "Gelap"}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {ITEMS.map((item) => (
          <HeroCard key={`${item.page}-${item.title}`} item={item} />
        ))}
      </div>
      <h3 className="mt-4 heading-sm">Sampul kategori (4:5)</h3>
      <div className="grid grid-cols-4 gap-3">
        {COVERS.map((c) => (
          <figure key={c.label} className="grid gap-1.5">
            <div className="aspect-4/5 overflow-hidden rounded-xl border border-line">{c.art}</div>
            <figcaption className="text-xs text-ink-muted">{c.label}</figcaption>
          </figure>
        ))}
      </div>
      <h3 className="mt-4 heading-sm">Ukuran keadaan kosong</h3>
      <div className="flex flex-wrap gap-4">
        {ITEMS.slice(1, 9).map((item) => (
          <div
            key={`empty-${item.page}`}
            className="grid h-28 w-44 place-items-center rounded-xl bg-accent-subtle"
          >
            {item.art("h-24 w-auto")}
          </div>
        ))}
      </div>
    </section>
  );
}

/** Development sheet of every illustration, light and dark side by side (DESIGN.md 7.10). */
export function IllustrationSheet() {
  return (
    <main className="min-h-dvh bg-canvas">
      <header className="p-6">
        <h1 className="heading-lg">Lembar ilustrasi</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-soft">
          Usulan ilustrasi per halaman, ditampilkan di kartu hero gaya Streak. Semua SVG memakai
          token, jadi ikut tema terang dan gelap.
        </p>
      </header>
      <div className="grid xl:grid-cols-2">
        <ThemePane theme="light" />
        <ThemePane theme="dark" />
      </div>
    </main>
  );
}
