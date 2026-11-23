"use client";

import { BookOpen, PenNib, UsersThree } from "@phosphor-icons/react/dist/ssr";
import type { CSSProperties, ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { CountUp } from "@/components/ui/count-up";
import { cn } from "@/lib/cn";
import { format, useT } from "@/lib/i18n/provider";
import type { AccountProfile } from "../account-store";
import { AuthAside } from "./auth-scene";

const step = (i: number) => ({ "--i": i }) as CSSProperties;

/** The sample's numbers: a day well under way and a short streak. */
const SAMPLE_WORDS = 312;
const SAMPLE_TARGET = 500;
const SAMPLE_STREAK = 6;

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rm-rise-in w-full max-w-[26rem] rounded-2xl border border-line bg-surface/95 p-5 shadow-card backdrop-blur",
        className,
      )}
      style={step(2)}
    >
      {children}
    </div>
  );
}

/** Sign in: a sample page from Studio, labelled as a sample, so the reader sees what waits. */
export function StudioSampleAside() {
  const { scene } = useT().account;
  const percent = Math.round((SAMPLE_WORDS / SAMPLE_TARGET) * 100);
  return (
    <AuthAside>
      <Card>
        <div className="flex items-center justify-between gap-3 text-xs text-ink-muted">
          <span className="font-medium text-ink">{scene.doc}</span>
          <span className="rounded-full bg-accent-subtle px-2 py-0.5 text-accent-ink">
            {scene.sample}
          </span>
        </div>
        <p className="mt-3 line-clamp-3 font-serif text-[15px] leading-7 text-ink-soft">
          {scene.text}
        </p>
        <div className="mt-4 grid gap-2">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span>
              <strong className="text-lg text-ink tabular-nums">
                <CountUp value={SAMPLE_WORDS} />
              </strong>
              <span className="text-ink-muted">
                {" "}
                / {SAMPLE_TARGET} {scene.today}
              </span>
            </span>
            <span className="flex items-center gap-1">
              {Array.from({ length: 7 }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "size-2 rounded-full",
                    i < SAMPLE_STREAK ? "bg-accent" : "border border-line",
                  )}
                />
              ))}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-subtle">
            <div className="h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
          </div>
          <p className="text-xs text-ink-muted">
            {format(scene.streak, { n: String(SAMPLE_STREAK) })}
          </p>
        </div>
      </Card>
    </AuthAside>
  );
}

/** Sign up: the three parts of RanahMenulis the one account opens. */
export function PromisesAside() {
  const { scene } = useT().account;
  const items = [
    { icon: PenNib, title: "Studio", text: scene.studio },
    { icon: UsersThree, title: "Community", text: scene.community },
    { icon: BookOpen, title: "Projects", text: scene.projects },
  ];
  return (
    <AuthAside>
      <Card>
        <p className="text-xs font-medium text-ink-muted">{scene.promisesLabel}</p>
        <ol className="mt-3 grid gap-4">
          {items.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-accent-subtle text-accent-ink">
                <Icon size={18} weight="duotone" aria-hidden />
              </span>
              <span>
                <span className="flex items-baseline gap-2 font-medium text-ink">
                  <span className="font-mono text-xs text-ink-muted">0{i + 1}</span>
                  {title}
                </span>
                <span className="block text-sm text-ink-muted">{text}</span>
              </span>
            </li>
          ))}
        </ol>
      </Card>
    </AuthAside>
  );
}

/** Onboarding: the profile card as readers will see it, following what is typed. */
export function ProfilePreviewAside({ profile }: { profile: AccountProfile }) {
  const { scene } = useT().account;
  const name = profile.name.trim();
  const username = profile.username.trim().replace(/^@/, "").toLowerCase();
  const bio = profile.bio.trim();
  return (
    <AuthAside>
      <Card>
        <p className="text-xs font-medium text-ink-muted">{scene.profileLabel}</p>
        <div className="mt-3 flex items-center gap-4">
          <Avatar name={name || "?"} src={profile.avatar} size={56} />
          <div className="min-w-0">
            <p
              className={cn(
                "truncate font-serif text-xl",
                name ? "text-ink" : "text-ink-muted italic",
              )}
            >
              {name || scene.nameEmpty}
            </p>
            {username && <p className="truncate text-sm text-ink-muted">@{username}</p>}
          </div>
        </div>
        <p
          className={cn(
            "mt-3 line-clamp-3 text-sm [overflow-wrap:anywhere]",
            bio ? "text-ink-soft" : "text-ink-muted italic",
          )}
        >
          {bio || scene.bioEmpty}
        </p>
      </Card>
    </AuthAside>
  );
}
