import type { Metadata } from "next";
import { heroLead, heroTitle } from "@/features/landing/copy";
import { Faq } from "@/features/landing/components/faq";
import { Footer } from "@/features/landing/components/footer";
import { Hero } from "@/features/landing/components/hero";
import { HowItWorks } from "@/features/landing/components/how-it-works";
import { Projects } from "@/features/landing/components/projects";
import { TopBar } from "@/features/landing/components/top-bar";
import { Trust } from "@/features/landing/components/trust";
import { Waitlist } from "@/features/landing/components/waitlist";

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
