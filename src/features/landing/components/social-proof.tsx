import type { Dictionary } from "@/lib/i18n/dictionaries";
import { SOCIAL_PROOF } from "../social-proof";
import { Wrap } from "./layout";

/**
 * One quiet line of numbers under the hero stage (client note: half a screen, no photo). The
 * numbers are ink, their words muted, so the eye reads the figures first. No button: the hero's
 * call to action is a few lines above (tahap H).
 */
export function SocialProof({ copy }: { copy: Dictionary["landing"]["socialProof"] }) {
  const items = [
    [SOCIAL_PROOF.writers, copy.writers],
    [SOCIAL_PROOF.works, copy.works],
    [SOCIAL_PROOF.books, copy.books],
    [SOCIAL_PROOF.programs, copy.programs],
  ] as const;

  return (
    <section aria-labelledby="proof-h" className="pt-16 md:pt-24">
      <Wrap className="grid justify-items-center gap-4 text-center">
        <h2 id="proof-h" className="text-sm font-medium text-ink-muted">
          {copy.title}
        </h2>
        <p className="max-w-[22ch] text-[22px] leading-8 font-semibold tracking-[-0.02em] text-balance text-ink-muted md:max-w-none md:text-[28px] md:leading-10">
          {items.map(([value, label], i) => (
            <span key={label}>
              {i > 0 && (i === items.length - 1 ? `, ${copy.and} ` : ", ")}
              <b className="font-semibold text-ink tabular-nums">{value}</b> {label}
            </span>
          ))}
          .
        </p>
      </Wrap>
    </section>
  );
}
