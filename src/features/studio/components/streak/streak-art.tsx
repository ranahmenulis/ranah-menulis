import { cn } from "@/lib/cn";

/*
 * Illustrations for the Streak tab (DESIGN.md 6.6, client reference 23 November 2026). Drawn from
 * the slate tokens plus the two illustration-only tokens --art-moon and --art-flame; decorative,
 * so every one is aria-hidden.
 */

/** Night ridge with a moon and pines, sitting behind the streak number. */
export function MountainScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 180"
      fill="none"
      aria-hidden
      focusable="false"
      preserveAspectRatio="xMaxYMax meet"
      className={cn("rm-art pointer-events-none", className)}
    >
      <circle cx={262} cy={40} r={20} fill="var(--art-moon)" />
      <circle cx={262} cy={40} r={30} fill="var(--art-moon)" opacity={0.18} />
      <path
        d="M0 180 L70 104 L104 128 L168 52 L214 102 L246 84 L320 150 L320 180 Z"
        fill="var(--accent)"
        opacity={0.22}
      />
      <path
        d="M150 70 L168 52 L186 72 L176 68 L168 76 L160 68 Z"
        fill="var(--surface)"
        opacity={0.7}
      />
      <path
        d="M0 180 L48 140 L96 160 L150 118 L210 150 L262 126 L320 166 L320 180 Z"
        fill="var(--accent)"
        opacity={0.4}
      />
      <g fill="var(--accent-ink)" opacity={0.55}>
        <path d="M250 172 L258 146 L266 172 Z" />
        <path d="M266 174 L276 138 L286 174 Z" />
        <path d="M284 176 L292 152 L300 176 Z" />
        <path d="M298 178 L307 144 L316 178 Z" />
      </g>
    </svg>
  );
}

/** A small flame beside the streak number. */
export function FlameMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 32" aria-hidden focusable="false" className={className}>
      <path
        d="M12 1c1 5-4 8-4 13a4 4 0 0 0 1 2.6C7 15 5.5 13 6 10c-3 3-5 7-5 11a11 11 0 0 0 22 0c0-7-5-10-7-14-1 3-2 4-3 4 1-3 0-7-1-10Z"
        fill="var(--art-flame)"
      />
      <path
        d="M12 31a5.5 5.5 0 0 1-5.5-5.5c0-3 2.5-5 3.5-8 1 2 1.5 3 3 3 .5-1 .5-2 .5-3 2 2 4 4.5 4 8A5.5 5.5 0 0 1 12 31Z"
        fill="var(--art-moon)"
      />
    </svg>
  );
}

/** A stack of three books for the "keep your rhythm" card. */
export function BookStack({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" fill="none" aria-hidden focusable="false" className={className}>
      <ellipse cx={60} cy={74} rx={52} ry={5} fill="var(--accent)" opacity={0.15} />
      <g>
        <rect x={14} y={52} width={92} height={18} rx={3} fill="var(--accent)" />
        <rect x={18} y={56} width={84} height={10} rx={2} fill="var(--surface)" opacity={0.85} />
        <path d="M18 61 H102" stroke="var(--line)" strokeWidth={1} />
      </g>
      <g>
        <rect x={20} y={34} width={84} height={18} rx={3} fill="var(--accent-ink)" />
        <rect x={24} y={38} width={76} height={10} rx={2} fill="var(--surface)" opacity={0.85} />
        <path d="M24 43 H100" stroke="var(--line)" strokeWidth={1} />
      </g>
      <g transform="rotate(-6 60 26)">
        <rect x={22} y={16} width={78} height={18} rx={3} fill="var(--accent)" opacity={0.75} />
        <rect x={26} y={20} width={70} height={10} rx={2} fill="var(--surface)" opacity={0.85} />
      </g>
    </svg>
  );
}
