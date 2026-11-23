import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IllustrationSheet } from "./illustration-sheet";

// Development preview of every illustration. Not available in production.
export const metadata: Metadata = {
  title: "Ilustrasi · Sistem desain",
  robots: { index: false },
};

export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  return <IllustrationSheet />;
}
