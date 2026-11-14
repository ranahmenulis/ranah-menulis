import { projects, projectsTitle } from "../copy";
import { Grid, Section, SectionTop, Wrap } from "./layout";

export function Projects() {
  return (
    <Section id="projects" aria-labelledby="proj-h">
      <Wrap>
        <Grid>
          <SectionTop>
            <h2 id="proj-h" className="landing-h2">
              {projectsTitle}
            </h2>
          </SectionTop>
          <div className="mt-10 border-t border-line-strong md:col-span-12 md:mt-[72px]">
            {projects.map((p) => (
              <div key={p.name} className="grid gap-2.5 border-b border-line py-6 md:py-8">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h3 className="font-serif text-[22px] leading-[30px] font-semibold whitespace-nowrap md:text-[26px] md:leading-[34px]">
                    {p.name}
                  </h3>
                  <span
                    aria-hidden
                    className="hidden min-w-6 flex-1 -translate-y-[7px] border-b border-dotted border-ink-faint md:block"
                  />
                  <span className="w-full text-sm whitespace-nowrap text-ink-muted md:w-auto">
                    {p.flow}
                  </span>
                </div>
                <p className="font-serif text-base leading-[26px] text-ink-muted md:max-w-[58.333%]">
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        </Grid>
      </Wrap>
    </Section>
  );
}
