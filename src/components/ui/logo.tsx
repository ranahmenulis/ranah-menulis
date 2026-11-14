import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Logo dipasang dari berkas asli di public/logo/, tidak digambar ulang dan tidak diberi warna.
 * Dua berkas dipasang bersamaan; CSS menampilkan yang cocok dengan tema terdekat
 * (token --logo-light / --logo-dark), sehingga bagian yang dibalik ikut benar.
 * Belum ada SVG; ganti berkas saat SVG tersedia.
 */

type LogoProps = {
  /** Tinggi dalam px. Wordmark minimal 28, monogram minimal 20. Bisa ditimpa lewat --logo-h di induknya. */
  height?: number;
  className?: string;
  href?: string;
  /** Label untuk pembaca layar bila logo menjadi tautan. */
  label?: string;
};

function Wrap({
  href,
  label,
  className,
  children,
}: Pick<LogoProps, "href" | "label" | "className"> & { children: React.ReactNode }) {
  const cls = cn("inline-flex shrink-0 items-center", className);
  if (href) {
    return (
      <Link href={href} aria-label={label ?? "RanahMenulis"} className={cls}>
        {children}
      </Link>
    );
  }
  return <span className={cls}>{children}</span>;
}

/** Monogram R + "ranah." / "menulis" dua baris. */
export function Wordmark({ height = 32, ...rest }: LogoProps) {
  const light = { w: 1080, h: 356 };
  const dark = { w: 1280, h: 423 };
  return (
    <Wrap {...rest}>
      <Image
        src="/logo/v-hitam-png.png"
        alt={rest.href ? "" : "RanahMenulis"}
        width={Math.round((height * light.w) / light.h)}
        height={height}
        className="logo-on-light w-auto"
        style={{ height: `var(--logo-h, ${height}px)`, width: "auto" }}
        priority
      />
      <Image
        src="/logo/v-putih-png.png"
        alt=""
        aria-hidden
        width={Math.round((height * dark.w) / dark.h)}
        height={height}
        className="logo-on-dark w-auto"
        style={{ height: `var(--logo-h, ${height}px)`, width: "auto" }}
        priority
      />
    </Wrap>
  );
}

/** Monogram R saja: bilah editor (20) dan bilah atas ponsel (24). */
export function Monogram({ height = 24, ...rest }: LogoProps) {
  const w = Math.round((height * 566) / 569);
  return (
    <Wrap {...rest}>
      <Image
        src="/logo/monogram-hitam.png"
        alt={rest.href ? "" : "RanahMenulis"}
        width={w}
        height={height}
        className="logo-on-light w-auto"
        style={{ height: `var(--logo-h, ${height}px)`, width: "auto" }}
      />
      <Image
        src="/logo/logo-putih-aja.png"
        alt=""
        aria-hidden
        width={w}
        height={height}
        className="logo-on-dark w-auto"
        style={{ height: `var(--logo-h, ${height}px)`, width: "auto" }}
      />
    </Wrap>
  );
}
