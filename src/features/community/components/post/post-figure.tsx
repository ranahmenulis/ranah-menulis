import { cn } from "@/lib/cn";
import type { PostImage } from "../../types";

/**
 * The lead photo of a post: edge to edge on phones (the page has a 16px gutter), the column width
 * from md up, with the card radius. No caption and no credit; the alt text is the only description (client decision).
 */
export function PostFigure({ image, bleed = true }: { image: PostImage; bleed?: boolean }) {
  return (
    <figure className={cn("mt-6", bleed && "-mx-4 md:mx-0")}>
      {/* Resized WebP (fixture in /public, or one made on this device): see the Jelajahi tile. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        decoding="async"
        className="block h-auto max-h-[70svh] w-full bg-subtle object-cover md:rounded-2xl"
      />
    </figure>
  );
}
