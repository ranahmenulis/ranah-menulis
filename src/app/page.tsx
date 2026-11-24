import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/server";
import { Ecosystem } from "@/features/landing/components/ecosystem";
import { Faq } from "@/features/landing/components/faq";
import { Footer } from "@/features/landing/components/footer";
import { Hero } from "@/features/landing/components/hero";
import { Publishing } from "@/features/landing/components/publishing";
import { SocialProof } from "@/features/landing/components/social-proof";
import { TopBar } from "@/features/landing/components/top-bar";
import { Waitlist } from "@/features/landing/components/waitlist";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = (await getDictionary()).landing;
  return { title: meta.title, description: meta.description };
}

// Runs before the hero so the class exists before first paint, and only without reduced motion.
// `lp-motion` turns on the landing's motion (hero entrance, reveals, preview loops). Safety: if
// the landing has not hydrated (`data-lp-ready`) within 3.5 s the class is removed and every part
// shows its final state (the hero shows its poster).
const heroScript = `(function(){var d=document.documentElement;if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;d.classList.add("lp-motion");setTimeout(function(){if(!d.hasAttribute("data-lp-ready"))d.classList.remove("lp-motion")},3500)})();`;

// Pre-launch landing, following the client's landing brief (15 Nov 2026). Must not go live before
// the client approves the [konfirmasi] items listed at the top of features/landing/copy/id.ts.
export default async function Home() {
  const { landing } = await getDictionary();
  return (
    // The landing uses the app's slate tokens in both themes (tahap H, 24 November 2026).
    // `contents` keeps the wrapper out of the body's flex layout.
    <div className="contents">
      <script dangerouslySetInnerHTML={{ __html: heroScript }} />
      <TopBar />
      <main>
        <Hero copy={landing.hero} studio={landing.studio} />
        <SocialProof copy={landing.socialProof} />
        <Ecosystem copy={landing.ecosystem} />
        <Publishing copy={landing.publishing} />
        <Waitlist waitlist={landing.waitlist} />
        <Faq title={landing.faqTitle} items={landing.faq} />
      </main>
      <Footer copy={landing} />
    </div>
  );
}
