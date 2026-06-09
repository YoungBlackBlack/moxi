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

export const authSchema = z.object({
  phone: z.string().min(5),
  password: z.string().min(6),
  displayName: z.string().optional(),
  qq: z.string().optional()
});

export const uploadFileSchema = z.object({
  originalName: z.string().min(1),
  url: z.string().min(1),
  size: z.coerce.number().int().nonnegative(),
  mimeType: z.string().optional()
});

export const manualQuoteSchema = z.object({
  amount: z.coerce.number().positive(),
  note: z.string().optional()
});

export const paymentSchema = z.object({
  amount: z.coerce.number().positive(),
  method: z.string().default("offline"),
  note: z.string().optional()
});

export const shipmentSchema = z.object({
  carrier: z.string().min(1),
  trackingNo: z.string().min(1)
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
