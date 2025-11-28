import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Playfair_Display, Bricolage_Grotesque } from "next/font/google";
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import "./globals.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ylang Creations",
  description: "Ylang Creations est une entreprise spécialisée dans la création d'accessoires et de bijoux personnalisés.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="fr">
      <head>
        <link rel="icon" href="/logo/logo-1.png" type="image/png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${playfairDisplay.variable} ${bricolageGrotesque.variable} font-body bg-ylang-cream antialiased`}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
