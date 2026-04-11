import * as React from "react";

interface NewsletterCampaignEmailProps {
  htmlContent: string;
  unsubscribeUrl: string;
}

export function NewsletterCampaignEmail({
  htmlContent,
  unsubscribeUrl,
}: NewsletterCampaignEmailProps) {
  return (
    <html>
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
          {/* Header */}
          <tr>
            <td
              style={{
                background: "linear-gradient(135deg, #b76e79 0%, #d4a89a 100%)",
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

          {/* Content */}
          <tr>
            <td
              style={{
                padding: "40px 30px",
                backgroundColor: "#faf9f6",
                color: "#1a1a1a",
                fontSize: "16px",
                lineHeight: "1.7",
              }}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </tr>

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
              <table
                cellPadding="0"
                cellSpacing="0"
                border={0}
                style={{ width: "100%", marginBottom: "15px" }}
              >
                <tr>
                  <td style={{ textAlign: "center" }}>
                    <a
                      href="https://instagram.com/ylang.creations"
                      style={{
                        display: "inline-block",
                        margin: "0 10px",
                        color: "#b76e79",
                        textDecoration: "none",
                      }}
                    >
                      Instagram
                    </a>
                    <a
                      href="https://facebook.com/ylangcreations"
                      style={{
                        display: "inline-block",
                        margin: "0 10px",
                        color: "#b76e79",
                        textDecoration: "none",
                      }}
                    >
                      Facebook
                    </a>
                  </td>
                </tr>
              </table>
              <p
                style={{
                  color: "#1a1a1a",
                  opacity: 0.5,
                  fontSize: "12px",
                  margin: "0 0 10px 0",
                }}
              >
                © {new Date().getFullYear()} Ylang Créations - Atelier textile
                premium
                <br />
                12 rue de l'Artisanat, 75011 Paris, France
              </p>
              <p
                style={{
                  color: "#1a1a1a",
                  opacity: 0.4,
                  fontSize: "11px",
                  margin: 0,
                }}
              >
                Vous recevez cet email car vous êtes inscrit(e) à notre
                newsletter.{" "}
                <a
                  href={unsubscribeUrl}
                  style={{ color: "#b76e79", textDecoration: "underline" }}
                >
                  Se désinscrire
                </a>
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}
