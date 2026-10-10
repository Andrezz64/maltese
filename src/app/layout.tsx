import type { Metadata } from "next";
import { Newsreader, Cinzel, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";

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
    template: "%s | Maltese — Caderno de Escritos & Crítica",
    default: "Maltese — Caderno de Escritos, Crítica & Liberdade",
  },
  description:
    "Página autoral dedicada a ensaios, manifestos, pensamento crítico, filosofia social e reflexões sobre a liberdade concreta e a emancipação humana.",
  keywords: [
    "Escritos",
    "Ensaios",
    "Crítica Social",
    "Socialismo Libertário",
    "Filosofia",
    "Manifesto",
    "Autonomia",
    "Maltese",
  ],
  authors: [{ name: "Maltese" }],
  creator: "Maltese",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://maltese-escritos.vercel.app",
    title: "Caderno Maltese",
    description:
      "Caderno independente de ensaios, manifestos e pensamento crítico. Sem anúncios, sem algoritmos, sem banco de dados.",
    siteName: "Maltese — Escritos",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maltese — Caderno de Escritos, Crítica & Liberdade",
    description: "Caderno independente de ensaios, manifestos e pensamento crítico.",
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
          <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
