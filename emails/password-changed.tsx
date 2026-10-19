import * as React from "react";
import { EmailButton, EmailLayout } from "./layout";

interface PasswordChangedEmailProps {
  forgotPasswordUrl: string;
  contactEmail: string;
}

const textStyle = {
  color: "#1a1a1a",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 20px 0",
  opacity: 0.8,
};

// Notification de sécurité envoyée après chaque changement de mot de passe
export function PasswordChangedEmail({
  forgotPasswordUrl,
  contactEmail,
}: PasswordChangedEmailProps) {
  const changedAt = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  }).format(new Date());

  return (
    <EmailLayout>
      <tr>
        <td style={{ padding: "40px 30px", backgroundColor: "#faf9f6" }}>
          <h2
            style={{
              color: "#1a1a1a",
              fontSize: "24px",
              fontWeight: "bold",
              margin: "0 0 16px 0",
            }}
          >
            Votre mot de passe a été modifié
          </h2>
          <p style={textStyle}>
            Le mot de passe de votre compte Ylang Créations a été modifié le{" "}
            {changedAt}.
          </p>
          <p style={textStyle}>
            Si vous êtes à l&apos;origine de ce changement, vous n&apos;avez
            rien à faire.
          </p>
          <p style={{ ...textStyle, fontWeight: "bold", opacity: 1 }}>
            Ce n&apos;était pas vous ? Réinitialisez votre mot de passe
            immédiatement et contactez-nous.
          </p>

          <EmailButton href={forgotPasswordUrl}>
            Réinitialiser mon mot de passe
          </EmailButton>

          <p style={{ ...textStyle, fontSize: "14px", margin: 0 }}>
            📧{" "}
            <a
              href={`mailto:${contactEmail}`}
              style={{ color: "#b76e79", textDecoration: "none" }}
            >
              {contactEmail}
            </a>
          </p>
        </td>
      </tr>
    </EmailLayout>
  );
}
