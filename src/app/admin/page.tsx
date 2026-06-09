import Link from "next/link";
import { orderStatusLabels } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [orders, categories, assets] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { category: true, files: true, customQuote: true, shipments: true }
    }),
    prisma.category.count(),
    prisma.mediaAsset.count()
  ]);

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">管理员后台</div>
        <Link href="/">返回首页</Link>
      </header>
      <section className="page">
        <div className="hero">
          <span className="badge">运营控制台</span>
          <h1>订单审核、补价、付款和发货</h1>
          <p>当前已导入 {categories} 个品类、{assets} 个素材项。这里先提供 v1 的订单处理台。</p>
        </div>
        <div className="card">
          <h2>最近订单</h2>
          <div className="list">
            {orders.map((order) => (
              <div className="row" key={order.id}>
                <div>
                  <strong>{order.orderNo}</strong>
                  <div className="muted">
                    {order.category.name} / {order.quantity} / {order.recipientName}
                  </div>
                </div>
                <div>
                  <strong>{orderStatusLabels[order.status]}</strong>
                  <div className="muted">{order.finalAmount ? `¥${order.finalAmount}` : "待报价"}</div>
                </div>
              </div>
            ))}
            {orders.length === 0 ? <p className="muted">暂无订单。</p> : null}
          </div>
        </div>
      </section>
    </main>
  );
}
