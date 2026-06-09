import { Injectable } from "@nestjs/common";
import { OrderStatus, Prisma } from "@prisma/client";
import { canTransition } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";
import { quoteService } from "@/server/quote.service";
import { validateOrderFile } from "@/server/file-validation.service";

@Injectable()
export class OrderService {
  async create(input: {
    categoryId: string;
    quantity: number;
    size?: string;
    craftOptions?: Record<string, unknown>;
    recipientName: string;
    recipientPhone: string;
    address: string;
    qq?: string;
    customerNote?: string;
    userId?: string;
  }) {
    const quote = await quoteService.calculate(input);
    const orderNo = `MX${Date.now().toString(36).toUpperCase()}`;
    const status: OrderStatus = quote.requiresCustomQuote ? "NEEDS_QUOTE" : "PENDING_PAYMENT";

    return prisma.order.create({
      data: {
        orderNo,
        userId: input.userId,
        categoryId: input.categoryId,
        status,
        recipientName: input.recipientName,
        recipientPhone: input.recipientPhone,
        address: input.address,
        qq: input.qq,
        quantity: input.quantity,
        size: input.size,
        craftOptions: (input.craftOptions ?? {}) as Prisma.InputJsonValue,
        quotedAmount: quote.price ? new Prisma.Decimal(quote.price) : null,
        finalAmount: quote.price ? new Prisma.Decimal(quote.price) : null,
        customerNote: input.customerNote,
        customQuote: quote.requiresCustomQuote
          ? {
              create: {
                reason: quote.warnings.join("；") || "未命中自动报价规则"
              }
            }
          : undefined,
        notifications: {
          create: {
            title: "订单已提交",
            body: quote.requiresCustomQuote ? "该订单需要管理员人工报价。" : "订单已生成，请按线下付款说明付款。"
          }
        }
      },
      include: {
        category: true,
        files: true,
        payments: true,
        shipments: true,
        customQuote: true,
        notifications: true
      }
    });
  }

  async addFile(orderId: string, file: { originalName: string; url: string; size: number; mimeType?: string }) {
    const validation = validateOrderFile(file);
    return prisma.orderFile.create({
      data: {
        orderId,
        originalName: file.originalName,
        url: file.url,
        size: file.size,
        mimeType: file.mimeType,
        validation
      }
    });
  }

  async updateStatus(orderId: string, status: OrderStatus, note?: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new Error("订单不存在");
    }
    if (!canTransition(order.status, status)) {
      throw new Error(`订单状态不能从 ${order.status} 变更为 ${status}`);
    }

    return prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        adminNote: note ?? order.adminNote,
        notifications: {
          create: {
            title: "订单状态已更新",
            body: `订单状态已更新为 ${status}`
          }
        }
      },
      include: { category: true, files: true, payments: true, shipments: true, customQuote: true }
    });
  }

  async setManualQuote(orderId: string, amount: number, note?: string) {
    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: "QUOTED",
        quotedAmount: new Prisma.Decimal(amount),
        finalAmount: new Prisma.Decimal(amount),
        adminNote: note,
        customQuote: {
          upsert: {
            create: {
              reason: "管理员人工报价",
              amount: new Prisma.Decimal(amount),
              note
            },
            update: {
              amount: new Prisma.Decimal(amount),
              note
            }
          }
        },
        notifications: {
          create: {
            title: "管理员已报价",
            body: `订单人工报价为 ¥${amount}`
          }
        }
      },
      include: { category: true, files: true, payments: true, shipments: true, customQuote: true }
    });
  }

  async confirmPayment(orderId: string, amount: number, method: string, note?: string) {
    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        payments: {
          create: {
            amount: new Prisma.Decimal(amount),
            method,
            note
          }
        },
        notifications: {
          create: {
            title: "付款已确认",
            body: `管理员已确认收到 ¥${amount}`
          }
        }
      },
      include: { category: true, files: true, payments: true, shipments: true, customQuote: true }
    });
  }

  async addShipment(orderId: string, carrier: string, trackingNo: string) {
    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: "SHIPPED",
        shipments: {
          create: {
            carrier,
            trackingNo
          }
        },
        notifications: {
          create: {
            title: "订单已发货",
            body: `${carrier} ${trackingNo}`
          }
        }
      },
      include: { category: true, files: true, payments: true, shipments: true, customQuote: true }
    });
  }
}

export const orderService = new OrderService();
