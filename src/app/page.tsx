import { WorkspaceShell } from "@/components/workspace-shell";
import { OrderWorkbench, WorkbenchAsset, WorkbenchCategory } from "@/components/order-workbench";
import { categoryHighlights, pricePreview, ruleBuckets } from "@/lib/content";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const [categories, assets] = await Promise.all([
    prisma.category.findMany({
      where: { enabled: true },
      orderBy: [{ mode: "asc" }, { sortOrder: "asc" }],
      include: { priceRules: { take: 20 }, submissionRules: { take: 8 } }
    }),
    prisma.mediaAsset.findMany({
      where: { publicUrl: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 120
    })
  ]);
  const workbenchCategories: WorkbenchCategory[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
    mode: category.mode,
    description: category.description,
    defaultLeadTime: category.defaultLeadTime,
    highlights: categoryHighlights(category),
    rules: ruleBuckets(category.submissionRules),
    pricePreview: pricePreview(category.priceRules)
  }));
  const workbenchAssets: WorkbenchAsset[] = assets.map((asset) => ({
    id: asset.id,
    label: asset.label,
    source: asset.source,
    filePath: asset.filePath,
    publicUrl: asset.publicUrl,
    thumbnailUrl: asset.thumbnailUrl,
    ocrText: asset.ocrText,
    tags: asset.tags
  }));

  return (
    <WorkspaceShell
      active="/"
      title="开始下单"
      subtitle="左侧是功能区，右侧完成选品类、看参考图、读规则、填信息和提交订单。"
    >
      <OrderWorkbench categories={workbenchCategories} assets={workbenchAssets} initialCategoryId={params.category} />
    </WorkspaceShell>
  );
}
