import * as React from "react";

// Gabarit commun à tous les emails : en-tête de marque, contenu, pied de page.
// Le contenu (children) doit être une ou plusieurs lignes <tr> du tableau principal.

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com/ylang.creations" },
  { label: "Facebook", href: "https://facebook.com/ylangcreations" },
  { label: "Pinterest", href: "https://pinterest.com/ylangcreations" },
];

interface EmailLayoutProps {
  children: React.ReactNode;
  // Mention légale en bas de l'email (ex : lien de désinscription newsletter)
  footerNote?: React.ReactNode;
}

export function EmailLayout({ children, footerNote }: EmailLayoutProps) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: "Arial, sans-serif",
          backgroundColor: "#f5f1e8",
        }}
      >
        <table
          cellPadding="0"
          cellSpacing="0"
          border={0}
          style={{
            width: "100%",
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
          }}
        >
          <tbody>
            {/* Header */}
            <tr>
              <td
                style={{
                  background:
                    "linear-gradient(135deg, #b76e79 0%, #d4a89a 100%)",
                  padding: "40px 20px",
                  textAlign: "center",
                }}
              >
                <h1
                  style={{
                    color: "#ffffff",
                    fontSize: "32px",
                    fontWeight: "bold",
                    margin: "0 0 10px 0",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Ylang Créations
                </h1>
                <p
                  style={{
                    color: "#ffffff",
                    fontSize: "14px",
                    margin: 0,
                    opacity: 0.95,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                  }}
                >
                  Atelier Textile Premium
                </p>
              </td>
            </tr>

            {children}

            {/* Footer */}
            <tr>
              <td
                style={{
                  padding: "30px 20px",
                  textAlign: "center",
                  backgroundColor: "#f5f1e8",
                }}
              >
                <p
                  style={{
                    color: "#1a1a1a",
                    opacity: 0.6,
                    fontSize: "14px",
                    margin: "0 0 15px 0",
                  }}
                >
                  Merci de faire confiance à Ylang Créations
                </p>
                <p style={{ margin: "0 0 15px 0", textAlign: "center" }}>
                  {SOCIAL_LINKS.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      style={{
                        display: "inline-block",
                        margin: "0 10px",
                        color: "#b76e79",
                        textDecoration: "none",
                      }}
                    >
                      {link.label}
                    </a>
                  ))}
                </p>
                <p
                  style={{
                    color: "#1a1a1a",
                    opacity: 0.5,
                    fontSize: "12px",
                    margin: footerNote ? "0 0 10px 0" : 0,
                  }}
                >
                  © {new Date().getFullYear()} Ylang Créations - Atelier
                  textile premium
                  <br />
                  12 rue de l&apos;Artisanat, 75011 Paris, France
                </p>
                {footerNote && (
                  <p
                    style={{
                      color: "#1a1a1a",
                      opacity: 0.4,
                      fontSize: "11px",
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

// Bouton d'action principal, partagé par les templates
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
      style={{ width: "100%", margin: "10px 0 30px 0" }}
    >
      <tbody>
        <tr>
          <td style={{ textAlign: "center" }}>
            <a
              href={href}
              style={{
                display: "inline-block",
                padding: "16px 40px",
                background: "linear-gradient(135deg, #b76e79 0%, #d4a89a 100%)",
                backgroundColor: "#b76e79",
                color: "#ffffff",
                textDecoration: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "bold",
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
