import { z } from "zod";

// ============================================
// SCHÉMAS DE VALIDATION ZOD v4 - SÉCURITÉ API
// ============================================

// --- Utilitaires communs ---
const sanitizeString = (str: string) => str.trim().replace(/<[^>]*>/g, ""); // Supprime les balises HTML basiques

// --- Schéma Produit ---
export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .max(200, "Le nom ne doit pas dépasser 200 caractères")
    .transform(sanitizeString),
  description: z
    .string()
    .max(5000, "La description ne doit pas dépasser 5000 caractères")
    .optional()
    .nullable()
    .transform((val) => (val ? sanitizeString(val) : val)),
  price: z
    .number()
    .positive("Le prix doit être positif")
    .max(99999, "Le prix ne doit pas dépasser 99999€"),
  compareAtPrice: z
    .number()
    .positive("Le prix comparatif doit être positif")
    .max(99999, "Le prix comparatif ne doit pas dépasser 99999€")
    .optional()
    .nullable(),
  category: z
    .string()
    .min(1, "La catégorie est requise")
    .max(100, "La catégorie ne doit pas dépasser 100 caractères")
    .transform(sanitizeString),
  subcategory: z
    .string()
    .max(100, "La sous-catégorie ne doit pas dépasser 100 caractères")
    .optional()
    .nullable()
    .transform((val) => (val ? sanitizeString(val) : val)),
  images: z.array(z.string()).optional().nullable(),
  stock: z
    .number()
    .int("Le stock doit être un entier")
    .min(0, "Le stock ne peut pas être négatif")
    .max(99999, "Le stock ne doit pas dépasser 99999")
    .optional(),
  sku: z
    .string()
    .max(50, "Le SKU ne doit pas dépasser 50 caractères")
    .optional()
    .nullable()
    .transform((val) => (val ? sanitizeString(val) : val)),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  tags: z
    .array(z.string().max(50))
    .max(20, "Maximum 20 tags")
    .optional()
    .nullable(),
  options: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const updateProductSchema = createProductSchema.partial();

// --- Schéma Commande ---
const orderStatusValues = [
  "pending",
  "paid",
  "in_production",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const updateOrderSchema = z.object({
  status: z
    .enum(orderStatusValues, {
      message: "Statut de commande invalide",
    })
    .optional(),
  trackingNumber: z
    .string()
    .max(100, "Le numéro de suivi ne doit pas dépasser 100 caractères")
    .optional()
    .nullable()
    .transform((val) => (val ? sanitizeString(val) : val)),
  notes: z
    .string()
    .max(1000, "Les notes ne doivent pas dépasser 1000 caractères")
    .optional()
    .nullable()
    .transform((val) => (val ? sanitizeString(val) : val)),
});

// --- Schéma Paramètres ---
export const settingsSchema = z
  .object({
    storeName: z
      .string()
      .max(200, "Le nom du magasin ne doit pas dépasser 200 caractères")
      .transform(sanitizeString)
      .optional()
      .nullable(),
    storeDescription: z
      .string()
      .max(2000, "La description ne doit pas dépasser 2000 caractères")
      .optional()
      .nullable()
      .transform((val) => (val ? sanitizeString(val) : val)),
    contactEmail: z
      .string()
      .email("Email de contact invalide")
      .or(z.literal(""))
      .optional()
      .nullable(),
    contactPhone: z
      .string()
      .max(50, "Le téléphone ne doit pas dépasser 50 caractères")
      .optional()
      .nullable(),
    shippingEmail: z
      .string()
      .email("Email d'expédition invalide")
      .or(z.literal(""))
      .optional()
      .nullable(),
    adminEmail: z
      .string()
      .email("Email admin invalide")
      .or(z.literal(""))
      .optional()
      .nullable(),
    emailTemplates: z
      .object({
        orderConfirmation: z.boolean().optional().nullable(),
        shippingNotification: z.boolean().optional().nullable(),
        adminNotification: z.boolean().optional().nullable(),
      })
      .optional()
      .nullable(),
    currency: z.string().optional().default("eur"),
    shippingFee: z
      .union([z.string(), z.number()])
      .transform((val) => String(val))
      .optional()
      .nullable(),
    freeShippingThreshold: z
      .union([z.string(), z.number()])
      .transform((val) => String(val))
      .optional()
      .nullable(),
    notifications: z
      .object({
        newOrder: z.boolean().optional().nullable(),
        lowStock: z.boolean().optional().nullable(),
        newCustomer: z.boolean().optional().nullable(),
        dailySummary: z.boolean().optional().nullable(),
      })
      .optional()
      .nullable(),
    heroSlides: z
      .array(
        z.object({
          id: z.string().optional().nullable(),
          image: z.string().optional().nullable(),
          title: z.string().max(500).optional().nullable(),
          subtitle: z.string().max(1000).optional().nullable(),
          link: z.string().max(500).optional().nullable(),
          cta: z.string().max(100).optional().nullable(),
          buttonText: z.string().optional().nullable(),
          buttonLink: z.string().optional().nullable(),
        }),
      )
      .optional()
      .nullable(),
    craftsmanshipImage: z.string().optional().nullable(),
    aboutImage: z.string().optional().nullable(),
    testimonials: z
      .array(
        z.object({
          id: z.string().optional().nullable(),
          name: z.string().max(200).optional().nullable(),
          text: z.string().max(2000).optional().nullable(),
          image: z.string().optional().nullable(),
          rating: z.union([z.number(), z.string()]).optional().nullable(),
          location: z.string().max(200).optional().nullable(),
          product: z.string().max(500).optional().nullable(),
          date: z.string().optional().nullable(),
        }),
      )
      .optional()
      .nullable(),
  })
  .passthrough();

// --- Schéma Checkout (panier) ---
export const checkoutItemSchema = z.object({
  productId: z.string().min(1, "ID produit requis"),
  name: z.string().min(1).max(200),
  price: z.number().positive().max(99999),
  quantity: z.number().int().positive().max(100, "Quantité maximum: 100"),
  image: z.string().optional(),
});

export const checkoutSchema = z.object({
  items: z
    .array(checkoutItemSchema)
    .min(1, "Le panier ne peut pas être vide")
    .max(50, "Maximum 50 articles par commande"),
});

// --- Types exportés ---
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;

// --- Fonction utilitaire de validation ---
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: z.ZodError<T> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

// --- Fonction pour formater les erreurs Zod ---
export function formatZodErrors(error: z.ZodError<unknown>): string {
  return error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join(", ");
}
