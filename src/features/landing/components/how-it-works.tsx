import type { ReactNode } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Grid, Section, SectionTop, Wrap } from "./layout";
import { EditorPreview } from "./previews/editor-preview";
import { LoopFrame } from "./previews/loop-frame";
import { SharePreview } from "./previews/share-preview";
import { StreakPreview } from "./previews/streak-preview";
import { SubmissionPreview } from "./previews/submission-preview";

function Step({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <li className="md:grid md:grid-cols-12 md:items-start md:gap-x-6">
      <div className="relative pl-10 md:col-span-4">
        <i aria-hidden className="absolute top-2.5 left-0 size-3.5 rounded-full bg-ink" />
        <h3 className="mb-3 font-serif text-[26px] leading-[34px] font-semibold">{title}</h3>
        <p className="font-serif text-base leading-[26px] text-ink-muted">{text}</p>
      </div>
      <div className="mt-5 pl-10 md:col-span-7 md:col-start-6 md:mt-0 md:pl-0">{children}</div>
    </li>
  );
}

/**
 * Four steps, one sentence each; the previews demonstrate the rest. Each preview loops (3.2 s),
 * one at a time: the one most in view plays, the others hold their final picture until hovered.
 */
export function HowItWorks({ copy }: { copy: Dictionary["landing"] }) {
  const { steps, stepsTitle } = copy;
  return (
    <Section id="cara-kerja" aria-labelledby="steps-h">
      <Wrap>
        <Grid>
          <SectionTop>
            <h2 id="steps-h" className="landing-h2">
              {stepsTitle}
            </h2>
          </SectionTop>
          <ol className="relative mt-10 grid list-none gap-14 p-0 before:absolute before:top-3 before:bottom-3 before:left-1.5 before:w-px before:bg-line md:col-span-12 md:mt-[72px] md:gap-24">
            <Step title={steps.menulis.title} text={steps.menulis.text}>
              <LoopFrame id="menulis" label={steps.menulis.preview}>
                <EditorPreview />
              </LoopFrame>
            </Step>
            <Step title={steps.target.title} text={steps.target.text}>
              <LoopFrame id="target" label={steps.target.preview}>
                <StreakPreview />
              </LoopFrame>
            </Step>
            <Step title={steps.dibagikan.title} text={steps.dibagikan.text}>
              <LoopFrame id="dibagikan" label={steps.dibagikan.preview}>
                <SharePreview />
              </LoopFrame>
            </Step>
            <Step title={steps.terbit.title} text={steps.terbit.text}>
              <LoopFrame id="terbit" label={steps.terbit.preview}>
                <SubmissionPreview />
              </LoopFrame>
            </Step>
          </ol>
        </Grid>
      </Wrap>
    </Section>
  );
}
