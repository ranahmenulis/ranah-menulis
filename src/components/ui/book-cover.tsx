import { cn } from "@/lib/cn";

type Props = {
  title: string;
  author?: string;
  /** Lebar sampul dalam px. Ukuran baku: 64, 160, 300–360. */
  width?: number;
  className?: string;
};

/**
 * Sampul hitam berjudul serif putih, rasio 1:1,43. Selalu memakai token terang (#191919 / putih)
 * di dua mode; di mode gelap garis 1px --cover-edge mencegahnya tenggelam di latar.
 * Logo tidak tampil di muka sampul.
 */
export function BookCover({ title, author, width = 160, className }: Props) {
  const small = width <= 80;
  const long = title.length > 40;
  const pad = small ? 7 : width * 0.1;
  const titleSize = small ? 9 : width * (long ? 0.09 : 0.11);

  return (
    <span
      className={cn("inline-block shrink-0 outline outline-1 outline-(--cover-edge)", className)}
      aria-hidden
    >
      <span
        data-theme="light"
        className="flex aspect-[1/1.43] flex-col overflow-hidden bg-ink text-on-ink"
        style={{ width, padding: pad }}
      >
        <span
          className="font-serif font-normal text-balance"
          style={{
            fontSize: titleSize,
            lineHeight: small ? 1.1 : 1.08,
            letterSpacing: small ? 0 : "-0.015em",
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: small ? 3 : long ? 5 : 4,
            overflow: "hidden",
          }}
        >
          {title}
        </span>
        {author && !small && (
          <span
            className="mt-auto max-w-[70%] font-medium"
            style={{ fontSize: width * 0.05, lineHeight: 1.3 }}
          >
            {author}
          </span>
        )}
      </span>
    </span>
  );
}
