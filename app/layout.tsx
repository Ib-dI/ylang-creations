import { ClientLayoutWrapper } from "@/components/layout/client-layout-wrapper";
import FontPreloader from "@/components/layout/font-preloader";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

// Optimisation: display='swap' pour éviter FOUT, preload pour fonts critiques
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Pas critique, charge en différé
});

import { getCachedSettings } from "@/lib/actions/settings";

export async function generateMetadata(): Promise<Metadata> {
  const result = await getCachedSettings();
  const s = result[0];
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://ylang-creations.com";

  return {
    title: {
      default: s?.storeName || "Ylang Creations",
      template: `%s | ${s?.storeName || "Ylang Creations"}`,
    },
    description:
      s?.storeDescription ||
      "Créations artisanales pour bébés et enfants, faites main avec amour. Découvrez nos collections uniques et personnalisables.",
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: "/",
    },
    applicationName: "Ylang Creations",
    authors: [{ name: "Ylang Creations" }],
    generator: "Next.js",
    keywords: [
      "bébé",
      "enfant",
      "artisanat",
      "fait main",
      "création française",
      "cadeau naissance",
      "personnalisation",
    ],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: s?.storeName || "Ylang Creations",
      description:
        s?.storeDescription ||
        "Créations artisanales pour bébés et enfants, faites main avec amour.",
      url: baseUrl,
      siteName: "Ylang Creations",
      locale: "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: s?.storeName || "Ylang Creations",
      description:
        s?.storeDescription ||
        "Créations artisanales pour bébés et enfants, faites main avec amour.",
    },
    verification: {
      google: "google-site-verification-placeholder", // À remplacer via env ou settings plus tard
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="fr">
      <head>
        <FontPreloader />
        <link rel="icon" href="/logo/logo-1.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/logo/logo-1.png" />
        {/* Preconnect pour les domaines externes si vous en utilisez */}
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/images/polyligne-patern.webp"
          as="image"
          type="image/webp"
          fetchPriority="high"
        />
      </head>
      <body
        className={`${inter.variable} ${playfairDisplay.variable} ${bricolageGrotesque.variable} font-body bg-ylang-cream antialiased`}
      >
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
