import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  searchParams
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const categories = await prisma.category.findMany({
    where: { enabled: true },
    orderBy: [{ mode: "asc" }, { sortOrder: "asc" }]
  });
  const selected = params.category ?? categories[0]?.id ?? "";

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">提交订单</div>
        <Link href="/">返回首页</Link>
      </header>
      <section className="page split">
        <form className="card form" action="/api/orders" method="post">
          <h2>订单信息</h2>
          <div className="field">
            <label htmlFor="categoryId">品类</label>
            <select id="categoryId" name="categoryId" defaultValue={selected} required>
              {categories.map((category) => (
                <option value={category.id} key={category.id}>
                  {category.mode === "SINGLE" ? "单走" : "拼车"} - {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="quantity">数量</label>
            <input id="quantity" name="quantity" type="number" min="1" defaultValue="50" required />
          </div>
          <div className="field">
            <label htmlFor="size">尺寸/规格</label>
            <input id="size" name="size" placeholder="例如 58mm圆形 / 10*14" />
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
            <input id="qq" name="qq" />
          </div>
          <div className="field">
            <label htmlFor="address">收货地址</label>
            <textarea id="address" name="address" required />
          </div>
          <div className="field">
            <label htmlFor="customerNote">工艺/闪底/色号/备注</label>
            <textarea id="customerNote" name="customerNote" placeholder="例如：闪底、包边、烫色色号、是否背卡等" />
          </div>
          <button className="button" type="submit">
            提交订单
          </button>
        </form>
        <aside className="card">
          <h3>下单前检查</h3>
          <div className="list muted">
            <div className="row">
              <span>文件命名</span>
              <strong>按品类模板</strong>
            </div>
            <div className="row">
              <span>交稿文件</span>
              <strong>PSD / AI / ZIP</strong>
            </div>
            <div className="row">
              <span>特殊尺寸</span>
              <strong>人工报价</strong>
            </div>
            <div className="row">
              <span>付款</span>
              <strong>线下确认</strong>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
