import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(8, "Please enter a valid WhatsApp number").max(20),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Full name is required").max(100),
  customerPhone: z.string().min(8, "WhatsApp number is required").max(20),
  customerEmail: z.string().email("Valid email is required").optional().or(z.literal("")),
  type: z.enum(["DINE_IN", "TAKEAWAY", "DELIVERY"]),
  tableNumber: z.string().optional(),
  notes: z.string().max(500).optional(),
  paymentMethod: z.enum(["QRIS", "BANK_TRANSFER", "CASH"]),
  bank: z.string().optional(),
  voucherCode: z.string().optional(),
  useLoyalty: z.boolean().optional(),
});

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  size: z.enum(["SMALL", "MEDIUM", "LARGE"]).default("MEDIUM"),
  temperature: z.enum(["HOT", "ICED"]).default("HOT"),
  sugarLevel: z.number().int().min(0).max(200).default(100),
  iceLevel: z.number().int().min(0).max(200).default(100),
  extraShot: z.boolean().default(false),
  extraMilk: z.boolean().default(false),
  addons: z.array(z.string()).default([]),
  note: z.string().max(200).optional(),
});

export const cartSchema = z.object({ items: z.array(cartItemSchema).min(1, "Your cart is empty") });

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(5),
  price: z.number().positive(),
  categoryId: z.string().min(1),
  sku: z.string().min(2),
  barcode: z.string().optional(),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  preparationTime: z.number().int().positive().default(5),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(1000),
});

export const voucherSchema = z.object({
  code: z.string().min(3).max(20),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().positive(),
  minOrder: z.number().min(0).default(0),
  usageLimit: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(10).max(2000),
});
