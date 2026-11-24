import type { landing as source } from "./id";

// English landing copy. A translation draft: it needs the client's review before launch.
export const landing: typeof source = {
  meta: {
    title: "RanahMenulis · From Beginning Writer to a Writer Who Creates",
    description:
      "Grow your writing skills, build a habit of creating, find a community, and turn your writing into real work with RanahMenulis.",
  },
  topBar: {
    logoLabel: "RanahMenulis, back to top",
    navLabel: "Page",
    menu: "Page menu",
    ecosystem: "Ecosystem",
    studio: "Studio",
    publishing: "Publishing",
    faq: "FAQ",
    cta: "Start Writing",
  },
  // Translation of the client's 24 Nov 2026 hero words; awaiting the user's review.
  hero: {
    eyebrow: "Writer Development Platform",
    titleLines: ["From Beginning Writer,", "to a Writer", "Who Creates."],
    colophon: "Indonesia · Malaysia",
    lead: "Grow your writing skills, build a habit of creating, find a community, and turn your writing into real work with RanahMenulis.",
    cta: "Start Your Writing Journey",
    secondary: "Explore RanahMenulis",
  },
  doc: {
    title: "What Grandma Waited For Beneath the Water Apple Tree",
    page: [
      "The first rain of November always came in the late afternoon, just as Grandma finished sweeping the yard. She never ran inside. She stood a while under the water apple tree, letting a few drops fall onto her headscarf, as if waiting for someone who had promised to come home with the season.",
      "I only understood the habit years later, after the house was sold and the tree was cut down by someone who disliked fallen leaves.",
    ],
    anthologyTitle: "The Letter That Was Never Sent",
    anthologyLabel: "Anthology: The Letter That Was Never Sent",
  },
  socialProof: {
    title: "A Place for Writers to Grow.",
    writers: "writers",
    works: "works",
    books: "published books",
    programs: "programs",
    and: "and",
  },
  ecosystem: {
    eyebrow: "The Ecosystem",
    title: "One Ecosystem. Many Possibilities.",
    lead: "Everything you need to grow as a writer, in one place.",
    inStudio: "Part of Studio",
    soon: "Coming later",
    modules: {
      streak: {
        name: "Ranah Streak",
        preview:
          "Streak in Studio: today's 500-word goal is reached, today's dot fills in, the streak becomes 12 days.",
      },
      project: {
        name: "Ranah Project",
        preview:
          "Anthology submission accepted. The draft in Studio may change; the submitted version stays version 2.",
      },
      studio: {
        name: "Ranah Studio",
      },
      community: {
        name: "Ranah Community",
        preview:
          "Community: an excerpt from a writer you follow, with Appreciation and comments. The Writer Battle, Roast My Writing, and The Writers Confess programs come later.",
      },
      marketplace: {
        name: "Marketplace",
        preview:
          "Marketplace, coming later: books and ebooks, writing services, job listings, and literary events.",
      },
    },
    community: {
      programs: ["Writer Battle", "Roast My Writing", "The Writers Confess"],
      author: "Nur Aisyah",
      initials: "NA",
      time: "2 hours ago",
      excerpt:
        "Writing for twenty minutes before dawn changed the way I read the day. Sentences that used to blur now have edges.",
      meta: "Excerpt · Essay",
    },
    marketplace: {
      categories: ["Books & ebooks", "Writing services", "Jobs", "Literary events"],
      listingMeta: "Paperback · Rinjani Putri",
    },
  },
  studio: {
    eyebrow: "Ranah Studio",
    featuresLabel: "Ranah Studio features",
    mockup:
      "The Ranah Studio editor from the app: the top bar with the save state, word count, and today's goal at 320 of 500 words, the format bar, then a title and two paragraphs of a manuscript.",
    caption: "Write, polish, and track your daily goal in one workspace.",
  },
  publishing: {
    title: "From Digital Manuscript to Real Book.",
    lead: "Make your dream of publishing your first book real with the RanahMenulis publishing ecosystem.",
    covers: "Three book covers from RanahMenulis publishing programs, in front of a printing room.",
    coverTitles: [
      "The Letter That Was Never Sent",
      "What Grandma Waited For Beneath the Water Apple Tree",
      "Twenty Minutes Before Dawn",
    ],
    paths: ["Anthology", "Solo Book", "Writing Class", "Writing Contest"],
    cta: "See Publishing Opportunities",
  },
  previews: {
    pause: "Pause animation",
    play: "Play animation",
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
  waitlist: {
    eyebrow: "Start Your Writing Journey",
    title: "It's Time to Write, Grow, and Publish.",
    intro: "Join RanahMenulis and become part of a writing ecosystem in Indonesia and Malaysia.",
    pillarsLabel: "What RanahMenulis offers",
    pillars: [
      "A Focused Place to Write",
      "A Supportive Community",
      "Publishing Chances",
      "Personal Growth",
    ],
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
      errors: {
        nameRequired: "Enter your nickname first.",
        emailRequired: "Enter your email address.",
        emailInvalid: "That email address looks incomplete. Example: name@domain.com",
      },
      failed:
        "Couldn't send because the connection dropped. Your entries are still here; try again.",
      submit: "Join RanahMenulis",
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
    description:
      "Writer Development Platform. A place for every writer to write, grow, and publish.",
    navLabel: "Footer",
    product: "Product",
    program: "Programs",
    support: "Support",
    help: "Help Center",
    faq: "FAQ",
    contact: "Contact",
    privacy: "Privacy Policy",
    terms: "Terms & Conditions",
    soon: "Coming soon",
    social: "Social media",
    copyright: "© 2026 RanahMenulis. All rights reserved.",
  },
};
