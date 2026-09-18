import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Newsreader } from "next/font/google";
import { site } from "@/config/site";
import "./globals.css";

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — دليل تدريبي احترافي`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: [
    "التصوير المعماري",
    "الذكاء الاصطناعي",
    "الإظهار المعماري",
    "استبدال الخامات",
    "تحسين التفاصيل المعمارية",
    "دورة معمارية بالعربية",
  ],
  authors: [{ name: "حسين اليزيدي" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: `${site.name} — خمس مهارات · منظومة واحدة`,
    description: site.description,
    images: [{ url: "/course/hero-original.jpg", width: 1600, height: 1000, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — خمس مهارات · منظومة واحدة`,
    description: site.description,
    images: ["/course/hero-original.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#1f2126",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${plexArabic.variable} ${newsreader.variable}`}>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:start-3 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          تخطَّ إلى المحتوى
        </a>
        {children}
      </body>
    </html>
  );
}
