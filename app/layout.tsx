import { ClientLayoutWrapper } from "@/components/layout/client-layout-wrapper";
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

import { settings } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

const SETTINGS_ID = "main-settings";

import { unstable_cache } from "next/cache";

const getCachedSettings = unstable_cache(
  async () => {
    return await db
      .select()
      .from(settings)
      .where(eq(settings.id, SETTINGS_ID))
      .limit(1);
  },
  ["main-settings"],
  {
    revalidate: 3600, // 1 hour
    tags: ["settings"],
  },
);

export async function generateMetadata(): Promise<Metadata> {
  const result = await getCachedSettings();
  const s = result[0];

  return {
    title: {
      default: s?.storeName || "Ylang Creations",
      template: `%s | ${s?.storeName || "Ylang Creations"}`,
    },
    description:
      s?.storeDescription || "Créations artisanales pour bébés et enfants",
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    ),
    openGraph: {
      title: s?.storeName || "Ylang Creations",
      description:
        s?.storeDescription || "Créations artisanales pour bébés et enfants",
      type: "website",
      locale: "fr_FR",
    },
    twitter: {
      card: "summary_large_image",
      title: s?.storeName || "Ylang Creations",
      description:
        s?.storeDescription || "Créations artisanales pour bébés et enfants",
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
