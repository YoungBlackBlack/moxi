import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const categories = await prisma.category.findMany({
    where: { enabled: true },
    orderBy: [{ mode: "asc" }, { sortOrder: "asc" }]
  });

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">Moxi 定制下单</div>
        <nav className="nav">
          <Link href="/order">开始下单</Link>
          <Link href="/admin">管理员后台</Link>
          <Link href="/api/health">健康检查</Link>
        </nav>
      </header>
      <section className="page">
        <div className="hero">
          <span className="badge">从报价表迁移到系统</span>
          <h1>把表格报价、交稿规则和素材库变成可下单的网站</h1>
          <p>
            客户选择品类、规格和工艺后获得报价；特殊尺寸进入人工报价；PSD/AI/压缩包等文件走上传校验，
            管理员在后台审核、记录线下付款、推进生产和发货。
          </p>
        </div>
        <div className="grid">
          {categories.map((category) => (
            <Link className="card" href={`/order?category=${category.id}`} key={category.id}>
              <span className="badge">{category.mode === "SINGLE" ? "单走" : "拼车"}</span>
              <h2>{category.name}</h2>
              <p className="muted">{category.description}</p>
            </Link>
          ))}
          {categories.length === 0 ? (
            <div className="card">
              <h2>还没有导入报价数据</h2>
              <p className="muted">部署后运行 seed/import，系统会导入当前 10 个品类和素材资料。</p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
