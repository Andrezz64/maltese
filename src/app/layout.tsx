import type { Metadata } from "next";
import { Newsreader, Cinzel, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import siteConfig from "@site-config";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif-body",
  display: "swap",
  style: ["normal", "italic"],
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-serif-title",
  display: "swap",
  weight: ["400", "600", "700", "900"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${siteConfig.title} — ${siteConfig.tagline}`,
    default: `${siteConfig.title} — ${siteConfig.tagline}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  keywords: [
    "Escritos",
    "Ensaios",
    "Crítica Social",
    "Filosofia",
    "Manifesto",
    "Autonomia",
    siteConfig.title,
    siteConfig.author,
  ],
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  openGraph: {
    type: "website",
    locale: siteConfig.language,
    url: siteConfig.url,
    title: `${siteConfig.title} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    siteName: siteConfig.title,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.title} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${newsreader.variable} ${cinzel.variable} ${jakarta.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased selection:bg-[#a82020] selection:text-white min-h-screen flex flex-col">
        <ThemeProvider>
          <Header />
          <main className="flex-1 w-full max-w-7xl 2xl:max-w-[1750px] mx-auto px-3 sm:px-6 lg:px-8 py-5 md:py-7">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
