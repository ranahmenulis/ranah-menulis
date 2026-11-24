import {
  InstagramLogo,
  ThreadsLogo,
  TiktokLogo,
  YoutubeLogo,
} from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/ui/logo";
import { TextLink } from "@/components/ui/text-link";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Wrap } from "./layout";

type Copy = Dictionary["landing"];

// The client has not given the accounts yet; fill a URL here to turn its icon into a link.
// Never guess a handle.
const SOCIAL = [
  { name: "Instagram", Icon: InstagramLogo, href: null },
  { name: "TikTok", Icon: TiktokLogo, href: null },
  { name: "YouTube", Icon: YoutubeLogo, href: null },
  { name: "Threads", Icon: ThreadsLogo, href: null },
] as const satisfies readonly { name: string; Icon: unknown; href: string | null }[];

const link = "lp-link text-sm text-ink-muted no-underline hover:text-ink";

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid content-start gap-3">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <ul className="m-0 grid list-none gap-2.5 p-0">{children}</ul>
    </div>
  );
}

/** Compact footer: identity on the left, three link columns, then social and legal lines. */
export function Footer({ copy }: { copy: Copy }) {
  const f = copy.footer;
  const m = copy.ecosystem.modules;
  return (
    <footer className="pt-28 md:pt-44">
      <Wrap>
        <div className="grid gap-10 md:grid-cols-12 md:gap-6">
          <div className="grid content-start gap-4 md:col-span-4">
            <Wordmark height={32} />
            <p className="max-w-[320px] text-sm leading-[22px] text-ink-muted">{f.description}</p>
            <ul aria-label={f.social} className="m-0 flex list-none gap-2 p-0">
              {SOCIAL.map(({ name, Icon, href }) => (
                <li key={name}>
                  {href ? (
                    <a
                      href={href}
                      aria-label={name}
                      className="grid size-10 place-items-center rounded-full bg-subtle text-ink"
                    >
                      <Icon size={20} aria-hidden />
                    </a>
                  ) : (
                    <span
                      role="img"
                      aria-label={`${name}, ${f.soon}`}
                      title={f.soon}
                      className="grid size-10 place-items-center rounded-full bg-subtle text-ink-muted opacity-(--opacity-disabled)"
                    >
                      <Icon size={20} aria-hidden />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <nav
            aria-label={f.navLabel}
            className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7 md:col-start-6"
          >
            <Column title={f.product}>
              {[m.studio, m.streak, m.project, m.community, m.marketplace].map((x) => (
                <li key={x.name}>
                  <a href="#ekosistem" className={link}>
                    {x.name}
                  </a>
                </li>
              ))}
            </Column>
            <Column title={f.program}>
              {copy.publishing.paths.map(({ name }) => (
                <li key={name}>
                  <a href="#penerbitan" className={link}>
                    {name}
                  </a>
                </li>
              ))}
            </Column>
            <Column title={f.support}>
              {/* Pusat Bantuan has no page yet; it stays visible but inactive until it does. */}
              <li>
                <span className="text-sm text-ink-faint" title={f.soon}>
                  {f.help}
                </span>
              </li>
              <li>
                <a href="#tanya-jawab" className={link}>
                  {f.faq}
                </a>
              </li>
              {/* The Kontak page does not exist yet; required before launch. */}
              <li>
                <TextLink href="/kontak" className={link}>
                  {f.contact}
                </TextLink>
              </li>
            </Column>
          </nav>
        </div>
        <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line py-6 text-xs text-ink-muted">
          <span>{f.copyright}</span>
          {/* Neither legal page exists yet; both are required before launch. */}
          <span className="flex items-center gap-3 sm:ml-auto">
            <TextLink
              href="/kebijakan-privasi"
              className="lp-link text-xs text-ink-muted hover:text-ink"
            >
              {f.privacy}
            </TextLink>
            <span aria-hidden>|</span>
            <span className="text-ink-faint" title={f.soon}>
              {f.terms}
            </span>
          </span>
        </div>
      </Wrap>
    </footer>
  );
}
