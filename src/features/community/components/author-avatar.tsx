"use client";

import { Avatar, type AvatarSize } from "@/components/ui/avatar";
import { useAccount } from "@/features/account/account-store";
import { ME_ID } from "../fixtures/authors";
import type { Author } from "../types";

/**
 * The avatar of a post or comment author. Your own entries show the photo you chose in Pengaturan;
 * the dummy authors have no photo, so they keep their initials (no stock faces).
 */
export function AuthorAvatar({
  author,
  size,
  className,
}: {
  author: Pick<Author, "id" | "name">;
  size?: AvatarSize;
  className?: string;
}) {
  const { profile } = useAccount();
  const src = author.id === ME_ID ? profile.avatar : null;
  return <Avatar name={author.name} src={src} size={size} className={className} />;
}
