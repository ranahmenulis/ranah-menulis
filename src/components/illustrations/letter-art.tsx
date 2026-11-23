"use client";

import { useId } from "react";
import { Envelope, EnvelopeDefs } from "./envelope-art";
import { Canvas, Linear, Radial, Shadow, glow, url } from "./paint";

/*
 * Notifikasi and Pengaturan (DESIGN.md 7.10): a sealed envelope arriving under a glowing lantern,
 * and a letter with a quill and an inkwell — who you are.
 */

/** Notifikasi: an envelope under a small lantern — news arriving. */
export function NoticeLantern({ className }: { className?: string }) {
  const id = useId();
  return (
    <Canvas object className={className}>
      <defs>
        <EnvelopeDefs id={id} />
        <Radial id={`${id}-glow`} list={glow("var(--art-moon)", 0.7)} />
        <Linear
          id={`${id}-metal`}
          x2={1}
          y2={0}
          list={[
            [0, "var(--art-book-3)"],
            [0.4, "var(--art-book-2)"],
            [1, "var(--art-book-3)"],
          ]}
        />
      </defs>
      <circle cx={270} cy={64} r={64} fill={url(`${id}-glow`)} />
      <g>
        <path d="M270 0 V30" stroke="var(--art-wood-lo)" strokeWidth={1.6} />
        <circle cx={270} cy={32} r={3} stroke="var(--art-book-3)" strokeWidth={1.6} />
        <path d="M256 36 h28 l6 12 h-40 Z" fill={url(`${id}-metal`)} />
        <rect x={256} y={48} width={28} height={34} rx={2} fill="var(--art-moon)" />
        <path
          d="M270 58 C276 66 277 70 275 74 C273 78 267 78 265 74 C263 70 265 66 270 58 Z"
          fill="var(--art-flame)"
        />
        <path
          d="M263 48 v34 M277 48 v34"
          stroke="var(--art-book-3)"
          strokeOpacity={0.55}
          strokeWidth={2}
        />
        <rect x={256} y={48} width={6} height={34} fill="var(--art-paper)" opacity={0.35} />
        <path d="M252 82 h36 l-6 9 h-24 Z" fill={url(`${id}-metal`)} />
      </g>
      <g>
        <Shadow cx={196} cy={170} rx={48} ry={4} />
        <g transform="translate(152 112) rotate(-8 38 25) scale(1.6)">
          <Envelope id={id} />
        </g>
        <path
          d="M140 104 l-10 -6 M146 94 l-6 -10 M158 90 l-2 -12"
          stroke="var(--art-flame)"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </g>
    </Canvas>
  );
}

/** Pengaturan dan akun: a letter with a quill — who you are. */
export function LetterQuill({ className }: { className?: string }) {
  const id = useId();
  return (
    <Canvas object className={className}>
      <defs>
        <Linear
          id={`${id}-paper`}
          list={[
            [0, "var(--art-paper)"],
            [1, "var(--art-wood-hi)"],
          ]}
        />
        <Linear
          id={`${id}-feather`}
          x2={1}
          y2={0}
          list={[
            [0, "var(--art-book-3)"],
            [0.5, "var(--art-book-2)"],
            [1, "var(--art-paper)"],
          ]}
        />
        <Linear
          id={`${id}-glass`}
          x2={1}
          y2={0}
          list={[
            [0, "var(--art-book-3)"],
            [0.35, "var(--art-book-1)"],
            [1, "var(--art-book-3)"],
          ]}
        />
      </defs>
      <Shadow cx={214} cy={170} rx={70} ry={4} />
      <g transform="rotate(4 208 105)">
        <rect
          x={164}
          y={50}
          width={96}
          height={118}
          rx={3}
          fill="var(--scene-shadow)"
          opacity={0.15}
        />
        <rect x={160} y={46} width={96} height={118} rx={3} fill={url(`${id}-paper`)} />
        <g stroke="var(--art-wood)" strokeOpacity={0.6} strokeWidth={1.8} strokeLinecap="round">
          <path d="M174 70 h56 M174 82 h68 M174 94 h60 M174 106 h66 M174 118 h40" />
          <path d="M200 140 c6 -8 10 4 16 -4 s8 6 16 -2" />
        </g>
        <circle cx={234} cy={148} r={8} fill="var(--art-flame)" />
        <circle cx={232} cy={146} r={2.6} fill="var(--art-moon)" opacity={0.6} />
      </g>
      <g>
        <Shadow cx={288} cy={170} rx={18} ry={3} />
        <path d="M274 146 h28 l4 22 h-36 Z" fill={url(`${id}-glass`)} />
        <ellipse cx={288} cy={146} rx={14} ry={3} fill="var(--scene-pine)" />
        <rect x={276} y={150} width={4} height={14} fill="var(--art-paper)" opacity={0.3} />
      </g>
      <g>
        <path
          d="M312 18 C284 34 266 66 286 140 C288 98 302 62 312 18 Z"
          fill={url(`${id}-feather`)}
        />
        <path
          d="M300 46 l-10 6 M296 62 l-10 6 M292 80 l-8 6 M290 98 l-6 6"
          stroke="var(--art-paper)"
          strokeOpacity={0.6}
        />
        <path
          d="M312 18 L286 144"
          stroke="var(--art-book-3)"
          strokeWidth={1.6}
          strokeLinecap="round"
        />
      </g>
    </Canvas>
  );
}
