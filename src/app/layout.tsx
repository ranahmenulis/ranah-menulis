import type { Metadata, Viewport } from "next";
import { Inter, Merriweather } from "next/font/google";
import { Suspense } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { I18nRoot } from "@/lib/i18n/i18n-root";
import { themeScript } from "@/lib/theme/theme";
import "./globals.css";

// Client font brief (DESIGN.md 4.2): Inter for the interface, Merriweather for writing and reading.
// Both are variable; the opsz axis gives headings and large text their display cut.
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  axes: ["opsz"],
  display: "swap",
});

const serif = Merriweather({
  subsets: ["latin"],
  variable: "--font-merriweather",
  axes: ["opsz"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RanahMenulis",
  description: "Ekosistem digital untuk menulis, komunitas literasi, dan penerbitan buku.",
};

// cover lets the page draw under the notch; the bars pad themselves with --safe-top. The status
// bar colour (theme-color) is set by themeScript, so it also follows a saved theme.
export const viewport: Viewport = { viewportFit: "cover" };

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
