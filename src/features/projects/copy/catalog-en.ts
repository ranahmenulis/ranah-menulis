import type { projectsCatalog as source } from "./catalog-id";

export const projectsCatalog: typeof source = {
  categories: {
    semua: {
      label: "All",
      description: "Programs to write, collaborate, compete, and publish books.",
    },
    antologi: {
      label: "Anthology",
      description:
        "One themed book from many writers. Your manuscript is selected, revised with an editor, then goes into production.",
    },
    solo: {
      label: "Solo",
      description: "Publish a book of your own, from editing through production.",
    },
    kelas: {
      label: "Writing Class",
      description:
        "Writing classes, workshops, and mentoring with assignments and mentor feedback.",
    },
    lomba: {
      label: "Contest",
      description:
        "Writing competitions with deadlines, criteria-based judging, and winner announcements.",
    },
  },
  stateFilters: {
    semua: "All statuses",
    buka: "Open",
    "segera-tutup": "Closing soon",
    ditutup: "Closed",
  },
  feeFilters: { semua: "All fees", gratis: "Free", berbayar: "Paid" },
  states: {
    buka: "Open",
    "segera-tutup": "Closing soon",
    "kuota-penuh": "Full",
    ditutup: "Closed",
  },
  fee: { free: "Free", startingFrom: "From" },
  deadline: {
    yearRound: "Open all year",
    closes: "Closes {date}",
    closed: "Closed {date}",
  },
  quota: {
    label: "Seats",
    none: "No seat limit",
    full: "Full",
    left: "{left} of {total} seats left",
  },
  daysLeft: { lastDay: "Last day today", days: "{n} days left" },
  action: {
    openClassDashboard: "Open class dashboard",
    openDashboard: "Open dashboard",
    sendWork: "Send work",
    sentOf: "{n} of {works}",
    works: "{n} works",
  },
  filters: { category: "Category", status: "Status", fee: "Fee" },
  view: {
    title: "Projects",
    mine: "My projects",
    none: "No projects",
    count: "{n} projects",
    clearFilters: "Clear filters",
    seeAll: "See all Projects",
    noMatch: "No projects match these filters.",
    noneInCategory: "No {category} projects are open yet.",
    noneOpen: "No projects are open yet.",
  },
  featured: { label: "Featured", all: "All projects", view: "View project" },
  detail: {
    allProjects: "All Projects",
    about: "About the project",
    requirements: "Manuscript requirements",
    scheduleTitle: "Schedule",
    registration: "Registration",
    scheduleNote:
      "All dates follow the project's time zone ({zone}). Registration and submission stay open until the end of the day on that date.",
    rightsTitle: "Copyright and terms",
    rights:
      "The copyright of your work stays with you, unless the project's terms explicitly say otherwise. You read and agree to the project's full terms before registering.",
    managedBy: "Managed by {organizer}.",
  },
  aside: {
    label: "Registration",
    feePackage: "Package fee",
    fee: "Fee",
    sent: "Works sent",
    results: "See contest results",
    viewRegistration: "View registration",
    registeredOn: "Registered on {date}.",
    awaitingPayment: "Awaiting payment; your seat is held.",
    packageNote: " {name} package.",
  },
  blocks: {
    antologiTitle: "Selection and production flow",
    theme: "Theme ",
    soloTitle: "Service packages",
    kelasTitle: "Teacher and curriculum",
    moduleSr: "Module {n}. ",
    meetings: "{n} sessions",
    lombaTitle: "Criteria and prizes",
    prizes: "Prizes",
    anonymous:
      "Anonymous judging: participants' names and profiles are hidden from the judges until judging closes.",
  },
  screens: {
    loadingProjects: "Loading Projects",
    loadingProject: "Loading project",
    loadingDashboard: "Loading dashboard",
    goneTitle: "This project was not found.",
    goneBody: "The address may be mistyped, or the project is not open to the public yet.",
    goneBack: "See all Projects",
  },
};
