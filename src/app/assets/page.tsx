import { WorkspaceShell } from "@/components/workspace-shell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AssetsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; kind?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim();
  const assets = await prisma.mediaAsset.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { label: { contains: q, mode: "insensitive" } },
              { source: { contains: q, mode: "insensitive" } },
              { ocrText: { contains: q, mode: "insensitive" } }
            ]
          }
        : {}),
      ...(params.kind ? { kind: params.kind as never } : {})
    },
    orderBy: [{ publicUrl: "desc" }, { createdAt: "desc" }],
    take: 120
  });

  return (
    <WorkspaceShell active="/assets" title="素材/工艺图库" subtitle="尺寸、色号、白墨、闪底和工艺截图集中浏览，图片可打开、复制链接和下载。">
      <form className="panel toolbar" action="/assets">
        <input name="q" defaultValue={q} placeholder="搜索图片标签、来源、OCR 文本" />
        <select name="kind" defaultValue={params.kind ?? ""}>
          <option value="">全部素材</option>
          <option value="MAIN_EXCEL_IMAGE">主表嵌入图</option>
          <option value="SECONDARY_PAGE_SCREENSHOT">二级页截图</option>
          <option value="DOC_SCROLL_SCREENSHOT">文档长截图</option>
          <option value="SECONDARY_PAGE_ASSET">二级页资产</option>
        </select>
        <button className="button" type="submit">搜索</button>
      </form>
      <div className="asset-grid">
        {assets.map((asset) => (
          <article className="asset-card" key={asset.id}>
            <a className="asset-image" href={asset.publicUrl ?? asset.filePath} target="_blank" rel="noreferrer">
              {asset.thumbnailUrl || asset.publicUrl ? <img src={asset.thumbnailUrl ?? asset.publicUrl ?? ""} alt={asset.label} /> : <span>待上传</span>}
            </a>
            <div className="asset-body">
              <span className="badge">{asset.kind}</span>
              <h2>{asset.label}</h2>
              <p>{asset.source}</p>
              <div className="asset-actions">
                {asset.publicUrl ? <a className="button secondary" href={asset.publicUrl} target="_blank" rel="noreferrer">打开</a> : null}
                {asset.publicUrl ? <a className="button secondary" href={asset.publicUrl} download>下载</a> : null}
              </div>
              {asset.publicUrl ? <input className="copy-input" readOnly value={asset.publicUrl} aria-label="复制图片链接" /> : null}
              {asset.ocrText ? (
                <details>
                  <summary>OCR 文本</summary>
                  <p>{asset.ocrText.slice(0, 900)}</p>
                </details>
              ) : null}
            </div>
          </article>
        ))}
        {assets.length === 0 ? <div className="empty-state">暂无素材，先运行图片导入。</div> : null}
      </div>
    </WorkspaceShell>
  );
}
