import { Category, MediaAsset, PriceRule, SubmissionRule } from "@prisma/client";

export function summarizeRule(text: string) {
  return text.replace(/\s+/g, " ").replace(/\/\s*/g, " / ").trim();
}

export function categoryHighlights(category: Category) {
  const highlights = [
    category.mode === "SINGLE" ? "单走生产，适合独立规格订单" : "拼车生产，适合跟车排期",
    category.defaultLeadTime ? `参考交期：${category.defaultLeadTime}` : "交期以管理员确认排期为准",
    category.description
  ];
  return highlights;
}

export function pricePreview(rules: PriceRule[]) {
  return rules
    .filter((rule) => rule.unitPrice)
    .slice(0, 5)
    .map((rule) => `${rule.label}${rule.unitPrice ? ` ¥${rule.unitPrice}` : ""}`);
}

export function ruleBuckets(rules: SubmissionRule[]) {
  const all = rules.map((rule) => summarizeRule(rule.body)).filter(Boolean);
  return {
    naming: all.find((item) => /文件名|邮件名/.test(item)),
    email: all.find((item) => /邮箱|交稿/.test(item)),
    color: all.find((item) => /CMYK|RGB|白墨|烫色|闪/.test(item)),
    afterSale: all.find((item) => /售后|返工|赔付/.test(item)),
    all
  };
}

export function assetForCategory(category: Category, assets: MediaAsset[]) {
  const name = category.name.replace(/[（）()&]/g, "");
  const matched = assets.filter((asset) => {
    const haystack = `${asset.label} ${asset.source} ${asset.ocrText ?? ""}`;
    return name.split(/[、\s]/).some((part) => part && haystack.includes(part));
  });
  return (matched.length ? matched : assets).slice(0, 6);
}
