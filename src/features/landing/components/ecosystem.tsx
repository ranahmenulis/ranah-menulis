import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Eyebrow, Grid, Section, SectionTop, Wrap } from "./layout";
import { CommunityPreview } from "./previews/community-preview";
import { EditorPreview } from "./previews/editor-preview";
import { LoopFrame } from "./previews/loop-frame";
import { MarketplacePreview } from "./previews/marketplace-preview";
import { PreviewFrame, Tag } from "./previews/preview-frame";
import { StreakPreview } from "./previews/streak-preview";
import { SubmissionPreview } from "./previews/submission-preview";

function Module({
  name,
  tag,
  className,
  children,
}: {
  name: string;
  tag?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <li className={cn("grid min-w-0 content-start gap-4", className)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 className="text-xl leading-7 font-semibold tracking-[-0.01em] md:text-2xl md:leading-8">
          {name}
        </h3>
        {tag && <Tag>{tag}</Tag>}
      </div>
      {children}
    </li>
  );
}

/**
 * The five modules in the client's order, names only (client note): each one is shown by its own
 * interface instead of a paragraph. Wide and narrow tiles alternate so no two rows look alike.
 * Streak is labelled as part of Studio (client decision 3); Marketplace comes after the MVP.
 */
export function Ecosystem({ copy }: { copy: Dictionary["landing"]["ecosystem"] }) {
  const m = copy.modules;
  return (
    <Section id="ekosistem" aria-labelledby="eco-h">
      <Wrap>
        <Grid>
          <SectionTop className="md:grid md:grid-cols-12 md:gap-x-6">
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <h2 id="eco-h" className="landing-h2 md:col-span-7">
              {copy.title}
            </h2>
            <p className="mt-4 text-lg leading-7 text-pretty text-ink-muted md:col-span-4 md:col-start-9 md:mt-2">
              {copy.lead}
            </p>
          </SectionTop>
          <ul className="mt-10 grid list-none grid-cols-1 gap-12 p-0 md:col-span-12 md:mt-16 md:grid-cols-12 md:gap-x-6 md:gap-y-16">
            <Module name={m.streak.name} tag={copy.inStudio} className="md:col-span-5">
              <LoopFrame id="streak" label={m.streak.preview}>
                <StreakPreview />
              </LoopFrame>
            </Module>
            <Module name={m.project.name} className="md:col-span-7">
              <LoopFrame id="project" label={m.project.preview}>
                <SubmissionPreview />
              </LoopFrame>
            </Module>
            <Module name={m.studio.name} className="md:col-span-7">
              <LoopFrame id="studio" label={m.studio.preview}>
                <EditorPreview />
              </LoopFrame>
            </Module>
            <Module name={m.community.name} className="md:col-span-5">
              <PreviewFrame label={m.community.preview}>
                <CommunityPreview />
              </PreviewFrame>
            </Module>
            <Module name={m.marketplace.name} tag={copy.soon} className="md:col-span-12">
              <PreviewFrame label={m.marketplace.preview}>
                <MarketplacePreview />
              </PreviewFrame>
            </Module>
          </ul>
        </Grid>
      </Wrap>
    </Section>
  );
}
