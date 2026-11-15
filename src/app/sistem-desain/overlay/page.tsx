import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OverlayDemo } from "./overlay-demo";

// Development preview of Dialog, Laci, Menu, and Toast. Not available in production.
export const metadata: Metadata = {
  title: "Overlay · Sistem desain",
  robots: { index: false },
};

export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  return <OverlayDemo />;
}
