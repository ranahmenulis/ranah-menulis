import type { Author } from "../types";

/**
 * Dummy authors until profiles exist (R1). The signed-in user is bypassed during slicing, so "me"
 * is fixed to the same person as DUMMY_USER in the app shell.
 */
export const ME_ID = "rinjani-putri";

/** [konfirmasi] Group membership and group visibility options (Q-38). */
export const MY_GROUPS: readonly string[] = ["Grup Penulis Pesisir"];

export const authors: Author[] = [
  { id: ME_ID, name: "Rinjani Putri", handle: "rinjaniputri", country: "ID" },
  { id: "hafiz-rahman", name: "Hafiz Rahman", handle: "hafizrahman", country: "ID" },
  { id: "nur-aisyah", name: "Nur Aisyah", handle: "nuraisyah", country: "ID" },
  { id: "dimas-pratama", name: "Dimas Pratama", handle: "dimaspratama", country: "ID" },
  { id: "laras", name: "Laras", handle: "laras", country: "ID" },
  { id: "maya-anindita", name: "Maya Anindita", handle: "mayaanindita", country: "ID" },
  { id: "bayu-wicaksono", name: "Bayu Wicaksono", handle: "bayuwicaksono", country: "ID" },
  {
    id: "aina-sofea",
    name: "Aina Sofea",
    handle: "ainasofea",
    country: "MY",
    place: "Kuala Lumpur",
  },
  {
    id: "farid-zulkifli",
    name: "Farid Zulkifli",
    handle: "faridzulkifli",
    country: "MY",
    place: "Pulau Pinang",
  },
  {
    id: "siti-khadijah",
    name: "Siti Khadijah",
    handle: "sitikhadijah",
    country: "MY",
    place: "Johor Bahru",
  },
  {
    id: "nadiah-roslan",
    name: "Nadiah Roslan",
    handle: "nadiahroslan",
    country: "MY",
    place: "Kota Bharu",
  },
];

/** Authors the dummy user follows before touching anything. */
export const DEFAULT_FOLLOWING = ["hafiz-rahman", "nur-aisyah", "dimas-pratama", "aina-sofea"];
