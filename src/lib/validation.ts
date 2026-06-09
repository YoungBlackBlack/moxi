import { z } from "zod";

export const quoteRequestSchema = z.object({
  categoryId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  size: z.string().optional(),
  craftOptions: z.record(z.unknown()).default({})
});

export const createOrderSchema = quoteRequestSchema.extend({
  recipientName: z.string().min(1),
  recipientPhone: z.string().min(5),
  address: z.string().min(3),
  qq: z.string().optional(),
  customerNote: z.string().optional()
});

export const confirmFileSchema = z.object({
  originalName: z.string().min(1),
  url: z.string().url(),
  size: z.coerce.number().int().nonnegative(),
  mimeType: z.string().optional()
});

export const adminStatusSchema = z.object({
  status: z.enum([
    "SUBMITTED",
    "NEEDS_QUOTE",
    "QUOTED",
    "PENDING_PAYMENT",
    "PAID",
    "IN_REVIEW",
    "IN_PRODUCTION",
    "SHIPPED",
    "COMPLETED",
    "CANCELLED",
    "AFTER_SALES"
  ]),
  note: z.string().optional()
});
