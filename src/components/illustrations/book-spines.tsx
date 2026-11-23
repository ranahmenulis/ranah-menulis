/*
 * Standing book spines (DESIGN.md 7.10), shared by the bookshelf, the profile shelf and the
 * category covers. Each spine is painted, not flat: a lit left edge, a shaded right edge, a
 * paper-coloured head band and a title block, so a row reads as real books under one light.
 */

export type Book = { w: number; h: number; fill: string; o?: number; tilt?: number };

/** A row of book spines standing on a shelf at y, starting at x. */
export function BookRow({ x, y, books }: { x: number; y: number; books: Book[] }) {
  const lefts = books.map((_, i) => x + books.slice(0, i).reduce((sum, b) => sum + b.w + 2, 0));
  return (
    <g>
      {books.map((b, i) => {
        const bx = lefts[i];
        const top = y - b.h;
        return (
          <g
            key={i}
            opacity={b.o ?? 1}
            transform={b.tilt ? `rotate(${b.tilt} ${bx + b.w} ${y})` : undefined}
          >
            <rect x={bx} y={top} width={b.w} height={b.h} rx={1.5} fill={b.fill} />
            <rect
              x={bx}
              y={top}
              width={b.w * 0.22}
              height={b.h}
              fill="var(--art-paper)"
              opacity={0.2}
            />
            <rect
              x={bx + b.w * 0.78}
              y={top}
              width={b.w * 0.22}
              height={b.h}
              fill="var(--scene-shadow)"
              opacity={0.3}
            />
            <rect
              x={bx + 1.5}
              y={top + 5}
              width={b.w - 3}
              height={1.6}
              fill="var(--art-paper)"
              opacity={0.75}
            />
            <rect
              x={bx + 1.5}
              y={y - 7}
              width={b.w - 3}
              height={1.6}
              fill="var(--art-paper)"
              opacity={0.55}
            />
            <rect
              x={bx + b.w / 2 - 1.5}
              y={top + 12}
              width={3}
              height={Math.max(4, b.h * 0.32)}
              rx={1}
              fill="var(--art-paper)"
              opacity={0.4}
            />
          </g>
        );
      })}
    </g>
  );
}
