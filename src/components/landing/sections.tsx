import { Check, ChatCircle, HandsClapping, BookmarkSimple, ShareNetwork } from "@phosphor-icons/react/dist/ssr";
import { Accordion } from "@/components/ui/accordion";
import { Avatar } from "@/components/ui/avatar";
import { BookCover } from "@/components/ui/book-cover";
import { ButtonLink } from "@/components/ui/button";
import { Monogram, Wordmark } from "@/components/ui/logo";
import { TextLink } from "@/components/ui/text-link";
import { cn } from "@/lib/cn";
import { faq, heroDoc, heroLead, heroTitle, projects, projectsTitle, steps, stepsTitle, trust } from "./copy";
import { HeroStage } from "./hero-stage";
import { Grid, Section, SectionTop, Wrap } from "./layout";

export function Hero() {
  return (
    <section aria-labelledby="hero-h" className="pt-10 md:pt-24">
      <Wrap>
        <Grid>
          <h1 id="hero-h" className="display md:col-span-9">
            {heroTitle}
          </h1>
          <p className="mt-5 max-w-[560px] font-serif text-xl leading-7 text-ink-muted text-pretty md:col-span-6 md:mt-8 md:text-[22px] md:leading-8">
            {heroLead}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5 md:col-span-12 md:mt-10">
            <ButtonLink
              id="hero-cta"
              href="#daftar"
              size="hero"
              className="w-full md:w-auto"
            >
              Gabung daftar tunggu
            </ButtonLink>
            <ButtonLink href="#cara-kerja" variant="text">
              Lihat cara kerjanya
            </ButtonLink>
          </div>
          <HeroStage />
        </Grid>
      </Wrap>
    </section>
  );
}

/* ---------- Cara kerja ---------- */

function Frame({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <figure aria-label={label} className={cn("m-0 min-w-0 overflow-hidden border border-line bg-canvas", className)}>
      {children}
    </figure>
  );
}

function Step({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <li className="md:grid md:grid-cols-12 md:items-start md:gap-x-6">
      <div className="relative pl-10 md:col-span-4">
        <i aria-hidden className="absolute top-2.5 left-0 size-3.5 rounded-full bg-ink" />
        <h3 className="mb-3 font-serif text-[26px] leading-[34px] font-semibold">{title}</h3>
        <p className="font-serif text-base leading-[26px] text-ink-muted">{text}</p>
      </div>
      <div className="mt-5 pl-10 md:col-span-7 md:col-start-6 md:mt-0 md:pl-0">{children}</div>
    </li>
  );
}

const weekdays = ["S", "S", "R", "K", "J", "S", "M"];
// November 2026 mulai hari Minggu; kalender mulai Senin, jadi 6 sel kosong sebelum tanggal 1.
const calendar: ("blank" | "ring" | "empty" | "full")[] = [
  ...Array<"blank">(6).fill("blank"),
  "ring",
  "empty",
  ...Array<"full">(12).fill("full"),
  "blank",
];

function CalendarPreview() {
  return (
    <div className="grid grid-cols-[repeat(7,36px)]" role="img" aria-label="Kalender November 2026: dua belas hari berturut-turut tercapai">
      {weekdays.map((d, i) => (
        <span key={i} className="grid h-6 place-items-center text-xs text-ink-muted">
          {d}
        </span>
      ))}
      {calendar.map((kind, i) => {
        const today = i === 19;
        return (
          <span
            key={i}
            className={cn("grid size-9 place-items-center", today && "shadow-[inset_0_0_0_1px_var(--ink)]")}
          >
            {kind === "full" && <i className="size-3.5 rounded-full bg-ink" />}
            {kind === "ring" && <i className="size-3.5 rounded-full shadow-[inset_0_0_0_1.5px_var(--ink)]" />}
            {kind === "empty" && <i className="size-1 rounded-full bg-line-strong opacity-(--opacity-dot-empty)" />}
          </span>
        );
      })}
    </div>
  );
}

export function HowItWorks() {
  return (
    <Section id="cara-kerja" aria-labelledby="steps-h">
      <Wrap>
        <Grid>
          <SectionTop>
            <h2 id="steps-h" className="landing-h2">
              {stepsTitle}
            </h2>
          </SectionTop>
          <ol className="relative mt-10 grid list-none gap-14 p-0 before:absolute before:top-3 before:bottom-3 before:left-1.5 before:w-px before:bg-line md:col-span-12 md:mt-[72px] md:gap-24">
            <Step {...steps.menulis}>
              <Frame label="Cuplikan editor Studio">
                <div className="flex h-14 items-center gap-4 border-b border-line px-4">
                  <Monogram height={20} />
                  <span className="hidden max-w-[220px] truncate text-sm font-medium md:inline">{heroDoc.title}</span>
                  <span className="text-xs text-ink-muted tabular-nums">Pribadi · Tersimpan 14.02 · 167 kata</span>
                  <span className="ml-auto hidden h-8 items-center rounded-full border border-ink px-4 text-sm font-medium md:inline-flex">
                    Bagikan
                  </span>
                </div>
                <div className="px-4 py-5 md:p-7">
                  <p className="mb-4 font-serif text-[28px] leading-9 font-semibold tracking-[-0.015em]">{heroDoc.title}</p>
                  <p className="font-serif text-lg leading-[29px]">
                    Ada orang yang menunggu dengan duduk di beranda, memandangi ujung jalan sampai matanya perih. Nenek menunggu dengan basah.
                  </p>
                </div>
              </Frame>
            </Step>

            <Step {...steps.target}>
              <Frame label="Cuplikan kalender Streak di Studio">
                <div className="flex flex-wrap items-start gap-x-12 gap-y-6 px-4 py-5 md:p-7">
                  <div className="grid min-w-[200px] gap-5">
                    <div className="flex items-baseline gap-2.5">
                      <span className="figure">12</span>
                      <span className="text-sm text-ink-muted">hari berturut-turut</span>
                    </div>
                    <div className="grid gap-2">
                      <div className="flex justify-between text-xs tabular-nums">
                        <span>Hari ini 500 / 500 kata</span>
                        <span className="text-ink-muted">Tercapai</span>
                      </div>
                      <div className="h-1 bg-line">
                        <i className="block h-full w-full bg-ink" />
                      </div>
                    </div>
                  </div>
                  <CalendarPreview />
                </div>
              </Frame>
            </Step>

            <Step {...steps.dibagikan}>
              <Frame label="Cuplikan butir feed Community" className="px-6">
                <article className="grid gap-2 py-6">
                  <div className="flex items-center gap-2 text-xs text-ink-muted">
                    <Avatar name="Hafiz Rahman" size={32} />
                    <span>
                      <b className="font-medium text-ink">Hafiz Rahman</b> · di{" "}
                      <b className="font-medium text-ink">Grup Penulis Pesisir</b> · 2 jam
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap font-serif text-base leading-[26px]">
                    {"Ibu menyimpan laut\ndi dalam toples kerupuk:\nsetiap kali dibuka,\nrumah kami berbau pulang."}
                  </p>
                  <div className="mt-2 flex items-center gap-5 text-xs text-ink-muted">
                    <span className="inline-flex items-center gap-1.5"><HandsClapping size={20} aria-hidden />Apresiasi 48</span>
                    <span className="inline-flex items-center gap-1.5"><ChatCircle size={20} aria-hidden />Komentar 6</span>
                    <span className="hidden items-center gap-1.5 md:inline-flex"><ShareNetwork size={20} aria-hidden />Bagikan</span>
                    <span className="hidden items-center gap-1.5 md:inline-flex"><BookmarkSimple size={20} aria-hidden />Simpan</span>
                  </div>
                </article>
              </Frame>
            </Step>

            <Step {...steps.terbit}>
              <Frame label="Cuplikan status kiriman antologi">
                <div className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-4 p-4 md:grid-cols-[64px_minmax(0,1fr)_auto] md:px-6 md:py-5">
                  <BookCover title="Surat yang Tidak Pernah Terkirim" width={64} />
                  <div className="min-w-0">
                    <h4 className="text-base leading-6 font-semibold">Antologi: Surat yang Tidak Pernah Terkirim</h4>
                    <span className="text-xs text-ink-muted">“Toples Kerupuk” · versi 2 · dikirim 3 Nov</span>
                  </div>
                  <span className="col-start-2 inline-flex h-6 items-center gap-1.5 justify-self-start rounded-full border border-line-strong px-2.5 text-xs font-medium md:col-start-auto">
                    <Check size={14} aria-hidden />
                    Diterima
                  </span>
                </div>
                <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-4 border-t border-line p-4 md:px-6 md:py-5">
                  <span />
                  <span className="text-xs text-ink-muted">
                    Draf di Studio diubah 2 jam lalu. Versi yang dikirim tetap versi 2.
                  </span>
                </div>
              </Frame>
            </Step>
          </ol>
        </Grid>
      </Wrap>
    </Section>
  );
}

/* ---------- Projects ---------- */

export function Projects() {
  return (
    <Section id="projects" aria-labelledby="proj-h">
      <Wrap>
        <Grid>
          <SectionTop>
            <h2 id="proj-h" className="landing-h2">
              {projectsTitle}
            </h2>
          </SectionTop>
          <div className="mt-10 border-t border-line-strong md:col-span-12 md:mt-[72px]">
            {projects.map((p) => (
              <div key={p.name} className="grid gap-2.5 border-b border-line py-6 md:py-8">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h3 className="font-serif text-[22px] leading-[30px] font-semibold whitespace-nowrap md:text-[26px] md:leading-[34px]">
                    {p.name}
                  </h3>
                  <span
                    aria-hidden
                    className="hidden min-w-6 flex-1 -translate-y-[7px] border-b border-dotted border-ink-faint md:block"
                  />
                  <span className="w-full text-sm whitespace-nowrap text-ink-muted md:w-auto">{p.flow}</span>
                </div>
                <p className="font-serif text-base leading-[26px] text-ink-muted md:max-w-[58.333%]">
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        </Grid>
      </Wrap>
    </Section>
  );
}

/* ---------- Janji kepada penulis ---------- */

export function Trust() {
  return (
    <Section aria-label="Janji kepada penulis">
      <Wrap>
        <Grid>
          <SectionTop>
            {trust.map((t) => (
              <div
                key={t.title}
                className="border-b border-line py-8 first:pt-0 last:border-b-0 md:grid md:grid-cols-12 md:gap-x-6 md:py-12 md:first:pt-0"
              >
                <h3 className="landing-h2 md:col-span-7">{t.title}</h3>
                <p className="mt-3 text-base leading-6 text-ink-muted md:col-span-4 md:col-start-9 md:mt-2">{t.text}</p>
              </div>
            ))}
          </SectionTop>
        </Grid>
      </Wrap>
    </Section>
  );
}

/* ---------- Tanya jawab dan footer ---------- */

export function Faq() {
  return (
    <Section id="tanya-jawab" aria-labelledby="faq-h">
      <Wrap>
        <Grid>
          <SectionTop className="md:grid md:grid-cols-12 md:gap-x-6">
            <h2 id="faq-h" className="landing-h2 md:col-span-4">
              Tanya jawab
            </h2>
            <div className="mt-6 md:col-span-8 md:col-start-5 md:mt-0">
              <Accordion openFirst items={faq.map((f) => ({ question: f.question, answer: <p>{f.answer}</p> }))} />
            </div>
          </SectionTop>
        </Grid>
      </Wrap>
    </Section>
  );
}

export function Footer() {
  return (
    <footer className="pt-20 md:pt-32">
      <Wrap>
        <div className="flex flex-wrap items-center gap-6 border-t border-line pt-10 pb-14">
          <Wordmark height={28} />
          <span className="text-xs text-ink-muted">Indonesia · Malaysia</span>
          {/* Halaman Kebijakan privasi dan Kontak belum ada; wajib sebelum landing tayang. */}
          <nav aria-label="Kaki halaman" className="flex w-full gap-6 md:ml-auto md:w-auto">
            <TextLink href="/kebijakan-privasi" className="text-xs text-ink-muted hover:text-ink">
              Kebijakan privasi
            </TextLink>
            <TextLink href="/kontak" className="text-xs text-ink-muted hover:text-ink">
              Kontak
            </TextLink>
          </nav>
        </div>
      </Wrap>
    </footer>
  );
}
