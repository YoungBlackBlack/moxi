import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type QuoteResult = {
  price: string | null;
  unitPrice: string | null;
  breakdown: string[];
  requiresCustomQuote: boolean;
  warnings: string[];
  matchedRuleId?: string;
};

@Injectable()
export class QuoteService {
  async calculate(input: {
    categoryId: string;
    quantity: number;
    size?: string;
    craftOptions?: Record<string, unknown>;
  }): Promise<QuoteResult> {
    const category = await prisma.category.findUnique({
      where: { id: input.categoryId },
      include: { priceRules: true }
    });

    if (!category) {
      return {
        price: null,
        unitPrice: null,
        breakdown: [],
        requiresCustomQuote: true,
        warnings: ["未找到品类，需要人工报价"]
      };
    }

    const normalizedSize = input.size?.trim().toLowerCase();
    const matched = category.priceRules.find((rule) => {
      const sizeOk = !normalizedSize || !rule.size || rule.size.trim().toLowerCase() === normalizedSize;
      const minOk = rule.quantityMin == null || input.quantity >= rule.quantityMin;
      const maxOk = rule.quantityMax == null || input.quantity <= rule.quantityMax;
      return sizeOk && minOk && maxOk && rule.unitPrice != null;
    });

    if (!matched?.unitPrice) {
      return {
        price: null,
        unitPrice: null,
        breakdown: [`${category.name} 暂无可自动匹配的报价规则`],
        requiresCustomQuote: true,
        warnings: ["特殊尺寸、特殊工艺或数量未命中报价表，需管理员补价"]
      };
    }

    const unit = new Prisma.Decimal(matched.unitPrice);
    const total = unit.mul(input.quantity);

    return {
      price: total.toFixed(2),
      unitPrice: unit.toFixed(2),
      matchedRuleId: matched.id,
      requiresCustomQuote: false,
      warnings: matched.minQuantity && input.quantity < matched.minQuantity ? [`起订量建议 ${matched.minQuantity}`] : [],
      breakdown: [
        `品类：${category.name}`,
        `规格：${matched.size ?? input.size ?? "默认"}`,
        `数量：${input.quantity}`,
        `单价：${unit.toFixed(2)}`,
        `合计：${total.toFixed(2)}`
      ]
    };
  }
}

export const quoteService = new QuoteService();
