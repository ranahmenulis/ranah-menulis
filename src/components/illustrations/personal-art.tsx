"use client";

import { useId } from "react";
import { BookRow } from "./book-spines";
import { Canvas, Linear, Radial, Shadow, glow, url, volume } from "./paint";

/*
 * Profil and Tersimpan (DESIGN.md 7.10): the writer's own shelf, one painted spine per work under
 * a small candle, and an open book with a ribbon. Objects, so no sky: volume from lit faces,
 * page shading toward the gutter and soft shadows.
 */

const SPINES = [
  "var(--art-book-3)",
  "var(--art-book-1)",
  "var(--art-moon)",
  "var(--art-book-2)",
  "var(--art-book-1)",
  "var(--art-flame)",
  "var(--art-book-3)",
  "var(--art-book-2)",
];

/** Profil: the writer's own shelf, one spine per published work (at most 12 drawn). */
export function ProfileShelf({ works, className }: { works: number; className?: string }) {
  const id = useId();
  const count = Math.max(0, Math.min(12, works));
  const books = Array.from({ length: count }, (_, i) => ({
    w: 11 + ((i * 7) % 6),
    h: 48 + ((i * 13) % 26),
    fill: SPINES[i % SPINES.length],
  }));
  return (
    <Canvas object className={className}>
      <defs>
        <Radial id={`${id}-glow`} list={glow("var(--art-moon)", 0.55)} />
        <Linear
          id={`${id}-board`}
          list={volume("var(--art-wood-hi)", "var(--art-wood)", "var(--art-wood-lo)")}
        />
      </defs>
      <circle cx={300} cy={124} r={70} fill={url(`${id}-glow`)} />
      <Shadow cx={220} cy={174} rx={96} ry={3} />
      <g>
        {count === 0 ? (
          <path
            d="M194 150 h50"
            stroke="var(--art-wood)"
            strokeWidth={2}
            strokeDasharray="3 6"
            strokeLinecap="round"
          />
        ) : (
          <BookRow x={134} y={150} books={books} />
        )}
      </g>
      <g>
        <path d="M124 150 H314 L320 145 H130 Z" fill="var(--art-wood-hi)" />
        <rect x={124} y={150} width={190} height={8} fill={url(`${id}-board`)} />
        <path d="M144 158 v14 h6 M294 158 v14 h6" stroke="var(--art-wood-lo)" strokeWidth={4} />
      </g>
      <g>
        <rect
          x={292}
          y={128}
          width={16}
          height={20}
          rx={3}
          fill="var(--art-paper)"
          opacity={0.85}
        />
        <rect x={296} y={124} width={8} height={12} rx={1} fill="var(--art-moon)" />
        <path
          d="M300 112 C304 117 305 120 303 123 C301 126 297 125 297 121 C297 118 299 116 300 112 Z"
          fill="var(--art-flame)"
        />
      </g>
    </Canvas>
  );
}

const LEFT_PAGE = "M226 76 C200 64 168 66 146 74 V146 C168 138 200 138 226 150 Z";
const RIGHT_PAGE = "M226 76 C252 64 284 66 306 74 V146 C284 138 252 138 226 150 Z";

/** Tersimpan: an open book with a ribbon marker. */
export function SavedBook({ className }: { className?: string }) {
  const id = useId();
  return (
    <Canvas object className={className}>
      <defs>
        <Linear
          id={`${id}-left`}
          x2={1}
          y2={0}
          list={[
            [0, "var(--art-paper)"],
            [0.75, "var(--art-paper)"],
            [1, "var(--art-wood-hi)"],
          ]}
        />
        <Linear
          id={`${id}-right`}
          x2={1}
          y2={0}
          list={[
            [0, "var(--art-wood-hi)"],
            [0.25, "var(--art-paper)"],
            [1, "var(--art-paper)"],
          ]}
        />
      </defs>
      <Shadow cx={226} cy={160} rx={96} ry={5} />
      <path
        d="M140 82 L146 78 V146 C168 138 200 138 226 150 C252 138 284 138 306 146 V78 L312 82 V154 C284 146 252 146 226 160 C200 146 168 146 140 154 Z"
        fill="var(--art-book-1)"
      />
      <g stroke="var(--art-wood-lo)" strokeOpacity={0.3} strokeWidth={0.6}>
        {[4, 2].map((dy) => (
          <g key={dy} transform={`translate(0 ${dy})`}>
            <path d={LEFT_PAGE} fill="var(--art-paper)" />
            <path d={RIGHT_PAGE} fill="var(--art-paper)" />
          </g>
        ))}
        <path d={LEFT_PAGE} fill={url(`${id}-left`)} />
        <path d={RIGHT_PAGE} fill={url(`${id}-right`)} />
      </g>
      <g stroke="var(--art-wood)" strokeOpacity={0.55} strokeWidth={1.6} strokeLinecap="round">
        <path d="M160 90 c20 -6 40 -6 56 0 M160 102 c20 -6 40 -6 56 0 M160 114 c20 -6 40 -6 48 0 M160 126 c20 -6 40 -6 52 0" />
        <path d="M236 90 c20 -6 40 -6 56 0 M236 102 c20 -6 40 -6 40 0" />
      </g>
      <g>
        <path d="M268 70 V160 L262 154 L256 160 V72 Z" fill="var(--art-flame)" />
        <path d="M268 70 V160 L265 157 V71 Z" fill="var(--scene-shadow)" opacity={0.25} />
      </g>
    </Canvas>
  );
}
