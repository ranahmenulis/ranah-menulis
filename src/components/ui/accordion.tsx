import type { ReactNode } from "react";
import { Minus, Plus } from "@phosphor-icons/react/dist/ssr";

export type AccordionItem = { question: string; answer: ReactNode };

/**
 * Tanya jawab dengan <details> asli: tanpa JavaScript, tanpa animasi buka.
 * Pertanyaan serif 22/32 (ponsel 20/28).
 */
export function Accordion({
  items,
  openFirst = false,
}: {
  items: AccordionItem[];
  openFirst?: boolean;
}) {
  return (
    <div className="border-t border-line">
      {items.map((item, i) => (
        <details
          key={item.question}
          open={openFirst && i === 0}
          className="group border-b border-line"
        >
          <summary className="flex cursor-pointer list-none items-start gap-6 py-5 font-serif text-xl leading-7 text-ink md:py-6 md:text-[22px] md:leading-8 [&::-webkit-details-marker]:hidden">
            <span className="min-w-0 flex-1">{item.question}</span>
            <Plus
              size={20}
              aria-hidden
              className="mt-1 shrink-0 text-ink-muted group-open:hidden md:mt-1.5"
            />
            <Minus
              size={20}
              aria-hidden
              className="mt-1 hidden shrink-0 text-ink-muted group-open:block md:mt-1.5"
            />
          </summary>
          <div className="max-w-[680px] pb-7 text-base leading-[26px] text-ink-muted md:pr-16">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
