import { OrderStatus } from "@prisma/client";

export const orderStatusLabels: Record<OrderStatus, string> = {
  DRAFT: "草稿",
  SUBMITTED: "已提交",
  NEEDS_QUOTE: "待人工报价",
  QUOTED: "已报价",
  PENDING_PAYMENT: "待线下付款",
  PAID: "已付款",
  IN_REVIEW: "审核中",
  IN_PRODUCTION: "生产中",
  SHIPPED: "已发货",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
  AFTER_SALES: "售后中"
};

export const allowedOrderTransitions: Record<OrderStatus, OrderStatus[]> = {
  DRAFT: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["NEEDS_QUOTE", "PENDING_PAYMENT", "IN_REVIEW", "CANCELLED"],
  NEEDS_QUOTE: ["QUOTED", "CANCELLED"],
  QUOTED: ["PENDING_PAYMENT", "CANCELLED"],
  PENDING_PAYMENT: ["PAID", "CANCELLED"],
  PAID: ["IN_REVIEW", "IN_PRODUCTION", "CANCELLED"],
  IN_REVIEW: ["IN_PRODUCTION", "CANCELLED"],
  IN_PRODUCTION: ["SHIPPED", "AFTER_SALES"],
  SHIPPED: ["COMPLETED", "AFTER_SALES"],
  COMPLETED: ["AFTER_SALES"],
  CANCELLED: [],
  AFTER_SALES: ["COMPLETED"]
};

export function canTransition(from: OrderStatus, to: OrderStatus) {
  return allowedOrderTransitions[from].includes(to);
}
