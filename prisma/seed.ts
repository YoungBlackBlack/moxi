import fs from "node:fs";
import path from "node:path";
import { PrismaClient, ProductionMode, AssetKind, Prisma } from "@prisma/client";

const prisma = new PrismaClient();
const root = process.cwd();

type WorkbookSheet = {
  sheet: string;
  csv: string;
  rows: number;
  columns: number;
  nonempty_cells: number;
};

type MediaLibraryItem = {
  kind: string;
  label: string;
  source: string;
  file: string;
  size: number;
  ocr_text?: string;
  ocrText?: string;
};

type SecondaryPage = {
  title: string;
  url: string;
  kind: string;
  dir: string;
  local_assets_count?: number;
};

const categoryDescriptions: Record<string, { mode: ProductionMode; description: string; leadTime?: string }> = {
  "吧唧（uv": {
    mode: "SINGLE",
    description: "单走 UV 印刷吧唧，覆盖文件命名、交稿邮箱、闪底参考、尺寸/数量阶梯报价。",
    leadTime: "打样 5-7 天，大货 7-15 天"
  },
  "吧唧（柯）": {
    mode: "CARPOOL",
    description: "拼车柯印双闪、触感银、烫色吧唧，包含白墨、闪底和冷烫膜色号规则。",
    leadTime: "拼车成车后生产"
  },
  "亚克力制品": {
    mode: "SINGLE",
    description: "单走亚克力色纸、立牌、激光、仿柯和特殊板材报价。",
    leadTime: "7-20 天"
  },
  "普通厚亚克力&贝母麻将": {
    mode: "CARPOOL",
    description: "拼车普通厚亚克力、贝母麻将、干花麻将和流麻等厚板类。",
    leadTime: "10-25 天"
  },
  "durst印亚克力": {
    mode: "SINGLE",
    description: "单走 Durst 印亚克力与 Durst 双闪色纸，支持表印/里印和微浮雕效果。",
    leadTime: "15-20 天"
  },
  "冷烫亚克力": {
    mode: "CARPOOL",
    description: "拼车冷烫、贝壳光亚克力色纸、立牌和云母板工艺。",
    leadTime: "25 天左右"
  },
  "冷烫双闪吧唧（表印）": {
    mode: "CARPOOL",
    description: "拼车 Durst 表印烫色双闪吧唧，覆盖烫单色/双色、触感银和闪底。",
    leadTime: "15-25 天"
  },
  "贝壳光pet透卡": {
    mode: "CARPOOL",
    description: "拼车冷烫浮雕 PET 透卡，覆盖烫色、对裱、CPP 袋和 PET 色纸加购。",
    leadTime: "发车后 10-20 天"
  },
  折扇: {
    mode: "SINGLE",
    description: "单走梅妃折扇，覆盖打样/大货文件名、交稿邮箱、尺寸报价。",
    leadTime: "7 天"
  },
  鼠标垫: {
    mode: "SINGLE",
    description: "单走鼠标垫，覆盖文件命名、出血要求和尺寸报价。",
    leadTime: "7 天"
  }
};

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8")) as T;
}

function readCsv(relativePath: string): string[][] {
  const content = fs.readFileSync(path.join(root, relativePath), "utf8").replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell.length || row.length) {
    row.push(cell.trim());
    rows.push(row);
  }
  return rows;
}

function slugify(input: string) {
  return encodeURIComponent(input).replace(/%/g, "").toLowerCase();
}

function mapAssetKind(kind: string): AssetKind {
  switch (kind) {
    case "main_excel_image":
      return "MAIN_EXCEL_IMAGE";
    case "secondary_page_screenshot":
      return "SECONDARY_PAGE_SCREENSHOT";
    case "doc_scroll_screenshot":
      return "DOC_SCROLL_SCREENSHOT";
    default:
      return "SECONDARY_PAGE_ASSET";
  }
}

function numeric(value: string | undefined) {
  if (!value) return null;
  const cleaned = value.replace(/[^\d.]/g, "");
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return null;
  if (parsed <= 0 || parsed >= 1000000) return null;
  return parsed;
}

async function main() {
  const workbook = readJson<WorkbookSheet[]>("extracted/metadata/workbook_summary.json");
  const media = readJson<MediaLibraryItem[]>("extracted/metadata/media_library.json");
  const secondaryPages = readJson<SecondaryPage[]>("extracted/metadata/secondary_pages.json");

  await prisma.externalReference.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.submissionRule.deleteMany();
  await prisma.priceRule.deleteMany();
  await prisma.category.deleteMany();

  const categorySheets = workbook.filter((sheet) => sheet.sheet !== "汇总表");
  for (const [index, sheet] of categorySheets.entries()) {
    const meta = categoryDescriptions[sheet.sheet] ?? {
      mode: "SINGLE" as ProductionMode,
      description: `${sheet.sheet} 报价和交稿规则`
    };
    const rows = readCsv(sheet.csv);
    const category = await prisma.category.create({
      data: {
        name: sheet.sheet,
        slug: slugify(sheet.sheet),
        mode: meta.mode,
        description: meta.description,
        defaultLeadTime: meta.leadTime,
        sourceCsv: sheet.csv,
        sortOrder: index + 1
      }
    });

    const usefulRows = rows
      .map((row, rowIndex) => ({
        rowIndex,
        values: row.map((value) => value.trim()).filter(Boolean)
      }))
      .filter((row) => row.values.length > 0);

    const submissionRules = usefulRows
      .slice(0, 12)
      .map((row) => ({ row, text: row.values.join(" / ") }))
      .filter(({ text }) => /文件名|邮件名|交稿|邮箱|CMYK|RGB|dpi|DPI|白墨|烫色|出血|售后/.test(text))
      .map(({ row, text }) => ({
        categoryId: category.id,
        title: `第 ${row.rowIndex + 1} 行交稿规则`,
        body: text,
        email: text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0],
        filePattern: text.includes("文件名") || text.includes("邮件名") ? text : null,
        raw: row
      }));
    if (submissionRules.length) {
      await prisma.submissionRule.createMany({ data: submissionRules });
    }

    const priceRows = usefulRows.filter((row) => row.values.some((value) => /\d/.test(value))).slice(0, 80);
    const priceRules = priceRows.map((row) => {
      const [label, ...rest] = row.values;
      const priceCandidate = rest.map(numeric).find((value) => value != null);
      return {
        categoryId: category.id,
        label: label || `第 ${row.rowIndex + 1} 行报价`,
        size: /\d/.test(label) ? label : null,
        unitPrice: priceCandidate ? new Prisma.Decimal(priceCandidate) : null,
        rawRow: row
      };
    });
    if (priceRules.length) {
      await prisma.priceRule.createMany({ data: priceRules });
    }
  }

  if (secondaryPages.length) {
    await prisma.externalReference.createMany({
      data: secondaryPages.map((page) => ({
        title: page.title,
        url: page.url,
        kind: page.kind,
        localDir: path.relative(root, page.dir),
        assetCount: page.local_assets_count ?? 0
      }))
    });
  }

  if (media.length) {
    await prisma.mediaAsset.createMany({
      data: media.map((item) => ({
        kind: mapAssetKind(item.kind),
        label: item.label,
        source: item.source,
        filePath: item.file,
        size: item.size,
        ocrText: item.ocr_text ?? item.ocrText,
        tags: [item.kind]
      }))
    });
  }

  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "moxi-admin-please-change";
  const bcrypt = await import("bcryptjs");
  await prisma.user.upsert({
    where: { phone: "13800000000" },
    update: {},
    create: {
      phone: "13800000000",
      qq: "admin",
      displayName: "默认管理员",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(adminPassword, 10)
    }
  });

  console.log(`Seeded ${categorySheets.length} categories, ${secondaryPages.length} references, ${media.length} assets.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
