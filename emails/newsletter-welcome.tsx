import * as React from "react";
import { EmailLayout } from "./layout";

interface NewsletterWelcomeEmailProps {
  unsubscribeUrl: string;
}

export function NewsletterWelcomeEmail({
  unsubscribeUrl,
}: NewsletterWelcomeEmailProps) {
  return (
    <EmailLayout
      footerNote={
        <>
          Vous recevez cet email car vous vous êtes inscrit(e) à notre
          newsletter.{" "}
          <a
            href={unsubscribeUrl}
            style={{ color: "#b76e79", textDecoration: "underline" }}
          >
            Se désinscrire
          </a>
        </>
      }
    >
      {/* Content */}
      <tr>
        <td style={{ padding: "40px 30px", backgroundColor: "#faf9f6" }}>
          <h2
            style={{
              color: "#1a1a1a",
              fontSize: "24px",
              fontWeight: "bold",
              margin: "0 0 10px 0",
            }}
          >
            Bienvenue dans notre univers !
          </h2>
          <p
            style={{
              color: "#1a1a1a",
              fontSize: "16px",
              lineHeight: "1.6",
              margin: "0 0 30px 0",
              opacity: 0.8,
            }}
          >
            Merci de rejoindre la communauté Ylang Créations. Vous serez
            désormais parmi les premiers à découvrir nos nouvelles collections,
            nos inspirations et nos offres exclusives.
          </p>

          {/* Avantages */}
          <table
            cellPadding="0"
            cellSpacing="0"
            border={0}
            style={{
              width: "100%",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              marginBottom: "30px",
              border: "1px solid #e8dcc8",
            }}
          >
            <tr>
              <td style={{ padding: "20px" }}>
                <h3
                  style={{
                    color: "#1a1a1a",
                    fontSize: "18px",
                    fontWeight: "bold",
                    margin: "0 0 20px 0",
                  }}
                >
                  Ce qui vous attend
                </h3>

                {[
                  {
                    icon: "✨",
                    title: "Nouvelles créations en avant-première",
                    text: "Découvrez nos collections avant tout le monde",
                  },
                  {
                    icon: "🎁",
                    title: "Offres exclusives abonnés",
                    text: "Des promotions réservées à notre communauté",
                  },
                  {
                    icon: "🎨",
                    title: "Inspirations & conseils",
                    text: "Idées déco et tendances textiles du moment",
                  },
                ].map((item, index) => (
                  <table
                    key={index}
                    cellPadding="0"
                    cellSpacing="0"
                    border={0}
                    style={{
                      width: "100%",
                      marginBottom: index < 2 ? "16px" : "0",
                    }}
                  >
                    <tr>
                      <td
                        style={{
                          width: "40px",
                          verticalAlign: "top",
                          fontSize: "22px",
                        }}
                      >
                        {item.icon}
                      </td>
                      <td>
                        <p
                          style={{
                            color: "#1a1a1a",
                            fontSize: "14px",
                            fontWeight: "bold",
                            margin: "0 0 2px 0",
                          }}
                        >
                          {item.title}
                        </p>
                        <p
                          style={{
                            color: "#1a1a1a",
                            opacity: 0.6,
                            fontSize: "13px",
                            margin: 0,
                          }}
                        >
                          {item.text}
                        </p>
                      </td>
                    </tr>
                  </table>
                ))}
              </td>
            </tr>
          </table>

          {/* CTA Button */}
          <table
            cellPadding="0"
            cellSpacing="0"
            border={0}
            style={{ width: "100%", marginBottom: "30px" }}
          >
            <tr>
              <td style={{ textAlign: "center" }}>
                <a
                  href={`${process.env.NEXT_PUBLIC_APP_URL}/collections`}
                  style={{
                    display: "inline-block",
                    padding: "16px 40px",
                    background:
                      "linear-gradient(135deg, #b76e79 0%, #d4a89a 100%)",
                    color: "#ffffff",
                    textDecoration: "none",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    boxShadow: "0 4px 12px rgba(183, 110, 121, 0.3)",
                  }}
                >
                  Découvrir nos créations
                </a>
              </td>
            </tr>
          </table>

          {/* Help Section */}
          <table
            cellPadding="0"
            cellSpacing="0"
            border={0}
            style={{
              width: "100%",
              backgroundColor: "#f5f1e8",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <tr>
              <td style={{ textAlign: "center" }}>
                <p
                  style={{
                    color: "#1a1a1a",
                    fontSize: "14px",
                    margin: "0 0 10px 0",
                  }}
                >
                  <strong>Une question ? On est là !</strong>
                </p>
                <p
                  style={{
                    color: "#1a1a1a",
                    opacity: 0.7,
                    fontSize: "14px",
                    margin: 0,
                  }}
                >
                  📧{" "}
                  <a
                    href="mailto:contact@ylang-creations.fr"
                    style={{ color: "#b76e79", textDecoration: "none" }}
                  >
                    contact@ylang-creations.fr
                  </a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </EmailLayout>
  );
}
