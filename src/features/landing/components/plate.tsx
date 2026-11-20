import type { ComponentProps } from "react";
import type { LandingImage } from "../assets";

/**
 * One public-domain plate (assets.ts). A plain `<img>` on purpose: the files are already resized
 * WebP in /public and the plates are styled with CSS filters and blends, so the image optimizer
 * adds a request path and nothing else. Lazy by default; every plate on the landing sits below the
 * first screen or behind the hero video.
 */
export function Plate({
  image,
  alt = "",
  width = image.width,
  height = image.height,
  ...props
}: { image: LandingImage } & Omit<ComponentProps<"img">, "src">) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- see the comment above
    <img
      src={image.src}
      width={width}
      height={height}
      alt={alt}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
}
