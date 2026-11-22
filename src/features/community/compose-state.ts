import { compose as idCompose } from "./copy/compose-id";
import { MAX_POST_WORDS, wordsOf } from "./post-model";
import { groupIdOf } from "./groups/group-model";
import type { StoredPost } from "./storage/post-store";
import type { Genre, PostBlock, PostImage, PostKind, Visibility } from "./types";

export type ComposeTab = "direct" | "doc";

/** Blocks of one Studio document and which of them the author ticked (indices into `blocks`). */
export type Pick = { docId: string; docTitle: string; blocks: PostBlock[]; chosen: number[] };

export type ComposeState = {
  tab: ComposeTab;
  /** Phones show the picked blocks first, then settings and preview as a second screen. */
  review: boolean;
  title: string;
  kind: PostKind;
  genre: Genre | "";
  /** No default: nothing is public until the author picks (BR-COM-01). */
  visibility: Visibility | null;
  groupId: string | null;
  directBlocks: PostBlock[];
  /** One optional photo, already resized and re-encoded; its alt text is required to publish. */
  image: PostImage | null;
  pick: Pick | null;
  /** Where a reopened draft's text came from; kept so the notice about a trashed source works. */
  draftSource: { docId: string; title: string } | null;
  draftId: string | null;
};

export const initialCompose: ComposeState = {
  tab: "direct",
  review: false,
  title: "",
  kind: "prolog",
  genre: "",
  visibility: null,
  groupId: null,
  directBlocks: [],
  image: null,
  pick: null,
  draftSource: null,
  draftId: null,
};

export type ComposeAction =
  | { type: "tab"; tab: ComposeTab }
  | { type: "review"; on: boolean }
  | { type: "title"; value: string }
  | { type: "kind"; value: PostKind }
  | { type: "genre"; value: Genre | "" }
  | { type: "visibility"; value: "publik" }
  | { type: "visibility"; value: "grup"; groupId: string }
  | { type: "direct"; blocks: PostBlock[] }
  | { type: "image"; image: PostImage | null }
  | { type: "pick"; pick: Pick }
  | { type: "unpick" }
  | { type: "toggle"; index: number }
  | { type: "saved"; draftId: string }
  | { type: "load"; post: StoredPost };

export function composeReducer(state: ComposeState, action: ComposeAction): ComposeState {
  switch (action.type) {
    case "tab":
      return { ...state, tab: action.tab, review: false };
    case "review":
      return { ...state, review: action.on };
    case "title":
      return { ...state, title: action.value };
    case "kind":
      return { ...state, kind: action.value };
    case "genre":
      return { ...state, genre: action.value };
    case "visibility":
      return withVisibility(state, action);
    case "direct":
      return { ...state, directBlocks: action.blocks };
    case "image":
      return { ...state, image: action.image };
    case "pick":
      // The post title starts as the document's title; it is a separate field the author may change.
      return {
        ...state,
        pick: action.pick,
        review: false,
        title: state.title || action.pick.docTitle,
      };
    case "unpick":
      return { ...state, pick: null, review: false };
    case "toggle":
      return togglePicked(state, action.index);
    case "saved":
      return { ...state, draftId: action.draftId };
    case "load":
      return loadDraft(action.post);
  }
}

function withVisibility(
  state: ComposeState,
  action: Extract<ComposeAction, { type: "visibility" }>,
): ComposeState {
  return {
    ...state,
    visibility: action.value,
    groupId: action.value === "grup" ? action.groupId : null,
  };
}

function togglePicked(state: ComposeState, index: number): ComposeState {
  if (!state.pick) return state;
  const has = state.pick.chosen.includes(index);
  const chosen = has
    ? state.pick.chosen.filter((i) => i !== index)
    : [...state.pick.chosen, index].sort((a, b) => a - b);
  return { ...state, pick: { ...state.pick, chosen } };
}

function loadDraft(p: StoredPost): ComposeState {
  // The text was copied when it was chosen, so a draft reopens as text you can edit directly.
  return {
    ...initialCompose,
    draftId: p.id,
    title: p.title,
    kind: p.kind,
    genre: p.genre ?? "",
    visibility: p.visibility,
    groupId: p.visibility === "grup" ? (groupIdOf(p) ?? null) : null,
    directBlocks: p.blocks,
    image: p.image ?? null,
    draftSource:
      p.sourceDocId && p.sourceTitle ? { docId: p.sourceDocId, title: p.sourceTitle } : null,
  };
}

/** The text that would become public: the ticked blocks, or what was written directly. */
export function publicBlocks(state: ComposeState): PostBlock[] {
  if (state.tab === "doc") {
    return state.pick ? state.pick.chosen.map((i) => state.pick!.blocks[i]) : [];
  }
  return state.directBlocks;
}

export type Missing = "title" | "text" | "genre" | "visibility" | "imageAlt";

/** What still stands between this form and "Terbitkan". Too long is separate (see `isTooLong`). */
export function missingFor(state: ComposeState): Missing[] {
  const missing: Missing[] = [];
  if (!state.title.trim()) missing.push("title");
  if (publicBlocks(state).length === 0) missing.push("text");
  if (!state.genre) missing.push("genre");
  if (!state.visibility || (state.visibility === "grup" && !state.groupId))
    missing.push("visibility");
  if (state.image && !state.image.alt.trim()) missing.push("imageAlt");
  return missing;
}

export const isTooLong = (state: ComposeState) => wordsOf(publicBlocks(state)) > MAX_POST_WORDS;

export const canPublish = (state: ComposeState) =>
  missingFor(state).length === 0 && !isTooLong(state);

type HintCopy = { missingHint: string; missing: Record<Missing, string> };

/** "Untuk menerbitkan, lengkapi judul dan genre." Null when nothing is missing. */
export function missingHint(
  state: ComposeState,
  copy: HintCopy = idCompose.form,
  locale: "id" | "en" = "id",
): string | null {
  const missing = missingFor(state).filter((m) => m !== "text" || state.tab === "direct");
  if (missing.length === 0) return null;
  const parts = missing.map((m) => copy.missing[m]);
  const and = locale === "en" ? ", and " : " dan ";
  const list =
    parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(", ")}${and}${parts.at(-1)}`;
  return copy.missingHint.replace("{list}", list);
}

/** A draft keeps whatever is there, including gaps. It needs only something worth keeping. */
export const canSaveDraft = (state: ComposeState) =>
  state.title.trim().length > 0 || publicBlocks(state).length > 0;

export function toStored(
  state: ComposeState,
  id: string,
  status: StoredPost["status"],
  now: number,
  group?: { name: string; membershipId: string },
): StoredPost {
  const fromDoc = state.tab === "doc" && state.pick;
  const audience =
    state.visibility === "grup"
      ? {
          groupId: state.groupId ?? undefined,
          groupName: group?.name,
          groupMembershipId: group?.membershipId,
        }
      : {};
  return {
    id,
    status,
    title: state.title.trim(),
    kind: state.kind,
    genre: state.genre || null,
    blocks: publicBlocks(state),
    sourceTitle: fromDoc ? state.pick!.docTitle : (state.draftSource?.title ?? null),
    sourceDocId: fromDoc ? state.pick!.docId : (state.draftSource?.docId ?? null),
    visibility: state.visibility,
    image: state.image ? { ...state.image, alt: state.image.alt.trim() } : undefined,
    ...audience,
    updatedAt: now,
    publishedAt: status === "published" ? now : undefined,
  };
}

/** Which screen of the flow this is; phones show only one of "blocks" and "review" at a time. */
export function layoutOf(state: ComposeState) {
  const fromDoc = state.tab === "doc";
  const picked = fromDoc && state.pick !== null;
  return {
    fromDoc,
    picking: fromDoc && state.pick === null,
    review: picked && state.review,
    blocksOnly: picked && !state.review,
    sourceTitle: fromDoc ? (state.pick?.docTitle ?? null) : (state.draftSource?.title ?? null),
  };
}
