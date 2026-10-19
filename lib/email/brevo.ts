import { getEmailEnv } from "./env";

// ============================================
// CLIENT BREVO (API transactionnelle)
// https://developers.brevo.com/reference/sendtransacemail
// ============================================

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export interface EmailRecipient {
  email: string;
  name?: string;
}

export type SendEmailResult =
  | { success: true; messageIds: string[] }
  | { success: false; error: string };

interface BrevoSuccessResponse {
  messageId?: string;
  messageIds?: string[];
}

interface BrevoErrorResponse {
  code?: string;
  message?: string;
}

async function postToBrevo(
  payload: Record<string, unknown>,
  logLabel: string,
): Promise<SendEmailResult> {
  try {
    const env = getEmailEnv();

    const body = {
      sender: { email: env.EMAIL_FROM, name: env.EMAIL_FROM_NAME },
      ...(env.EMAIL_REPLY_TO && { replyTo: { email: env.EMAIL_REPLY_TO } }),
      ...payload,
      // En sandbox, Brevo valide la requête sans délivrer l'email
      ...(env.EMAIL_SANDBOX && { headers: { "X-Sib-Sandbox": "drop" } }),
    };

    if (env.EMAIL_SANDBOX) {
      console.log(`🧪 [Email sandbox] ${logLabel}`);
    }

    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": env.BREVO_API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as BrevoErrorResponse;
      const error = `Brevo ${response.status} ${data.code ?? ""} ${data.message ?? ""}`.trim();
      console.error(`❌ Erreur envoi email (${logLabel}):`, error);
      return { success: false, error };
    }

    const data = (await response.json().catch(() => ({}))) as BrevoSuccessResponse;
    const messageIds = data.messageIds ?? (data.messageId ? [data.messageId] : []);
    console.log(`✅ Email envoyé (${logLabel})`);
    return { success: true, messageIds };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ Exception envoi email (${logLabel}):`, message);
    return { success: false, error: message };
  }
}

// Envoi d'un même email à un ou plusieurs destinataires
export function sendEmail(params: {
  to: EmailRecipient[];
  subject: string;
  html: string;
  tags?: string[];
}): Promise<SendEmailResult> {
  return postToBrevo(
    {
      to: params.to,
      subject: params.subject,
      htmlContent: params.html,
      tags: params.tags,
    },
    `${params.subject} → ${params.to.map((r) => r.email).join(", ")}`,
  );
}

// Envoi groupé : un seul appel API, un contenu HTML par destinataire
// (ex : lien de désinscription personnel). Max 2000 destinataires par appel.
export function sendEmailBatch(params: {
  subject: string;
  versions: Array<{ to: EmailRecipient; html: string }>;
  tags?: string[];
}): Promise<SendEmailResult> {
  const [first] = params.versions;
  if (!first) return Promise.resolve({ success: true, messageIds: [] });

  return postToBrevo(
    {
      subject: params.subject,
      // Brevo exige un htmlContent global pour autoriser un contenu par version
      htmlContent: first.html,
      messageVersions: params.versions.map((version) => ({
        to: [version.to],
        htmlContent: version.html,
      })),
      tags: params.tags,
    },
    `${params.subject} → ${params.versions.length} destinataires`,
  );
}
