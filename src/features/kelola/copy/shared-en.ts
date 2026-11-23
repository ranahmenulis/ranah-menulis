import type { kelolaShared as source } from "./shared-id";

export const kelolaShared: typeof source = {
  areas: {
    organizer: {
      label: "Projects",
      summary: "Create and edit projects, assign the team, and see participants and submissions.",
    },
    editor: {
      label: "Submission queue",
      summary: "Review the work assigned to you, leave notes, and decide.",
    },
    juri: { label: "Judging", summary: "Score the contest entries assigned to you." },
    mentor: {
      label: "Classes",
      summary: "Manage your class's participants, assignments, hand-ins, and feedback.",
    },
    admin: {
      label: "Admin",
      summary: "Users and roles, moderation, curation, groups, and the audit log.",
    },
  },
  band: {
    eyebrow: "Workspace · {role}",
    sectionLabel: "{role} workspace",
    loading: " (loading)",
    roles: {
      editor: { role: "Editor", unit: "works need action" },
      juri: { role: "Judge", unit: "works you have not scored" },
      mentor: { role: "Mentor", unit: "hand-ins waiting for your grading" },
      organizer: { role: "Organizer", unit: "active projects" },
      admin: { role: "Administrator", unit: "new reports waiting for a decision" },
    },
    entries: {
      editor: "Review what needs action",
      juri: "Continue scoring",
      mentor: "Grade hand-ins",
      organizer: "Manage events",
      admin: "Open moderation",
    },
  },
  overview: {
    title: "Manage",
    subtitle: "A workspace for every role you hold.",
  },
  frame: { loading: "Loading", summary: "Overview", navLabel: "Management areas" },
  menu: { open: "Open management menu", close: "Close management menu", title: "Manage" },
  denied: {
    title: "Manage",
    guest: "Sign in first to open this section.",
    role: "You do not have access to this section.",
    signIn: "Sign in",
    home: "Back to Home",
  },
  placeholder: { notOpen: "This section is not open yet." },
  frozen: { empty: "This version has no text." },
  reason: {
    empty: "Write the reason. The participant reads it on the work's detail page.",
    tooLong: "The reason can be up to {limit} characters.",
  },
};
