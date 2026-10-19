import * as React from "react";
import { EmailLayout } from "./layout";

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
    </EmailLayout>
  );
}
