"use client";

import { useId, type ReactNode } from "react";
import { BookRow } from "./book-spines";
import { Canvas, Linear, Radial, Shadow, glow, url } from "./paint";

/*
 * Category covers, 4:5 (80 × 100). They replace the typographic cover patterns; an uploaded poster
 * still wins. A lit backdrop and a surface to stand on, the object in the lower part so the title
 * can stand above it. Painted like the other illustrations (DESIGN.md 7.10).
 */

const GOLD = [
  [0, "var(--art-flame)"],
  [0.45, "var(--art-moon)"],
  [1, "var(--art-flame)"],
] as const;

function Cover({
  className,
  children,
}: {
  className?: string;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <Canvas className={className} viewBox="0 0 80 100">
      <defs>
        <Linear
          id={`${id}-wall`}
          list={[
            [0, "var(--scene-sky-1)"],
            [1, "var(--scene-sky-2)"],
          ]}
        />
        <Radial id={`${id}-glow`} list={glow("var(--art-moon)", 0.55)} />
        <Linear id={`${id}-gold`} x2={1} y2={0} list={GOLD} />
        <Linear
          id={`${id}-wood`}
          list={[
            [0, "var(--art-wood-hi)"],
            [1, "var(--art-wood-lo)"],
          ]}
        />
      </defs>
      <rect className="rm-art-static" width={80} height={100} fill={url(`${id}-wall`)} />
      <circle cx={40} cy={58} r={40} fill={url(`${id}-glow`)} />
      <g>
        <path d="M0 88 H80 V100 H0 Z" fill={url(`${id}-wood`)} />
        <path d="M0 88 H80" stroke="var(--art-wood-hi)" strokeWidth={1} />
      </g>
      {children(id)}
    </Canvas>
  );
}

/** Antologi: several books leaning together. */
export function AnthologyCover({ className }: { className?: string }) {
  return (
    <Cover className={className}>
      {() => (
        <g>
          <Shadow cx={40} cy={88} rx={28} ry={2} />
          <BookRow
            x={14}
            y={88}
            books={[
              { w: 8, h: 34, fill: "var(--art-book-3)" },
              { w: 10, h: 40, fill: "var(--art-book-1)" },
              { w: 7, h: 30, fill: "var(--art-moon)" },
              { w: 9, h: 36, fill: "var(--art-book-2)" },
              { w: 9, h: 33, fill: "var(--art-flame)", tilt: 18 },
            ]}
          />
        </g>
      )}
    </Cover>
  );
}

/** Solo: one book standing, page block and ribbon — your own book. */
export function SoloCover({ className }: { className?: string }) {
  return (
    <Cover className={className}>
      {() => (
        <g>
          <Shadow cx={42} cy={88} rx={20} ry={2} />
          <path d="M54 46 L58 43 V84 L54 88 Z" fill="var(--art-paper)" />
          <path d="M30 46 L34 43 H58 L54 46 Z" fill="var(--art-paper)" />
          <rect x={26} y={46} width={28} height={42} rx={1.5} fill="var(--art-book-1)" />
          <rect x={26} y={46} width={5} height={42} fill="var(--art-book-3)" />
          <circle cx={42} cy={60} r={5} fill="var(--art-moon)" />
          <path d="M35 74 h14 M37 78 h10" stroke="var(--art-paper)" strokeLinecap="round" />
          <path d="M48 46 v14 l-3 -3 l-3 3 v-14 Z" fill="var(--art-flame)" />
        </g>
      )}
    </Cover>
  );
}

/** Kelas Menulis: a small chalkboard on an easel and a pen. */
export function ClassCover({ className }: { className?: string }) {
  return (
    <Cover className={className}>
      {(id) => (
        <g>
          <Shadow cx={40} cy={88} rx={24} ry={2} />
          <path
            d="M24 80 L18 88 M56 80 L62 88"
            stroke="var(--art-wood-lo)"
            strokeWidth={2.4}
            strokeLinecap="round"
          />
          <rect x={14} y={46} width={52} height={36} rx={2} fill={url(`${id}-wood`)} />
          <rect x={17} y={49} width={46} height={30} rx={1} fill="var(--scene-pine)" />
          <path
            d="M22 58 h22 M22 65 h30 M22 72 h16"
            stroke="var(--art-paper)"
            strokeOpacity={0.75}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
          <path
            d="M48 76 L60 62"
            stroke="var(--art-flame)"
            strokeWidth={2.6}
            strokeLinecap="round"
          />
        </g>
      )}
    </Cover>
  );
}

/** Lomba: a gold trophy between laurel leaves. */
export function ContestCover({ className }: { className?: string }) {
  return (
    <Cover className={className}>
      {(id) => (
        <g>
          <Shadow cx={40} cy={88} rx={14} ry={2} />
          <g fill="var(--scene-pine)">
            {[0, 1, 2].map((i) => (
              <g key={i}>
                <ellipse
                  cx={22 + i * 2}
                  cy={52 + i * 9}
                  rx={2.8}
                  ry={5.6}
                  transform={`rotate(-30 ${22 + i * 2} ${52 + i * 9})`}
                />
                <ellipse
                  cx={58 - i * 2}
                  cy={52 + i * 9}
                  rx={2.8}
                  ry={5.6}
                  transform={`rotate(30 ${58 - i * 2} ${52 + i * 9})`}
                />
              </g>
            ))}
          </g>
          <path d="M30 50 h20 v8 a10 10 0 0 1 -20 0 Z" fill={url(`${id}-gold`)} />
          <path
            d="M30 53 h-5 a5 5 0 0 0 5 8 M50 53 h5 a5 5 0 0 1 -5 8"
            stroke="var(--art-moon)"
            strokeWidth={2.2}
          />
          <rect x={38} y={68} width={4} height={10} fill={url(`${id}-gold`)} />
          <path d="M31 78 h18 l2 10 h-22 Z" fill="var(--art-book-3)" />
          <path d="M34 53 v6" stroke="var(--art-paper)" strokeOpacity={0.7} strokeLinecap="round" />
        </g>
      )}
    </Cover>
  );
}
