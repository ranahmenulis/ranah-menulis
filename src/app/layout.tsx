import type { Metadata } from "next";
import { Schibsted_Grotesk, Source_Serif_4 } from "next/font/google";
import "./globals.css";

// Huruf sans masih usulan (DESIGN.md 4.2); final setelah uji spesimen.
const sans = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  axes: ["opsz"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RanahMenulis",
  description:
    "Ekosistem digital untuk menulis, komunitas literasi, dan penerbitan buku.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      suppressHydrationWarning // skrip landing memasang kelas is-animating sebelum hidrasi
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
