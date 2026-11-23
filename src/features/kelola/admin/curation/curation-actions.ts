import { editorPicks, type EditorPick } from "@/features/community/curation/picks-store";
import type { Post } from "@/features/community/types";
import { featuredProjects } from "@/features/projects/featured-store";
import type { ProjectFixture } from "@/features/projects/types";
import { isPlatformAdmin } from "@/lib/roles";
import { appendAudit, type NewAuditEntry } from "../../audit/audit-log";
import { ME_ID } from "../../identity";
import { readEffectiveRoles } from "../../use-effective-roles";
import { done, refuse, type AdminResult } from "../admin-actions";
import { moveItem } from "./curation-model";

/** The audit entry is written before the change it records, like the other Admin actions. */
const log = (entry: Omit<NewAuditEntry, "actorId">) => appendAudit([{ ...entry, actorId: ME_ID }]);

/** `posts` is what the screen just loaded; the post is looked up in it, never trusted as given. */
export function addPick(postId: string, posts: readonly Post[]): AdminResult {
  if (!isPlatformAdmin(readEffectiveRoles())) return refuse("curationNotAllowed");
  const post = posts.find((p) => p.id === postId);
  if (!post || post.visibility !== "publik") return refuse("onlyPublicPosts");
  const picks = editorPicks.read();
  if (picks.some((p) => p.postId === postId)) return refuse("alreadyPicked");
  log({ action: "pick.add", ref: `post:${postId}`, label: post.title });
  editorPicks.write([...picks, { postId, at: Date.now(), title: post.title }]);
  return done("picked", { title: post.title });
}

const nameOf = (pick: EditorPick) => pick.title ?? "Tulisan";

export function removePick(postId: string): AdminResult {
  if (!isPlatformAdmin(readEffectiveRoles())) return refuse("curationNotAllowed");
  const picks = editorPicks.read();
  const found = picks.find((p) => p.postId === postId);
  if (!found) return refuse("pickGone");
  log({ action: "pick.remove", ref: `post:${postId}`, label: nameOf(found) });
  editorPicks.write(picks.filter((p) => p.postId !== postId));
  return done("unpicked", { title: nameOf(found) });
}

export function movePick(postId: string, direction: -1 | 1): AdminResult {
  if (!isPlatformAdmin(readEffectiveRoles())) return refuse("curationNotAllowed");
  const picks = editorPicks.read();
  const index = picks.findIndex((p) => p.postId === postId);
  if (index < 0) return refuse("pickGone");
  const next = moveItem(picks, index, direction);
  if (next[index] === picks[index]) return refuse("atEdge");
  log({ action: "pick.move", ref: `post:${postId}`, label: nameOf(picks[index]) });
  editorPicks.write(next);
  return done("moved", { title: nameOf(picks[index]) });
}

/** Marks or releases a project; only a published project in the catalog can be marked. */
export function setFeatured(
  slug: string,
  on: boolean,
  catalog: readonly ProjectFixture[],
): AdminResult {
  if (!isPlatformAdmin(readEffectiveRoles())) return refuse("curationNotAllowed");
  const list = featuredProjects.read();
  const marked = list.some((f) => f.slug === slug);
  if (on) {
    const project = catalog.find((p) => p.slug === slug);
    if (!project || project.publication !== "terbit") {
      return refuse("onlyPublishedProjects");
    }
    if (marked) return refuse("alreadyFeatured");
    log({ action: "featured.add", slug });
    featuredProjects.write([...list, { slug, at: Date.now() }]);
    return done("featured", { title: project.title });
  }
  if (!marked) return refuse("notFeatured");
  log({ action: "featured.remove", slug });
  featuredProjects.write(list.filter((f) => f.slug !== slug));
  return done("unfeatured");
}
