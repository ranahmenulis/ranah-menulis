import type { notifications as source } from "./id";

export const notifications: typeof source = {
  title: "Notifications",
  markAll: "Mark all as read",
  unread: "{count} unread.",
  loading: "Loading notifications…",
  failedNone: "No unread notifications could be shown.",
  allRead: "Everything is read.",
  unavailable: "This notification is no longer available. ",
  signInPrompt: "Sign in to see your notifications.",
  staffNote: "Manager notifications show while they still need handling [proposal].",
  tabsLabel: "Notification type",
  tabs: { semua: "All", komentar: "Comments", proyek: "Projects" },
  partialFailed: "Some notifications could not be loaded yet.",
  empty: "No notifications here yet.",
  toHome: "Go to Home",
  unreadMark: "Unread. ",
  andOthers: "{name} and {count} others",
  andOneOther: "{name} and 1 other",
  days: { today: "Today", yesterday: "Yesterday", week: "This week", older: "Earlier" },
  messages: {
    replyComment: "replied to your comment on “{title}”.",
    appreciated: "appreciated the prologue “{title}”.",
    followed: "started following you.",
    mentioned: "mentioned you in a comment on “{title}”.",
  },
};
