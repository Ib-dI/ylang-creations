import * as React from "react";
import { EmailButton, EmailLayout } from "./layout";

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
  color: "#1a1a1a",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 20px 0",
  opacity: 0.8,
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
        <td style={{ padding: "40px 30px", backgroundColor: "#faf9f6" }}>
          <h2
            style={{
              color: "#1a1a1a",
              fontSize: "24px",
              fontWeight: "bold",
              margin: "0 0 16px 0",
            }}
          >
            {title}
          </h2>
          <p style={textStyle}>{intro}</p>

          <EmailButton href={actionUrl}>{ctaLabel}</EmailButton>

          <p style={{ ...textStyle, fontSize: "13px", opacity: 0.6 }}>
            Le bouton ne fonctionne pas ? Copiez ce lien dans votre navigateur :
            <br />
            <a
              href={actionUrl}
              style={{ color: "#b76e79", wordBreak: "break-all" }}
            >
              {actionUrl}
            </a>
          </p>
          <p style={{ ...textStyle, fontSize: "13px", opacity: 0.6, margin: 0 }}>
            {ignoreNote}
          </p>
        </td>
      </tr>
    </EmailLayout>
  );
}
