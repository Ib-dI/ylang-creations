import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// Customer table for Stripe integration
export const customer = pgTable("customer", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  email: text("email").notNull(),
  name: text("name"),
  stripeCustomerId: text("stripe_customer_id").unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Orders table
export const order = pgTable("order", {
  id: text("id").primaryKey(),
  customerId: text("customer_id")
    .notNull()
    .references(() => customer.id),
  stripeSessionId: text("stripe_session_id").unique(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  status: text("status").notNull().default("pending"), // pending, paid, shipped, delivered, cancelled
  totalAmount: text("total_amount").notNull(),
  currency: text("currency").notNull().default("eur"),
  shippingAddress: text("shipping_address"), // JSON string
  items: text("items").notNull(), // JSON string of cart items
  trackingNumber: text("tracking_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Products table for inventory
export const product = pgTable("product", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  price: text("price").notNull(), // Stored as string for precision
  compareAtPrice: text("compare_at_price"), // Original price for discounts
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  images: text("images"), // JSON array of image URLs
  stock: text("stock").notNull().default("0"),
  sku: text("sku").unique(),
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  tags: text("tags"), // JSON array of tags
  options: text("options"), // JSON object for product options (colors, sizes, etc.)
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Settings table
export const settings = pgTable("settings", {
  id: text("id").primaryKey(),
  storeName: text("store_name").default("Ylang Créations"),
  storeDescription: text("store_description"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  shippingEmail: text("shipping_email"),
  adminEmail: text("admin_email"),
  emailTemplates: text("email_templates"), // JSON string
  currency: text("currency").default("eur"),
  shippingFee: text("shipping_fee").default("9.90"),
  freeShippingThreshold: text("free_shipping_threshold").default("150"),
  notifications: text("notifications"), // JSON string
  // Media settings
  heroSlides: text("hero_slides"), // JSON string
  craftsmanshipImage: text("craftsmanship_image"),
  aboutImage: text("about_image"),
  testimonials: text("testimonials"), // JSON string
  updatedAt: timestamp("updated_at").notNull(),
});
