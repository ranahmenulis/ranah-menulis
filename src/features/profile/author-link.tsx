import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { profileHref } from "./profile-href";

/**
 * An author's name as a link to their profile. It sits above stretched links (`z-10`), so a name
 * inside a post entry opens the profile while the rest of the entry still opens the post.
 */
export function AuthorLink({
  handle,
  children,
  className,
}: {
  handle: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={profileHref(handle)}
      className={cn("relative z-10 text-ink no-underline hover:underline", className)}
    >
      {children}
    </Link>
  );
}
