import { ClientLayoutWrapper } from "@/components/layout/client-layout-wrapper";
import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Geist,
  Geist_Mono,
  Inter,
  Playfair_Display,
  Rouge_Script
} from "next/font/google";
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

const rougeScript = Rouge_Script({
  weight: "400",
  variable: "--font-rouge-script"
});

import { settings } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

const SETTINGS_ID = "main-settings";

export async function generateMetadata(): Promise<Metadata> {
  const result = await db
    .select()
    .from(settings)
    .where(eq(settings.id, SETTINGS_ID))
    .limit(1);

  const s = result[0];

  return {
    title: s?.storeName || "Ylang Creations",
    description:
      s?.storeDescription || "Créations artisanales pour bébés et enfants",
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
        <link rel="icon" href="/logo/logo-1.png" type="image/png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${playfairDisplay.variable} ${bricolageGrotesque.variable} ${rougeScript.variable} font-body bg-ylang-cream antialiased`}
      >
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
