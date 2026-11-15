import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/server";
import { Faq } from "@/features/landing/components/faq";
import { Footer } from "@/features/landing/components/footer";
import { Hero } from "@/features/landing/components/hero";
import { HowItWorks } from "@/features/landing/components/how-it-works";
import { Projects } from "@/features/landing/components/projects";
import { TopBar } from "@/features/landing/components/top-bar";
import { Trust } from "@/features/landing/components/trust";
import { Waitlist } from "@/features/landing/components/waitlist";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = (await getDictionary()).landing;
  return { title: meta.title, description: meta.description };
}

// Runs before the hero so the classes exist before first paint, and only without reduced motion.
// `is-animating` drives the hero stage; `lp-motion` the rest of the landing's motion (hero
// entrance, preview loops, the promise statement). Safety: if the hero stage has not started, or
// the landing has not hydrated (`data-lp-ready`), within 3.5 s the classes are removed and every
// part shows its final state.
const heroScript = `(function(){var d=document.documentElement;if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;d.classList.add("is-animating","lp-motion");setTimeout(function(){if(!document.querySelector("[data-hero][data-started]"))d.classList.remove("is-animating");if(!d.hasAttribute("data-lp-ready"))d.classList.remove("lp-motion")},3500)})();`;

// Pre-launch landing. Must not go live before the client approves the three items in
// docs/desain/Catatan Slicing.md (pricing, Grup Penulis, privacy tone).
export default async function Home() {
  const { landing } = await getDictionary();
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: heroScript }} />
      <TopBar />
      <main>
        <Hero copy={landing.hero} />
        <HowItWorks copy={landing} />
        <Projects copy={landing} />
        <Trust trust={landing.trust} />
        <Waitlist waitlist={landing.waitlist} />
        <Faq title={landing.faqTitle} items={landing.faq} />
      </main>
      <Footer copy={landing.footer} />
    </>
  );
}
