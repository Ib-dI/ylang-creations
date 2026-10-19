import { z } from "zod";

// Une variable vide dans .env ("EMAIL_REPLY_TO=") équivaut à une variable absente
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

const emailEnvSchema = z.object({
  BREVO_API_KEY: z.string().min(1),
  EMAIL_FROM: z.email(),
  EMAIL_FROM_NAME: z.string().min(1).default("Ylang Créations"),
  EMAIL_REPLY_TO: optional(z.email()),
  ADMIN_EMAIL: z.email(),
  // Par défaut : sandbox partout sauf en production
  EMAIL_SANDBOX: optional(z.enum(["true", "false"])).transform((value) =>
    value === undefined ? process.env.NODE_ENV !== "production" : value === "true",
  ),
  NEXT_PUBLIC_APP_URL: z.url(),
});

export type EmailEnv = z.infer<typeof emailEnvSchema>;

let cachedEnv: EmailEnv | null = null;

// Validation paresseuse : le build ne doit pas échouer si les variables
// ne sont disponibles qu'à l'exécution.
export function getEmailEnv(): EmailEnv {
  if (cachedEnv) return cachedEnv;

  const result = emailEnvSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(
      `Configuration email invalide :\n${z.prettifyError(result.error)}`,
    );
  }

  cachedEnv = result.data;
  return cachedEnv;
}
