import type { kelolaOrganizerEvents as source } from "./copy-id";

export const kelolaOrganizerEvents: typeof source = {
  backToProjects: "Organizer projects",
  backToEvents: "Manage events",
  denied: "You do not have access to manage this event.",
  list: {
    title: "Manage events",
    create: "Create event",
    empty: "You are not managing any events yet.",
  },
  detail: {
    titleEdit: "Edit event",
    titleNew: "Create event",
    missing: "This event is not available.",
    view: "View event page",
  },
  form: {
    fields: {
      title: "Event title",
      description: "Description",
      rules: "Challenge rules",
      zone: "Time zone",
      start: "Event start",
      end: "Event end",
      target: "Word target",
      capacity: "Participant limit",
      sprintStart: "Sprint start",
      sprintMinutes: "Sprint length (minutes)",
    },
    zones: { WIB: "WIB · Jakarta", MYT: "MYT · Kuala Lumpur" },
    schedule: "Schedule and participants",
    scheduleLocked:
      "The schedule, time zone, and word target are locked once there are participants.",
    capacityHint: "Leave the limit empty if the number of participants is unlimited.",
    sprint: "Shared sprint",
    sprintLocked: "The sprint schedule is locked once the session has started.",
    sprintHint: "Enter a start time and length if the event has a sprint session.",
    save: "Save changes",
    create: "Create event",
    saved: "Event changes saved.",
    reload: "Load latest settings",
    stale:
      "The event was changed from another page. Loading the latest settings will replace what you have entered.",
  },
  issues: {
    required: "Fill in this field.",
    max: "At most {max} characters.",
    zone: "Choose a time zone.",
    start: "Enter a valid start date and time.",
    end: "Choose a time after the event starts.",
    target: "Enter the target as a positive whole number.",
    capacity: "Enter the limit as a positive whole number.",
    sprintStart: "Enter a valid sprint start date and time.",
    sprintMinutes: "Enter a length of 1–{max} minutes.",
    sprintWithin: "The whole sprint session must fall within the event schedule.",
  },
  blocks: {
    endPast: "Choose an end time that has not passed.",
    capacity: "The limit must be at least {taken} participants.",
    scheduleLocked:
      "The schedule, time zone, and word target are locked once there are participants.",
    sprintLocked: "The sprint schedule and time zone are locked once the session has started.",
  },
  messages: {
    unavailable: "The event is not available.",
    forbidden: "You do not have access to change this event.",
    stale: "The event settings have changed. Load the latest settings before saving.",
    invalid: "Check the highlighted fields.",
    storage: "The event could not be saved on this device. Try again.",
  },
};
