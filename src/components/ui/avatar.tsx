import { cn } from "@/lib/cn";

export type AvatarSize = 20 | 32 | 44 | 64 | 88;

/** Dua huruf: awal kata pertama dan terakhir. Nama satu huruf tetap menghasilkan satu huruf. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = Array.from(words[0])[0] ?? "";
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? "") : "";
  return (first + last).toLocaleUpperCase("id");
}

type AvatarProps = {
  name: string;
  src?: string | null;
  size?: AvatarSize;
  className?: string;
};

/** Lingkaran penanda penulis. Selalu didampingi nama di dekatnya atau aria-label. */
export function Avatar({ name, src, size = 32, className }: AvatarProps) {
  const style = { width: size, height: size };
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- sumber foto (Supabase Storage) belum dikonfigurasi
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        style={style}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={name}
      style={{ ...style, fontSize: size * 0.4 }}
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full bg-subtle leading-none font-medium text-ink-muted",
        className,
      )}
    >
      <span aria-hidden>{initials(name)}</span>
    </span>
  );
}
