import type { ReactNode } from "react";
import { steps, stepsTitle } from "../copy";
import { Grid, Section, SectionTop, Wrap } from "./layout";
import { EditorPreview, FeedPreview, StreakPreview, SubmissionPreview } from "./step-previews";

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

export function HowItWorks() {
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
            <Step {...steps.menulis}>
              <EditorPreview />
            </Step>
            <Step {...steps.target}>
              <StreakPreview />
            </Step>
            <Step {...steps.dibagikan}>
              <FeedPreview />
            </Step>
            <Step {...steps.terbit}>
              <SubmissionPreview />
            </Step>
          </ol>
        </Grid>
      </Wrap>
    </Section>
  );
}
