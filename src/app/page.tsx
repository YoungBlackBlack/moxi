import { WorkspaceShell } from "@/components/workspace-shell";
import { assetForCategory, categoryHighlights, pricePreview, ruleBuckets } from "@/lib/content";
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
      take: 80
    })
  ]);
  const selected = categories.find((category) => category.id === params.category) ?? categories[0];
  const selectedAssets = selected ? assetForCategory(selected, assets) : [];
  const rules = selected ? ruleBuckets(selected.submissionRules) : null;

  return (
    <WorkspaceShell
      active="/"
      title="开始下单"
      subtitle="左侧是功能区，右侧完成选品类、看参考图、读规则、填信息和提交订单。"
    >
      <div className="work-grid">
        <section className="panel order-studio">
          <div className="section-head">
            <span className="eyebrow">01 选择品类</span>
            <h2>先选你要做的工艺</h2>
          </div>
          <div className="category-tabs">
            {categories.map((category) => (
              <a className={selected?.id === category.id ? "category-pill active" : "category-pill"} href={`/?category=${category.id}`} key={category.id}>
                <span>{category.name}</span>
                <small>{category.mode === "SINGLE" ? "单走" : "拼车"}</small>
              </a>
            ))}
          </div>

          {selected ? (
            <form className="order-form" action="/api/orders" method="post">
              <input type="hidden" name="categoryId" value={selected.id} />
              <div className="selected-summary">
                <div>
                  <span className="badge">{selected.mode === "SINGLE" ? "单走" : "拼车"}</span>
                  <h3>{selected.name}</h3>
                  <p>{selected.description}</p>
                </div>
                <div className="metric-card">
                  <span>参考交期</span>
                  <strong>{selected.defaultLeadTime ?? "待确认"}</strong>
                </div>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="quantity">数量</label>
                  <input id="quantity" name="quantity" type="number" min="1" defaultValue="50" required />
                </div>
                <div className="field">
                  <label htmlFor="size">尺寸 / 规格</label>
                  <input id="size" name="size" placeholder="例：58mm圆形 / 10*14cm" />
                </div>
                <div className="field">
                  <label htmlFor="recipientName">收货名</label>
                  <input id="recipientName" name="recipientName" required />
                </div>
                <div className="field">
                  <label htmlFor="recipientPhone">电话</label>
                  <input id="recipientPhone" name="recipientPhone" required />
                </div>
                <div className="field">
                  <label htmlFor="qq">QQ 号</label>
                  <input id="qq" name="qq" placeholder="建议填写，便于文件命名核对" />
                </div>
                <div className="field wide">
                  <label htmlFor="address">收货地址</label>
                  <textarea id="address" name="address" required />
                </div>
                <div className="field wide">
                  <label htmlFor="customerNote">工艺 / 闪底 / 色号 / 备注</label>
                  <textarea id="customerNote" name="customerNote" placeholder="例：冷烫银、闪底 03、包边、是否背卡" />
                </div>
              </div>
              <button className="button primary-action" type="submit">提交订单并进入上传</button>
            </form>
          ) : (
            <div className="empty-state">还没有导入品类数据，请先运行 seed。</div>
          )}
        </section>

        <aside className="side-stack">
          <section className="panel">
            <div className="section-head">
              <span className="eyebrow">02 参考图</span>
              <h2>看图确认工艺</h2>
            </div>
            <div className="asset-strip">
              {selectedAssets.map((asset) => (
                <a href={asset.publicUrl ?? asset.filePath} target="_blank" rel="noreferrer" className="asset-thumb" key={asset.id}>
                  {asset.thumbnailUrl || asset.publicUrl ? <img src={asset.thumbnailUrl ?? asset.publicUrl ?? ""} alt={asset.label} /> : <span>无图</span>}
                  <small>{asset.label}</small>
                </a>
              ))}
              {selectedAssets.length === 0 ? <p className="muted">素材图正在导入，导入后会显示在这里。</p> : null}
            </div>
          </section>

          <section className="panel">
            <div className="section-head">
              <span className="eyebrow">03 规则摘要</span>
              <h2>下单前核对</h2>
            </div>
            {selected && rules ? (
              <div className="rule-list">
                {categoryHighlights(selected).map((item) => <p key={item}>{item}</p>)}
                {rules.naming ? <p>文件命名：{rules.naming}</p> : null}
                {rules.email ? <p>交稿要求：{rules.email}</p> : null}
                {rules.color ? <p>颜色/工艺：{rules.color}</p> : null}
                <details>
                  <summary>展开全部规则</summary>
                  {rules.all.map((item) => <p key={item}>{item}</p>)}
                </details>
              </div>
            ) : null}
          </section>

          <section className="panel">
            <div className="section-head">
              <span className="eyebrow">04 报价提示</span>
              <h2>价格说明</h2>
            </div>
            <div className="rule-list">
              {selected ? pricePreview(selected.priceRules).map((item) => <p key={item}>{item}</p>) : null}
              <p>特殊尺寸、特殊材料或未命中规则时，会进入管理员人工报价。</p>
            </div>
          </section>
        </aside>
      </div>
    </WorkspaceShell>
  );
}
