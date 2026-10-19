import * as React from "react";
import { EmailButton, EmailLayout, emailTheme as t } from "./layout";

// Email de compte avec un lien d'action (confirmation d'inscription,
// réinitialisation du mot de passe, lien de connexion…)

interface AccountActionEmailProps {
  title: string;
  intro: string;
  ctaLabel: string;
  actionUrl: string;
  // Phrase rassurante si l'email n'était pas attendu
  ignoreNote: string;
}

const textStyle = {
  color: t.ink,
  fontSize: "15px",
  lineHeight: "1.7",
  margin: "0 0 24px 0",
};

const noteStyle = {
  color: t.ink3,
  fontSize: "12px",
  lineHeight: "1.6",
  margin: "0 0 12px 0",
};

export function AccountActionEmail({
  title,
  intro,
  ctaLabel,
  actionUrl,
  ignoreNote,
}: AccountActionEmailProps) {
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
            Espace client
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
            {title}
          </h1>
          <p style={textStyle}>{intro}</p>

          <EmailButton href={actionUrl}>{ctaLabel}</EmailButton>

          <p style={noteStyle}>
            Le bouton ne fonctionne pas ? Copiez ce lien dans votre navigateur :
            <br />
            <a href={actionUrl} style={{ color: t.accent, wordBreak: "break-all" }}>
              {actionUrl}
            </a>
          </p>
          <p style={{ ...noteStyle, margin: 0 }}>{ignoreNote}</p>
        </td>
      </tr>
    </EmailLayout>
  );
}
