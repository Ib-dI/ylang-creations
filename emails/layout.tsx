import * as React from "react";

// Gabarit commun à tous les emails : logo, contenu, pied de page.
// Le contenu (children) doit être une ou plusieurs lignes <tr> du tableau principal.

// Équivalents hexadécimaux des tokens du site (app/globals.css) : les
// clients mail ne comprennent ni oklch ni les variables CSS.
export const emailTheme = {
  paper: "#fdf4f1",
  paper2: "#f8ece8",
  ink: "#1f1718",
  ink3: "#6f6564",
  accent: "#a77769",
  rule: "#ead9d4",
  fontDisplay: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
  fontBody: "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif",
};

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://ylang-creations.vercel.app";

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/ylang_creations/" },
  { label: "Facebook", href: "https://www.facebook.com/ylangcreations/" },
];

interface EmailLayoutProps {
  children: React.ReactNode;
  // Mention légale en bas de l'email (ex : lien de désinscription newsletter)
  footerNote?: React.ReactNode;
}

export function EmailLayout({ children, footerNote }: EmailLayoutProps) {
  const t = emailTheme;

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Limite l'inversion des couleurs en mode sombre (Apple Mail, Outlook) */}
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light only" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Inter:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          margin: 0,
          padding: "32px 12px",
          fontFamily: t.fontBody,
          backgroundColor: t.paper2,
          color: t.ink,
        }}
      >
        <table
          cellPadding="0"
          cellSpacing="0"
          border={0}
          role="presentation"
          style={{
            width: "100%",
            maxWidth: "560px",
            margin: "0 auto",
            backgroundColor: t.paper,
          }}
        >
          <tbody>
            {/* En-tête : logo */}
            <tr>
              <td style={{ padding: "40px 32px 8px", textAlign: "center" }}>
                <a href={APP_URL} style={{ textDecoration: "none" }}>
                  <img
                    src={`${APP_URL}/emails/logo.png`}
                    width={120}
                    height={73}
                    alt="Ylang Créations"
                    style={{ display: "inline-block", border: 0 }}
                  />
                </a>
              </td>
            </tr>

            {children}

            {/* Pied de page */}
            <tr>
              <td style={{ padding: "0 32px" }}>
                <div style={{ borderTop: `1px solid ${t.rule}` }} />
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: "28px 32px 36px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontFamily: t.fontDisplay,
                    fontSize: "18px",
                    color: t.ink,
                    margin: "0 0 6px 0",
                  }}
                >
                  Ylang Créations
                </p>
                <p
                  style={{
                    color: t.ink3,
                    fontSize: "12px",
                    lineHeight: "1.6",
                    margin: "0 0 16px 0",
                  }}
                >
                  Créations textiles sur mesure pour bébés et enfants
                </p>
                <p style={{ margin: footerNote ? "0 0 16px 0" : 0 }}>
                  {SOCIAL_LINKS.map((link, i) => (
                    <React.Fragment key={link.label}>
                      {i > 0 && (
                        <span style={{ color: t.rule, margin: "0 10px" }}>·</span>
                      )}
                      <a
                        href={link.href}
                        style={{
                          color: t.accent,
                          fontSize: "11px",
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          textDecoration: "none",
                        }}
                      >
                        {link.label}
                      </a>
                    </React.Fragment>
                  ))}
                </p>
                {footerNote && (
                  <p
                    style={{
                      color: t.ink3,
                      fontSize: "11px",
                      lineHeight: "1.6",
                      margin: 0,
                    }}
                  >
                    {footerNote}
                  </p>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

// Surtitre en petites capitales + titre serif, comme les pages du site
export function EmailHeading({
  overline,
  children,
}: {
  overline: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <p
        style={{
          color: emailTheme.accent,
          fontSize: "11px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          margin: "0 0 12px 0",
        }}
      >
        {overline}
      </p>
      <h1
        style={{
          fontFamily: emailTheme.fontDisplay,
          color: emailTheme.ink,
          fontSize: "32px",
          fontWeight: 400,
          lineHeight: "1.15",
          letterSpacing: "-0.01em",
          margin: "0 0 20px 0",
        }}
      >
        {children}
      </h1>
    </>
  );
}

// Titre de section secondaire (ex : « Détail de votre commande »)
export function EmailSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        color: emailTheme.ink3,
        fontSize: "11px",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        margin: "0 0 16px 0",
      }}
    >
      {children}
    </p>
  );
}

// Bouton d'action principal, même style que les boutons de l'espace client
export function EmailButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <table
      cellPadding="0"
      cellSpacing="0"
      border={0}
      role="presentation"
      style={{ width: "100%", margin: "8px 0 28px 0" }}
    >
      <tbody>
        <tr>
          <td style={{ textAlign: "center" }}>
            <a
              href={href}
              style={{
                display: "inline-block",
                padding: "16px 36px",
                backgroundColor: emailTheme.ink,
                color: emailTheme.paper,
                textDecoration: "none",
                fontFamily: emailTheme.fontBody,
                fontSize: "12px",
                fontWeight: 500,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              {children}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
