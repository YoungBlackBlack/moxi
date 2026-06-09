import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AssetsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const q = (await searchParams).q?.trim();
  const assets = await prisma.mediaAsset.findMany({
    where: q
      ? {
          OR: [
            { label: { contains: q, mode: "insensitive" } },
            { source: { contains: q, mode: "insensitive" } },
            { ocrText: { contains: q, mode: "insensitive" } }
          ]
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 80
  });

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">素材与 OCR 库</div>
        <nav className="nav">
          <Link href="/">首页</Link>
          <Link href="/admin">后台</Link>
        </nav>
      </header>
      <section className="page">
        <form className="toolbar" action="/assets">
          <input name="q" defaultValue={q} placeholder="搜索图片标签、来源、OCR 文本" />
          <button className="button" type="submit">搜索</button>
        </form>
        <div className="grid">
          {assets.map((asset) => (
            <article className="card" key={asset.id}>
              <span className="badge">{asset.kind}</span>
              <h2>{asset.label}</h2>
              <p className="muted">{asset.source}</p>
              <p className="mono">{asset.filePath}</p>
              {asset.ocrText ? <details><summary>OCR 文本</summary><p className="muted">{asset.ocrText.slice(0, 700)}</p></details> : null}
            </article>
          ))}
          {assets.length === 0 ? <p className="muted">暂无素材，先运行 seed 导入元数据。</p> : null}
        </div>
      </section>
    </main>
  );
}
