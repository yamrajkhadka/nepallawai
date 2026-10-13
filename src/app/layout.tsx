import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist_Mono, Inter, Noto_Sans_Devanagari } from "next/font/google";
import { ThemeWatcher } from "@/components/theme/theme-watcher";
import { Toaster } from "@/components/ui/sonner";
import { GA_ID } from "@/lib/analytics";
import { siteConfig } from "@/lib/site";
import { themeScript } from "@/lib/theme-script";
import "./globals.css";

const inter = Inter({ variable: "--font-body", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// Only downloaded when Nepali text is on screen.
const devanagari = Noto_Sans_Devanagari({ variable: "--font-devanagari", subsets: ["devanagari"], preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Ask anything about Nepali law`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  keywords: [
    "Nepal law",
    "Nepali law",
    "legal AI Nepal",
    "Constitution of Nepal",
    "National Civil Code 2017",
    "Muluki Civil Code",
    "National Penal Code 2017",
    "Muluki Criminal Code",
    "Nepal legal questions",
    "कानुन",
  ],
  category: "legal",
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    url: "/",
    title: `${siteConfig.name} — Ask anything about Nepali law`,
    description: siteConfig.description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Ask anything about Nepali law`,
    description: siteConfig.description,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1726" },
  ],
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} ${devanagari.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <ThemeWatcher />
        {children}
        <Toaster />

        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
