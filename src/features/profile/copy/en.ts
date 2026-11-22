import type { profile as source } from "./id";

export const profile: typeof source = {
  tabs: { karya: "Works", tentang: "About", proyek: "Projects" },
  tabsLabel: "{name}'s profile sections",
  aside: "{name}'s profile",
  counts: { works: "works", followers: "followers", following: "following" },
  streak: "{days}-day streak",
  editProfile: "Edit profile",
  saved: "Saved",
  follow: "Follow",
  following: "Following",
  loading: "Loading profile",
  loadError: "This profile could not be loaded. Check your connection, then try again.",
  goneTitle: "This writer could not be found.",
  goneBody: "The username may be misspelled, or the account is no longer active.",
  backHome: "Back to Home",
  about: {
    username: "Username",
    origin: "From",
    genre: "Genre",
    noBio: "There is no description of this writer yet.",
    ownNotice:
      "Only your posts set to Public appear on your public profile. Streak and projects appear only if you allow it.",
  },
  projects: {
    own: "You are not showing any projects yet.",
    other: "No projects shown yet.",
  },
  works: {
    own: "You have not shared any writing publicly yet.",
    other: "No public writing here yet.",
    write: "Write a post",
  },
};
