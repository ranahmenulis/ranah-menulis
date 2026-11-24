import type { Icon } from "@phosphor-icons/react";
import { Flame, FolderOpen, Storefront, UsersThree } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import { SectionIcon } from "@/components/ui/section-card";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { SectionHead, Section, Wrap } from "./layout";
import { CommunityPreview } from "./previews/community-preview";
import { LoopFrame } from "./previews/loop-frame";
import { MarketplacePreview } from "./previews/marketplace-preview";
import { PreviewFrame, Tag } from "./previews/preview-frame";
import { StreakPreview } from "./previews/streak-preview";
import { SubmissionPreview } from "./previews/submission-preview";

function Tile({
  name,
  icon,
  tag,
  className,
  children,
}: {
  name: string;
  icon: Icon;
  tag?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <li
      className={cn(
        "flex min-w-0 flex-col gap-6 rounded-2xl border border-line bg-surface p-4 shadow-card md:gap-8 md:p-7",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <SectionIcon icon={icon} />
        <h3 className="text-lg leading-7 font-semibold tracking-[-0.01em] md:text-xl">{name}</h3>
        {tag && <Tag>{tag}</Tag>}
      </div>
      <div className="mt-auto">{children}</div>
    </li>
  );
}

/**
 * The ecosystem as one bento (tahap H): four cards, names only, each shown by its own interface.
 * Studio is not here; it is the hero. A wide and a narrow card in each row, and Community is the
 * one dark card, so the grid has a rhythm instead of four equal boxes. Streak is
 * labelled as part of Studio (client decision 3); Marketplace comes after the MVP and is drawn
 * quieter, with a dashed edge.
 */
export function Ecosystem({ copy }: { copy: Dictionary["landing"]["ecosystem"] }) {
  const m = copy.modules;
  return (
    <Section id="ekosistem" aria-labelledby="eco-h">
      <Wrap>
        <SectionHead id="eco-h" title={copy.title} lead={copy.lead} />
        <ul className="m-0 mt-12 grid list-none grid-cols-1 gap-4 p-0 md:mt-20 md:grid-cols-12 md:gap-6">
          <Tile name={m.streak.name} icon={Flame} tag={copy.inStudio} className="md:col-span-7">
            <LoopFrame id="streak" label={m.streak.preview}>
              <StreakPreview />
            </LoopFrame>
          </Tile>
          <Tile name={m.project.name} icon={FolderOpen} className="md:col-span-5">
            <LoopFrame id="project" label={m.project.preview}>
              <SubmissionPreview />
            </LoopFrame>
          </Tile>
          <Tile
            name={m.community.name}
            icon={UsersThree}
            className="theme-dark border-transparent bg-canvas bg-linear-to-br from-accent-subtle to-canvas to-70% text-ink md:col-span-7"
          >
            <PreviewFrame label={m.community.preview}>
              <CommunityPreview />
            </PreviewFrame>
          </Tile>
          <Tile
            name={m.marketplace.name}
            icon={Storefront}
            tag={copy.soon}
            className="border-dashed border-line-strong/40 bg-transparent shadow-none md:col-span-5"
          >
            <PreviewFrame label={m.marketplace.preview}>
              <MarketplacePreview />
            </PreviewFrame>
          </Tile>
        </ul>
      </Wrap>
    </Section>
  );
}
