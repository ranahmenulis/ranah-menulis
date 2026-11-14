import type { Metadata } from "next";
import { Faq, Footer, Hero, HowItWorks, Projects, Trust } from "@/components/landing/sections";
import { TopBar } from "@/components/landing/top-bar";
import { Waitlist } from "@/components/landing/waitlist";
import { heroLead, heroTitle } from "@/components/landing/copy";

export const metadata: Metadata = {
  title: "RanahMenulis · " + heroTitle,
  description: heroLead,
};

// Dipasang sebelum hero supaya kelas ada sebelum tampilan pertama. Tanpa reduced motion saja.
// Bila hero tidak mulai dalam 3,5 detik (JS lambat atau gagal), kelas dicabut dan keadaan akhir tampil.
const heroScript = `(function(){var d=document.documentElement;if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;d.classList.add("is-animating");setTimeout(function(){if(!document.querySelector("[data-hero][data-started]"))d.classList.remove("is-animating")},3500)})();`;

// Landing pra-peluncuran. Belum boleh tayang sebelum client menyetujui tiga butir di
// docs/desain/Catatan Slicing.md (biaya, Grup Penulis, nada privasi).
export default function Home() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: heroScript }} />
      <TopBar />
      <main>
        <Hero />
        <HowItWorks />
        <Projects />
        <Trust />
        <Waitlist />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
