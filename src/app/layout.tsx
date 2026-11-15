import type { Metadata } from "next";
import { Schibsted_Grotesk, Source_Serif_4 } from "next/font/google";
import { Suspense } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { I18nRoot } from "@/lib/i18n/i18n-root";
import { themeScript } from "@/lib/theme/theme";
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
  description: "Ekosistem digital untuk menulis, komunitas literasi, dan penerbitan buku.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      suppressHydrationWarning // the landing script adds lp-motion and the theme script data-theme before hydration
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        {/* The language comes from a cookie (runtime data), so pages render inside this boundary. */}
        <Suspense fallback={null}>
          <I18nRoot>
            <ToastProvider>{children}</ToastProvider>
          </I18nRoot>
        </Suspense>
      </body>
    </html>
  );
}
