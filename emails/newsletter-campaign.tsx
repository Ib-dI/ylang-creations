import * as React from "react";
import { EmailLayout, emailTheme as t } from "./layout";

interface NewsletterCampaignEmailProps {
  htmlContent: string;
  unsubscribeUrl: string;
}

export function NewsletterCampaignEmail({
  htmlContent,
  unsubscribeUrl,
}: NewsletterCampaignEmailProps) {
  return (
    <EmailLayout
      footerNote={
        <>
          Vous recevez cet email car vous êtes inscrit(e) à notre newsletter.{" "}
          <a href={unsubscribeUrl} style={{ color: t.accent }}>
            Se désinscrire
          </a>
        </>
      }
    >
      {/* Contenu rédigé depuis l'admin */}
      <tr>
        <td
          style={{
            padding: "24px 40px 36px",
            color: t.ink,
            fontSize: "15px",
            lineHeight: "1.7",
          }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </tr>
    </EmailLayout>
  );
}
