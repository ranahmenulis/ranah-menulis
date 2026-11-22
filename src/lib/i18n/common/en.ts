import type { common as source } from "./id";

export const common: typeof source = {
  close: "Close",
  loading: "Loading",
  retry: "Try again",
  notifications: "Notices",
  closeNotification: "Close notice",
  language: {
    label: "Language",
    active: "Current",
    names: { id: "Bahasa Indonesia", en: "English" },
  },
  theme: {
    label: "Appearance",
    light: "Light",
    dark: "Dark",
    cycle: "Appearance: {current}. Switch to {next}",
  },
  preferences: { label: "Appearance and language" },
  reasonDialog: {
    field: "Reason",
    cancel: "Cancel",
    limit: "Up to {limit} characters.",
    empty: "Write the reason. The participant reads it on the work's detail page.",
    tooLong: "The reason can be up to {limit} characters.",
  },
};
