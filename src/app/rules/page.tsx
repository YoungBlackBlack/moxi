import { WorkspaceShell } from "@/components/workspace-shell";
import { ruleBuckets } from "@/lib/content";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RulesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ mode: "asc" }, { sortOrder: "asc" }],
    include: { submissionRules: true, priceRules: { take: 8 } }
  });
  const references = await prisma.externalReference.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <WorkspaceShell active="/rules" title="交稿规则" subtitle="把报价表和 OCR 里的关键文字转成下单前能读懂的检查清单。">
      <div className="rules-grid">
        {categories.map((category) => {
          const buckets = ruleBuckets(category.submissionRules);
          return (
            <section className="panel" key={category.id}>
              <span className="badge">{category.mode === "SINGLE" ? "单走" : "拼车"}</span>
              <h2>{category.name}</h2>
              <div className="rule-list">
                <p>{category.description}</p>
                {buckets.naming ? <p>文件命名：{buckets.naming}</p> : null}
                {buckets.email ? <p>交稿：{buckets.email}</p> : null}
                {buckets.color ? <p>颜色/工艺：{buckets.color}</p> : null}
                {buckets.afterSale ? <p>售后：{buckets.afterSale}</p> : null}
                <details>
                  <summary>查看 OCR/表格原文</summary>
                  {buckets.all.map((item) => <p key={item}>{item}</p>)}
                </details>
              </div>
            </section>
          );
        })}
      </div>
      <section className="panel">
        <h2>二级文档</h2>
        <div className="reference-list">
          {references.map((ref) => (
            <a href={ref.url} target="_blank" rel="noreferrer" key={ref.id}>
              <strong>{ref.title}</strong>
              <small>{ref.kind} · 图片 {ref.assetCount} 个</small>
            </a>
          ))}
        </div>
      </section>
    </WorkspaceShell>
  );
}
