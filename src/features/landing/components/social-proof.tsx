import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { SOCIAL_PROOF } from "../social-proof";
import { Wrap } from "./layout";

/**
 * One compact line of numbers and a way in (client note: half a screen, no photo). The numbers
 * are ink, their words muted, so the eye reads the figures first.
 */
export function SocialProof({ copy }: { copy: Dictionary["landing"]["socialProof"] }) {
  const items = [
    [SOCIAL_PROOF.writers, copy.writers],
    [SOCIAL_PROOF.works, copy.works],
    [SOCIAL_PROOF.books, copy.books],
    [SOCIAL_PROOF.programs, copy.programs],
  ] as const;

  return (
    <section aria-labelledby="proof-h" className="pt-20 md:pt-32">
      <Wrap className="grid justify-items-center gap-5 text-center">
        <h2 id="proof-h" className="text-sm font-medium text-ink-muted">
          {copy.title}
        </h2>
        <p className="max-w-[22ch] text-[26px] leading-9 font-semibold tracking-[-0.02em] text-balance text-ink-muted md:max-w-none md:text-[32px] md:leading-10">
          {items.map(([value, label], i) => (
            <span key={label}>
              {i > 0 && (i === items.length - 1 ? `, ${copy.and} ` : ", ")}
              <b className="font-semibold text-ink tabular-nums">{value}</b> {label}
            </span>
          ))}
          .
        </p>
        <ButtonLink href="#daftar" variant="secondary" className="lp-btn mt-1">
          {copy.cta}
          <ArrowRight size={16} aria-hidden />
        </ButtonLink>
      </Wrap>
    </section>
  );
}
