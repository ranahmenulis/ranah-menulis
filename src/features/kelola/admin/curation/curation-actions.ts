import { editorPicks, type EditorPick } from "@/features/community/curation/picks-store";
import type { Post } from "@/features/community/types";
import { featuredProjects } from "@/features/projects/featured-store";
import type { ProjectFixture } from "@/features/projects/types";
import { isPlatformAdmin } from "@/lib/roles";
import { appendAudit, type NewAuditEntry } from "../../audit/audit-log";
import { ME_ID } from "../../identity";
import { readEffectiveRoles } from "../../use-effective-roles";
import type { AdminResult } from "../admin-actions";
import { moveItem } from "./curation-model";

const refuse = (message: string): AdminResult => ({ ok: false, message });
const NOT_ALLOWED = "Hanya Administrator dan Super Admin yang bisa mengatur kurasi.";

/** The audit entry is written before the change it records, like the other Admin actions. */
const log = (entry: Omit<NewAuditEntry, "actorId">) => appendAudit([{ ...entry, actorId: ME_ID }]);

/** `posts` is what the screen just loaded; the post is looked up in it, never trusted as given. */
export function addPick(postId: string, posts: readonly Post[]): AdminResult {
  if (!isPlatformAdmin(readEffectiveRoles())) return refuse(NOT_ALLOWED);
  const post = posts.find((p) => p.id === postId);
  if (!post || post.visibility !== "publik")
    return refuse("Hanya tulisan publik yang bisa dipilih.");
  const picks = editorPicks.read();
  if (picks.some((p) => p.postId === postId)) return refuse("Tulisan ini sudah ada di daftar.");
  log({ action: "pick.add", ref: `post:${postId}`, label: post.title });
  editorPicks.write([...picks, { postId, at: Date.now(), title: post.title }]);
  return { ok: true, message: `"${post.title}" masuk ke Editor's Picks.` };
}

const nameOf = (pick: EditorPick) => pick.title ?? "Tulisan";

export function removePick(postId: string): AdminResult {
  if (!isPlatformAdmin(readEffectiveRoles())) return refuse(NOT_ALLOWED);
  const picks = editorPicks.read();
  const found = picks.find((p) => p.postId === postId);
  if (!found) return refuse("Tulisan ini sudah tidak ada di daftar.");
  log({ action: "pick.remove", ref: `post:${postId}`, label: nameOf(found) });
  editorPicks.write(picks.filter((p) => p.postId !== postId));
  return { ok: true, message: `${nameOf(found)} dicabut dari Editor's Picks.` };
}

export function movePick(postId: string, direction: -1 | 1): AdminResult {
  if (!isPlatformAdmin(readEffectiveRoles())) return refuse(NOT_ALLOWED);
  const picks = editorPicks.read();
  const index = picks.findIndex((p) => p.postId === postId);
  if (index < 0) return refuse("Tulisan ini sudah tidak ada di daftar.");
  const next = moveItem(picks, index, direction);
  if (next[index] === picks[index]) return refuse("Sudah di ujung daftar.");
  log({ action: "pick.move", ref: `post:${postId}`, label: nameOf(picks[index]) });
  editorPicks.write(next);
  return { ok: true, message: `Urutan ${nameOf(picks[index])} diubah.` };
}

/** Marks or releases a project; only a published project in the catalog can be marked. */
export function setFeatured(
  slug: string,
  on: boolean,
  catalog: readonly ProjectFixture[],
): AdminResult {
  if (!isPlatformAdmin(readEffectiveRoles())) return refuse(NOT_ALLOWED);
  const list = featuredProjects.read();
  const marked = list.some((f) => f.slug === slug);
  if (on) {
    const project = catalog.find((p) => p.slug === slug);
    if (!project || project.publication !== "terbit") {
      return refuse("Hanya proyek yang terbit yang bisa ditandai unggulan.");
    }
    if (marked) return refuse("Proyek ini sudah ditandai unggulan.");
    log({ action: "featured.add", slug });
    featuredProjects.write([...list, { slug, at: Date.now() }]);
    return { ok: true, message: `${project.title} ditandai unggulan.` };
  }
  if (!marked) return refuse("Proyek ini tidak lagi ditandai unggulan.");
  log({ action: "featured.remove", slug });
  featuredProjects.write(list.filter((f) => f.slug !== slug));
  return { ok: true, message: "Tanda unggulan dilepas." };
}
