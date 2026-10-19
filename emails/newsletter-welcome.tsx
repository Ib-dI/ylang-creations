import * as React from "react";
import {
  APP_URL,
  EmailButton,
  EmailHeading,
  EmailLayout,
  emailTheme as t,
} from "./layout";

interface NewsletterWelcomeEmailProps {
  unsubscribeUrl: string;
}

const PERKS = [
  {
    title: "Nouvelles créations en avant-première",
    text: "Découvrez nos collections avant tout le monde",
  },
  {
    title: "Offres réservées aux abonnés",
    text: "Des attentions pensées pour notre communauté",
  },
  {
    title: "Inspirations & conseils",
    text: "Idées déco et tendances textiles du moment",
  },
];

export function NewsletterWelcomeEmail({
  unsubscribeUrl,
}: NewsletterWelcomeEmailProps) {
  return (
    <EmailLayout
      footerNote={
        <>
          Vous recevez cet email car vous vous êtes inscrit(e) à notre
          newsletter.{" "}
          <a href={unsubscribeUrl} style={{ color: t.accent }}>
            Se désinscrire
          </a>
        </>
      }
    >
      <tr>
        <td style={{ padding: "24px 40px 36px", textAlign: "center" }}>
          <EmailHeading overline="Newsletter">
            Bienvenue dans notre univers
          </EmailHeading>
          <p
            style={{
              color: t.ink,
              fontSize: "15px",
              lineHeight: "1.7",
              margin: "0 0 28px 0",
            }}
          >
            Merci de rejoindre la communauté Ylang Créations. Vous serez
            désormais parmi les premiers à découvrir nos nouvelles collections,
            nos inspirations et nos offres.
          </p>

          <table
            cellPadding="0"
            cellSpacing="0"
            border={0}
            role="presentation"
            style={{ width: "100%", margin: "0 0 28px 0" }}
          >
            <tbody>
              {PERKS.map((perk) => (
                <tr key={perk.title}>
                  <td
                    style={{
                      padding: "16px 0",
                      borderTop: `1px solid ${t.rule}`,
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: t.fontDisplay,
                        color: t.ink,
                        fontSize: "19px",
                        margin: "0 0 4px 0",
                      }}
                    >
                      {perk.title}
                    </p>
                    <p style={{ color: t.ink3, fontSize: "13px", margin: 0 }}>
                      {perk.text}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <EmailButton href={`${APP_URL}/collections`}>
            Découvrir nos créations
          </EmailButton>

          <p style={{ color: t.ink3, fontSize: "12px", lineHeight: "1.6", margin: 0 }}>
            Une question ? Répondez simplement à cet email ou passez par notre{" "}
            <a href={`${APP_URL}/contact`} style={{ color: t.accent }}>
              page contact
            </a>
            .
          </p>
        </td>
      </tr>
    </EmailLayout>
  );
}
