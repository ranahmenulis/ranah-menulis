"use client";

import { useId } from "react";
import { Canvas, Linear, Shadow, url } from "./paint";

/*
 * Proyek saya (DESIGN.md 7.10): envelopes sealed with wax leave a letter tray and fly off along a
 * dotted trail — works sent and waiting for an answer. `Envelope` is shared with Notifikasi.
 */

/** A closed envelope at its own origin (48 × 32): paper body, shaded flap, wax seal. */
export function Envelope({ id }: { id: string }) {
  return (
    <g>
      <rect width={48} height={32} rx={2.5} fill={url(`${id}-paper`)} />
      <path d="M0 32 L20 16 M48 32 L28 16" stroke="var(--art-wood-lo)" strokeOpacity={0.25} />
      <path d="M1 1.5 L24 20 L47 1.5 Z" fill="var(--scene-mid-hi)" />
      <path d="M1 1.5 L24 20 L47 1.5" stroke="var(--art-wood-lo)" strokeOpacity={0.35} />
      <circle cx={24} cy={19} r={4.6} fill="var(--art-flame)" />
      <circle cx={23} cy={18} r={1.6} fill="var(--art-moon)" opacity={0.6} />
    </g>
  );
}

/** The gradient an Envelope reads: lit paper at the top, a touch of shade at the foot. */
export function EnvelopeDefs({ id }: { id: string }) {
  return (
    <Linear
      id={`${id}-paper`}
      list={[
        [0, "var(--art-paper)"],
        [1, "var(--art-wood-hi)"],
      ]}
    />
  );
}

const FLIGHT: [number, number, number, number][] = [
  [206, 98, -12, 0.9],
  [262, 48, -20, 0.75],
];

/** Proyek saya: envelopes on their way — works sent and waiting for an answer. */
export function SentEnvelopes({ className }: { className?: string }) {
  const id = useId();
  return (
    <Canvas object className={className}>
      <defs>
        <EnvelopeDefs id={id} />
      </defs>
      <path
        d="M150 132 C176 120 196 116 226 112 S280 80 300 42"
        stroke="var(--art-wood)"
        strokeOpacity={0.7}
        strokeWidth={2}
        strokeDasharray="2 7"
        strokeLinecap="round"
      />
      <g>
        <Shadow cx={238} cy={166} rx={18} ry={2} />
        <Shadow cx={290} cy={168} rx={12} ry={1.6} />
      </g>
      <g>
        <Shadow cx={148} cy={168} rx={56} ry={4} />
        <path d="M100 150 H196 L204 142 H108 Z" fill="var(--art-wood-hi)" />
        <rect x={100} y={150} width={96} height={16} fill="var(--art-wood)" />
        <path d="M196 150 L204 142 V158 L196 166 Z" fill="var(--art-wood-lo)" />
        <g transform="translate(116 124) rotate(-4 24 16)">
          <Envelope id={id} />
        </g>
      </g>
      {FLIGHT.map(([x, y, r, o]) => (
        <g key={x} opacity={o} transform={`translate(${x} ${y}) rotate(${r} 24 16)`}>
          <Envelope id={id} />
        </g>
      ))}
    </Canvas>
  );
}
