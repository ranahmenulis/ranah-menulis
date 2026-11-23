import type { discover as source } from "./discover-id";

export const discover: typeof source = {
  title: "Community",
  write: "Write a post",
  loadError: "Community could not be loaded. The feed on Home and your saved posts still open.",
  categoryLabel: "Categories",
  loadMore: "Load more",
  doneAll: "That is all the writing.",
  doneCategory: "That is all the writing in this category.",
  loading: "Loading Community",
  tabs: {
    label: "Community sections",
    posts: "Writing",
    events: "Events",
    groups: "Writing groups",
  },
  hero: {
    body: "Excerpts and prologues other writers are working on. Read, appreciate, and follow the writers.",
    recent: "new posts in the last 7 days",
    following: "Writers followed",
    saved: "Saved",
    mine: "Your posts",
  },
  appreciation: "Appreciation {count}",
  from: "from",
  comments: "Comments {count}",
  save: "Save",
  unsave: "Remove from Saved",
  categories: {
    semua: { label: "All", description: "All public writing, newest first." },
    trending: {
      label: "Trending Today",
      description: "The writing most read and replied to today.",
    },
    new: { label: "New Writers", description: "First posts from writers who just joined." },
    editor: { label: "Editor's Picks", description: "Chosen by the RanahMenulis team." },
    appreciated: { label: "Most Appreciated", description: "Ordered by number of Appreciations." },
    saved: { label: "Most Saved", description: "The writing readers save most often." },
    hidden: {
      label: "Hidden Gems",
      description: "Rarely appreciated, but read to the end and saved.",
    },
    id: { label: "Indonesia Writers", description: "Writers whose profile country is Indonesia." },
    my: { label: "Malaysia Writers", description: "Writers whose profile country is Malaysia." },
  },
};
