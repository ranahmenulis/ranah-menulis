/**
 * Dummy data for Beranda until the account screens exist. Everything here is placeholder content
 * written to look like real use; none of it comes from a database.
 */

export type Followed = { name: string; fresh: boolean; handle: string };
export const followed: Followed[] = [
  { name: "Hafiz Rahman", fresh: true, handle: "hafizrahman" },
  { name: "Nur Aisyah", fresh: true, handle: "nuraisyah" },
  { name: "Dimas Pratama", fresh: true, handle: "dimaspratama" },
  { name: "Aina Sofea", fresh: false, handle: "ainasofea" },
];
