import type { flowA as source } from "./flow-a-id";

export const flowA: typeof source = {
  common: {
    backToProject: "Back to project",
    viewProject: "View project",
    signIn: "Sign in",
    sendWork: "Submit work",
    payNow: "Pay now",
    untitled: "Untitled",
  },
  action: {
    registered: "Registered",
    full: "Fully booked",
    closed: "Registration closed",
    signInToRegister: "Sign in to register",
    register: "Register",
    submitClosed: "Submissions closed",
    limitReached: "Work limit reached",
  },
  remaining: {
    minutes: "{m} min left",
    hours: "{h} h left",
    hoursMinutes: "{h} h {m} min left",
  },
  register: {
    loading: "Loading registration",
    signInRequired: "Sign in to register for this project.",
    full: "This project is fully booked.",
    closed: "Registration for this project has closed.",
    form: {
      title: "Register",
      summary: "Summary",
      category: "Category",
      fee: "Fee",
      registration: "Registration",
      paidNote: "The fee is paid by QRIS after you register; your seat is held for 2 hours.",
      choosePackage: "Choose a package",
      terms: "Terms",
      baseTerms: [
        "You keep the copyright to your work, unless the project's special terms below explicitly say otherwise.",
        "The work you submit is your own, or you have the right to submit it.",
      ],
      specialHeading: "Project-specific terms",
      noSpecial: "This project has no special terms.",
      version: "Terms version {version}",
      agree: "I have read and agree to the terms above.",
      submit: "Register",
      hintSolo: "Choose a package and accept the terms to register.",
      hint: "Accept the terms to register.",
    },
    status: {
      waiting: "Your registration is waiting for payment.",
      justNow: "You are registered.",
      already: "You are already registered.",
      package: " · {name} package",
      registeredOn: "Registered on {date}. Terms version {version} accepted.",
      feeHold: "Fee {fee}. Your seat is held until payment arrives or the time runs out.",
    },
  },
  payment: {
    signIn: "Sign in to pay for your registration.",
    notRegistered: "You have not registered for this project, so there is nothing to pay yet.",
    free: "This project is free; there is no payment.",
    myr: "Payment in ringgit (MYR) is coming; for now QRIS accepts rupiah only. Your registration is recorded.",
    waiting: {
      title: "Complete your payment.",
      package: "{name} package",
      hold: "Your seat is held until {until} ({remaining}). After that this registration ends and the seat opens up again.",
      auto: "Payment is confirmed automatically when it arrives; this page updates by itself.",
      qrisAlt: "Sample of a QRIS code, not a real code",
      qrisSample: "Sample, not a real QRIS code",
      amount: "Amount to pay",
    },
    done: { title: "Payment received.", body: "You are registered. Fee {fee}." },
    expired: {
      title: "Payment time is up.",
      body: "Your registration for {title} ended because payment did not arrive, and the seat was reopened.",
      retry: " You can register again while seats remain.",
      again: "Register again",
    },
  },
  cancel: {
    notice:
      "Your registration was cancelled. The seat is released, and you can register again while there is room.",
    button: "Cancel registration",
    failed: "The registration could not be cancelled. Try again in a moment.",
    dialogTitle: "Cancel registration?",
    dialogBody:
      "Your registration for {title} is withdrawn and your seat is released. You can register again while seats and the deadline remain.",
    keep: "Stay registered",
    blocks: {
      "tidak-ada": "Your registration no longer exists.",
      berbayar: "Registrations for paid projects cannot be cancelled yet.",
      "menunggu-pembayaran": "A registration waiting for payment cannot be cancelled yet.",
      "tidak-terbit":
        "This project is not published right now, so its registration cannot be changed.",
      "ada-kiriman":
        "You still have work submitted to this project. Withdraw it on the submission page first, then cancel your registration.",
      "ada-tugas":
        "You have already handed in assignments for this class, so the registration cannot be cancelled.",
      "lomba-dinilai":
        "This contest is already being judged, so the registration cannot be cancelled.",
    },
  },
};
