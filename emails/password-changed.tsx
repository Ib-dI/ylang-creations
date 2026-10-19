import * as React from "react";
import { EmailButton, EmailLayout, emailTheme as t } from "./layout";

interface PasswordChangedEmailProps {
  forgotPasswordUrl: string;
  contactEmail: string;
}

const textStyle = {
  color: t.ink,
  fontSize: "15px",
  lineHeight: "1.7",
  margin: "0 0 16px 0",
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
        <td style={{ padding: "24px 40px 36px", textAlign: "center" }}>
          <p
            style={{
              color: t.accent,
              fontSize: "11px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              margin: "0 0 12px 0",
            }}
          >
            Sécurité du compte
          </p>
          <h1
            style={{
              fontFamily: t.fontDisplay,
              color: t.ink,
              fontSize: "32px",
              fontWeight: 400,
              lineHeight: "1.15",
              letterSpacing: "-0.01em",
              margin: "0 0 20px 0",
            }}
          >
            Votre mot de passe a été modifié
          </h1>
          <p style={textStyle}>
            Le mot de passe de votre compte Ylang Créations a été modifié le{" "}
            {changedAt}.
          </p>
          <p style={textStyle}>
            Si vous êtes à l&apos;origine de ce changement, vous n&apos;avez
            rien à faire.
          </p>
          <p style={{ ...textStyle, fontWeight: 500, margin: "0 0 24px 0" }}>
            Ce n&apos;était pas vous ? Réinitialisez votre mot de passe
            immédiatement et contactez-nous.
          </p>

          <EmailButton href={forgotPasswordUrl}>
            Réinitialiser mon mot de passe
          </EmailButton>

          <p style={{ color: t.ink3, fontSize: "12px", margin: 0 }}>
            <a
              href={`mailto:${contactEmail}`}
              style={{ color: t.accent, textDecoration: "none" }}
            >
              {contactEmail}
            </a>
          </p>
        </td>
      </tr>
    </EmailLayout>
  );
}
