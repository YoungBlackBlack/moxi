"use client";

import { useMemo, useState } from "react";

type RuleBucket = {
  naming?: string;
  email?: string;
  color?: string;
  afterSale?: string;
  all: string[];
};

export type WorkbenchCategory = {
  id: string;
  name: string;
  mode: "SINGLE" | "CARPOOL";
  description: string;
  defaultLeadTime: string | null;
  highlights: string[];
  rules: RuleBucket;
  pricePreview: string[];
};

export type WorkbenchAsset = {
  id: string;
  label: string;
  source: string;
  filePath: string;
  publicUrl: string | null;
  thumbnailUrl: string | null;
  ocrText: string | null;
  tags: string[];
};

function normalize(input: string) {
  return input
    .toLowerCase()
    .replace(/[（）()&_\-./\\\s]/g, "")
    .replace(/吧哪|吧几|吧唧/g, "吧唧")
    .replace(/汤色|沟色|法色|烫色/g, "烫色")
    .replace(/白吐|白署|白团|白垩|白时/g, "白墨");
}

function categoryKeywords(category: WorkbenchCategory) {
  const text = normalize(`${category.name} ${category.description} ${category.rules.all.join(" ")}`);
  const keywords = new Set<string>();
  const candidates = [
    "吧唧",
    "亚克力",
    "durst",
    "折扇",
    "鼠标垫",
    "冷烫",
    "双闪",
    "白墨",
    "闪底",
    "流沙",
    "麻将",
    "贝母",
    "贝壳光",
    "pet",
    "透卡",
    "立牌",
    "色纸",
    "镭射",
    "烫色"
  ];
  for (const keyword of candidates) {
    if (text.includes(normalize(keyword))) keywords.add(keyword);
  }
  for (const part of category.name.split(/[、\s（）()&]+/)) {
    if (part.trim().length >= 2) keywords.add(part.trim());
  }
  return [...keywords];
}

function scoreAsset(category: WorkbenchCategory, asset: WorkbenchAsset) {
  const haystack = normalize(`${asset.label} ${asset.source} ${asset.filePath} ${asset.ocrText ?? ""} ${asset.tags.join(" ")}`);
  let score = 0;
  for (const keyword of categoryKeywords(category)) {
    if (haystack.includes(normalize(keyword))) score += keyword.length > 2 ? 3 : 2;
  }
  if (/screenshot|scroll/.test(asset.filePath)) score += 1;
  if (asset.ocrText && asset.ocrText.length > 80) score += 1;
  return score;
}

function assetsForCategory(category: WorkbenchCategory, assets: WorkbenchAsset[]) {
  const ranked = assets
    .map((asset, index) => ({ asset, index, score: scoreAsset(category, asset) }))
    .filter((item) => item.asset.publicUrl || item.asset.thumbnailUrl)
    .sort((a, b) => b.score - a.score || a.index - b.index);
  const strong = ranked.filter((item) => item.score > 0);
  return (strong.length ? strong : ranked).slice(0, 6).map((item) => item.asset);
}

function shortRule(text?: string) {
  if (!text) return null;
  return text.length > 72 ? `${text.slice(0, 72)}...` : text;
}

export function OrderWorkbench({
  categories,
  assets,
  initialCategoryId
}: {
  categories: WorkbenchCategory[];
  assets: WorkbenchAsset[];
  initialCategoryId?: string;
}) {
  const initialIndex = Math.max(0, categories.findIndex((category) => category.id === initialCategoryId));
  const [selectedId, setSelectedId] = useState(categories[initialIndex]?.id);
  const selected = categories.find((category) => category.id === selectedId) ?? categories[0];
  const selectedAssets = useMemo(() => (selected ? assetsForCategory(selected, assets) : []), [selected, assets]);
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);
  const activeAsset = selectedAssets.find((asset) => asset.id === activeAssetId) ?? selectedAssets[0];

  function chooseCategory(id: string) {
    setSelectedId(id);
    setActiveAssetId(null);
    const url = new URL(window.location.href);
    url.searchParams.set("category", id);
    window.history.replaceState(null, "", url);
  }

  if (!selected) {
    return <div className="empty-state">还没有导入品类数据，请先运行 seed。</div>;
  }

  const quickRules = [
    shortRule(selected.rules.naming) ?? "文件名建议包含：制品名称、QQ、尺寸、数量。",
    shortRule(selected.rules.email) ?? "交稿时请同时写清地址、备注和特殊工艺要求。",
    shortRule(selected.rules.color) ?? "印刷文件请优先使用 CMYK，并按工艺要求准备白墨/烫色层。",
    shortRule(selected.rules.afterSale) ?? "文件不规范、色差和工艺容差按下单须知与售后条款处理。"
  ];

  return (
    <div className="work-grid order-workbench">
      <section className="panel order-studio">
        <div className="section-head compact-head">
          <span className="eyebrow">01 选择品类</span>
          <h2>先选你要做的工艺</h2>
        </div>
        <div className="category-tabs" role="tablist" aria-label="选择下单品类">
          {categories.map((category) => (
            <button
              className={selected.id === category.id ? "category-pill active" : "category-pill"}
              key={category.id}
              type="button"
              role="tab"
              aria-selected={selected.id === category.id}
              onClick={() => chooseCategory(category.id)}
            >
              <span>{category.name}</span>
              <small>{category.mode === "SINGLE" ? "单走" : "拼车"}</small>
            </button>
          ))}
        </div>

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
              <input id="qq" name="qq" placeholder="便于文件命名核对" />
            </div>
            <div className="field">
              <label htmlFor="customerNote">工艺备注</label>
              <input id="customerNote" name="customerNote" placeholder="冷烫银 / 闪底 03 / 包边" />
            </div>
            <div className="field wide">
              <label htmlFor="address">收货地址</label>
              <textarea id="address" name="address" required />
            </div>
          </div>
          <button className="button primary-action" type="submit">
            提交订单并进入上传
          </button>
        </form>
      </section>

      <aside className="side-stack order-assistant" aria-live="polite">
        <section className="panel reference-panel">
          <div className="section-head compact-head">
            <span className="eyebrow">02 参考图</span>
            <h2>{selected.name} 的工艺参考</h2>
          </div>
          {activeAsset ? (
            <>
              <a className="feature-asset" href={activeAsset.publicUrl ?? activeAsset.filePath} target="_blank" rel="noreferrer">
                <img src={activeAsset.thumbnailUrl ?? activeAsset.publicUrl ?? ""} alt={activeAsset.label} />
                <span>{activeAsset.label}</span>
              </a>
              <div className="asset-rail" aria-label="切换参考图">
                {selectedAssets.map((asset) => (
                  <button
                    className={asset.id === activeAsset.id ? "asset-chip active" : "asset-chip"}
                    key={asset.id}
                    type="button"
                    onClick={() => setActiveAssetId(asset.id)}
                  >
                    <img src={asset.thumbnailUrl ?? asset.publicUrl ?? ""} alt="" />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="muted">素材图正在导入，导入后会显示在这里。</p>
          )}
        </section>

        <section className="panel guidance-panel">
          <div className="section-head compact-head">
            <span className="eyebrow">03 必读规则</span>
            <h2>提交前核对这 4 件事</h2>
          </div>
          <ol className="check-list">
            {quickRules.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <details>
            <summary>展开全部规则</summary>
            <div className="rule-list">
              {selected.highlights.map((item) => (
                <p key={item}>{item}</p>
              ))}
              {selected.rules.all.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </details>
        </section>

        <section className="panel price-panel">
          <div className="section-head compact-head">
            <span className="eyebrow">04 价格</span>
            <h2>报价提示</h2>
          </div>
          <div className="price-preview">
            {selected.pricePreview.slice(0, 3).map((item) => (
              <span key={item}>{item}</span>
            ))}
            <span>特殊尺寸或未命中规则时进入人工报价。</span>
          </div>
        </section>
      </aside>
    </div>
  );
}
