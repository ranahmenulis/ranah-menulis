import type { Icon } from "@phosphor-icons/react";
import {
  ArrowRight,
  Flame,
  FolderOpen,
  PenNib,
  Storefront,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import { SectionIcon } from "@/components/ui/section-card";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import {
  CommunityAppPreview,
  ProjectAppPreview,
  StreakAppPreview,
  StudioWorksPreview,
} from "./app-previews";
import { SectionHead, Section, Wrap } from "./layout";

type Copy = Dictionary["landing"]["ecosystem"];

/** Small pill beside a module name ("Bagian dari Studio", "Menyusul"). */
function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-6 shrink-0 items-center rounded-full border border-line px-2.5 text-xs font-medium whitespace-nowrap text-ink-muted">
      {children}
    </span>
  );
}

/**
 * One module, always in the same shape (client, 24 Nov 2026): its name, one benefit, a way in when
 * the landing has one, and the app's own screen for it. The screen is `inert`, so it reads as a
 * picture: the figure carries its description.
 */
function Module({
  name,
  icon,
  benefit,
  tag,
  link,
  preview,
  children,
}: {
  name: string;
  icon: Icon;
  benefit: string;
  tag?: string;
  link?: { href: string; label: string };
  preview?: string;
  children: ReactNode;
}) {
  return (
    <li className="grid items-center gap-6 lg:grid-cols-12 lg:gap-12">
      <div className="grid content-start gap-3 lg:col-span-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <SectionIcon icon={icon} />
          <h3 className="text-xl leading-7 font-semibold tracking-[-0.01em] md:text-2xl">{name}</h3>
          {tag && <Tag>{tag}</Tag>}
        </div>
        <p className="max-w-[42ch] text-base leading-7 text-pretty text-ink-muted md:text-lg">
          {benefit}
        </p>
        {link && (
          <a
            href={link.href}
            className="lp-link lp-btn inline-flex min-h-11 w-fit items-center gap-2 text-base font-semibold text-accent-ink"
          >
            {link.label}
            <ArrowRight size={18} aria-hidden />
          </a>
        )}
      </div>
      {preview ? (
        <figure role="img" aria-label={preview} className="m-0 min-w-0 lg:col-span-8">
          <div inert className="text-left">
            {children}
          </div>
        </figure>
      ) : (
        <div className="min-w-0 lg:col-span-8">{children}</div>
      )}
    </li>
  );
}

/**
 * The ecosystem (client, 24 Nov 2026): five modules in the order a writer meets them, Studio
 * first, each shown by the app's own component with sample data. Streak is part of Studio (client
 * decision 3). Marketplace comes after the MVP, so it shows only the planned categories as text,
 * never a screen that does not exist.
 */
export function Ecosystem({ copy }: { copy: Copy }) {
  const m = copy.modules;
  return (
    <Section id="ekosistem" aria-labelledby="eco-h">
      <Wrap>
        <SectionHead id="eco-h" title={copy.title} lead={copy.lead} />
        <ul className="m-0 mt-12 grid list-none gap-16 p-0 md:mt-20 md:gap-24">
          <Module
            name={m.studio.name}
            icon={PenNib}
            benefit={m.studio.benefit}
            link={{ href: "#studio", label: m.studio.link }}
            preview={m.studio.preview}
          >
            <StudioWorksPreview />
          </Module>
          <Module
            name={m.streak.name}
            icon={Flame}
            benefit={m.streak.benefit}
            tag={copy.inStudio}
            preview={m.streak.preview}
          >
            <StreakAppPreview />
          </Module>
          <Module
            name={m.project.name}
            icon={FolderOpen}
            benefit={m.project.benefit}
            link={{ href: "#penerbitan", label: m.project.link }}
            preview={m.project.preview}
          >
            <ProjectAppPreview />
          </Module>
          <Module
            name={m.community.name}
            icon={UsersThree}
            benefit={m.community.benefit}
            preview={m.community.preview}
          >
            <CommunityAppPreview />
          </Module>
          <Module
            name={m.marketplace.name}
            icon={Storefront}
            benefit={m.marketplace.benefit}
            tag={copy.soon}
          >
            <ul className="m-0 grid list-none grid-cols-2 gap-3 rounded-2xl border border-dashed border-line-strong/40 p-4 md:p-6">
              {m.marketplace.categories.map((name) => (
                <li
                  key={name}
                  className="rounded-xl bg-subtle px-4 py-3 text-sm font-medium text-ink-muted"
                >
                  {name}
                </li>
              ))}
            </ul>
          </Module>
        </ul>
      </Wrap>
    </Section>
  );
}
