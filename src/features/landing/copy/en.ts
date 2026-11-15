import type { landing as source } from "./id";

// English landing copy. A translation draft: it needs the client's review before launch.
export const landing: typeof source = {
  meta: {
    title: "RanahMenulis · Write the paragraph today. The book follows.",
    description:
      "Write in Studio, share an excerpt, then send the same manuscript to an anthology or a solo book. No copying over.",
  },
  topBar: {
    logoLabel: "RanahMenulis, back to top",
    navLabel: "Page",
    how: "How it works",
    projects: "Projects",
    faq: "FAQ",
    cta: "Join the waitlist",
    ctaShort: "Waitlist",
  },
  hero: {
    title: "Write the paragraph today. The book follows.",
    lead: "Write in Studio, share an excerpt, then send the same manuscript to an anthology or a solo book. No copying over.",
    cta: "Join the waitlist",
    secondary: "See how it works",
    ariaLabel:
      "A paragraph is typed in Studio, becomes page 12 of a book, then becomes a black-covered book titled What Grandma Waited For Beneath the Water Apple Tree by Rinjani Putri.",
    saving: "Saving…",
    saved: "Saved 2:02 PM",
    words: "words",
  },
  doc: {
    title: "What Grandma Waited For Beneath the Water Apple Tree",
    shortTitle: "What Grandma Waited For",
    author: "Rinjani Putri",
    typed:
      "The first rain of November always came in the late afternoon, just as Grandma finished sweeping the yard. She never ran inside.",
    page: [
      "The first rain of November always came in the late afternoon, just as Grandma finished sweeping the yard. She never ran inside. She stood a while under the water apple tree, letting a few drops fall onto her headscarf, as if waiting for someone who had promised to come home with the season.",
      "I only understood the habit years later, after the house was sold and the tree was cut down by someone who disliked fallen leaves.",
    ],
    editorBase:
      "Someone was waiting by sitting on the porch, staring down the end of the road until her eyes ached.",
    editorTail: " Grandma waited by getting wet.",
    anthologyTitle: "The Letter That Was Never Sent",
    anthologyLabel: "Anthology: The Letter That Was Never Sent",
  },
  stepsTitle: "One manuscript, four steps.",
  steps: {
    menulis: {
      title: "Write",
      text: "Saved automatically and private until you share it.",
      preview: "Studio editor: the last sentence is typed, then saved. The document stays private.",
    },
    target: {
      title: "Daily goal",
      text: "Every day you reach your goal becomes a dot on your calendar.",
      preview:
        "Streak in Studio: today's 500-word goal is reached, today's dot fills in, the streak becomes 12 days.",
    },
    dibagikan: {
      title: "Share",
      text: "Only the parts you choose appear in Community.",
      preview:
        "Choosing parts for Community: only the first paragraph is ticked and becomes public.",
    },
    terbit: {
      title: "Publish",
      text: "Send the manuscript to an anthology without copying it over. Your draft stays editable.",
      preview:
        "Anthology submission accepted. The draft in Studio may change; the submitted version stays version 2.",
    },
  },
  previews: {
    pause: "Pause animation",
    play: "Play animation",
    shareHint: "Parts you don't select stay private.",
    shareNotice: "Only this text becomes public.",
    streakUnit: "days in a row",
    todayWords: "Today {count} / 500 words",
    reached: "Reached",
    weekdays: ["M", "T", "W", "T", "F", "S", "S"],
    submissionMeta: "“The Cracker Jar” · version 2 · sent Nov 3",
    sent: "Sent",
    accepted: "Accepted",
    submissionNote:
      "The draft in Studio changed 2 hours ago. The submitted version stays version 2.",
  },
  projectsTitle: "Where your manuscript can go.",
  projects: [
    { name: "Anthology", flow: "Selection · revision · publishing" },
    { name: "Solo Book", flow: "Editing · cover · production" },
    { name: "Writing Class", flow: "Lessons · assignments · feedback" },
    { name: "Contest", flow: "Criteria · finalists · winners" },
  ],
  trust: [
    {
      label: "Privacy",
      title: "Your private drafts stay private.",
      text: "No one else reads them, except for a recorded legal or moderation reason.",
    },
    {
      label: "Submissions",
      title: "What you've sent doesn't change.",
      text: "A revision creates a new version; the version you sent stays saved.",
    },
    {
      label: "Copyright",
      title: "Copyright stays yours.",
      text: "Except for project terms you read and accept before signing up.",
    },
  ],
  waitlist: {
    title: "Save your name on the waitlist.",
    intro: "We'll email you when RanahMenulis opens.",
    interests: ["Regular writing", "Anthology", "Solo book", "Classes", "Contests", "Reading"],
    form: {
      ariaLabel: "Join the waitlist",
      thanks: "Thank you, {name}. Your name is saved.",
      fallbackName: "friend",
      confirmation: "We'll send the opening news to {email}.",
      name: "Nickname",
      namePlaceholder: "For example Rinjani",
      email: "Email",
      emailPlaceholder: "name@domain.com",
      country: "Country",
      countries: { ID: "Indonesia", MY: "Malaysia", OTHER: "Other" },
      interest: "Interests",
      interestHint: "(optional, pick as many as you like)",
      exists:
        "This email is already on the waitlist. You don't need to sign up again; we'll send the opening news to this address.",
      failed:
        "Couldn't send because the connection dropped. Your entries are still here; try again.",
      submit: "Join the waitlist",
      sending: "Sending…",
      retry: "Try again",
      otherEmail: "Use another email",
      consentBefore: "By joining, you agree to the",
      privacy: "Privacy policy",
      consentAfter: "of RanahMenulis.",
    },
  },
  faqTitle: "FAQ",
  faq: [
    {
      question: "What is a Writers' Group?",
      answer:
        "A small space where a group of writers read each other's work shared to the group. Documents you don't share stay private.",
    },
    {
      question: "Is it available in Indonesia and Malaysia?",
      answer:
        "Yes. You choose your country in your profile, and your writing appears in that country's writer list. The interface is in Indonesian first.",
    },
    {
      question: "How much does it cost?",
      answer:
        "Writing and reading are planned to have no subscription fee at first. Programs in Projects have their own fees, shown before you sign up.",
    },
    {
      question: "When does RanahMenulis open?",
      answer: "The date isn't announced yet. People on the waitlist hear first.",
    },
  ],
  footer: {
    countries: "Indonesia · Malaysia",
    navLabel: "Footer",
    privacy: "Privacy policy",
    contact: "Contact",
  },
};
