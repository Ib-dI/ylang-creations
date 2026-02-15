/**
 * FontPreloader optimisé - Ne précharge que les polices critiques
 * Les polices locales sont chargées ici pour améliorer le LCP
 */

const DEFAULT_LOCALE = "fr" as const;

// Polices critiques locales pour le projet Ylang Creations
const CRITICAL_FONTS = {
  [DEFAULT_LOCALE]: [
    { type: "font/woff2", location: "/fonts/abramo-regular.woff2" },
    { type: "font/woff2", location: "/fonts/abramo-script.woff2" },
  ],
} as const;

type SupportedLocale = keyof typeof CRITICAL_FONTS;

interface FontPreloaderProps {
  locale?: string;
}

/**
 * Composant FontPreloader optimisé pour précharger uniquement les polices critiques localement
 */
const FontPreloader: React.FC<FontPreloaderProps> = ({
  locale = DEFAULT_LOCALE,
}) => {
  const validLocale = (
    locale in CRITICAL_FONTS ? locale : DEFAULT_LOCALE
  ) as SupportedLocale;
  const toBePreLoadedFonts = CRITICAL_FONTS[validLocale];

  return (
    <>
      {toBePreLoadedFonts.map((fontDetails) => (
        <link
          key={fontDetails.location}
          rel="preload"
          as="font"
          type={fontDetails.type}
          href={fontDetails.location}
          crossOrigin="anonymous"
        />
      ))}
    </>
  );
};

export default FontPreloader;
