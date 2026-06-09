import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { orderStatusLabels } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdmin();
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
        <nav className="nav">
          <span>{admin.displayName || admin.phone}</span>
          <Link href="/assets">素材库</Link>
          <Link href="/">返回首页</Link>
        </nav>
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
              <div className="admin-row" key={order.id}>
                <div>
                  <Link href={`/orders/${order.id}`}><strong>{order.orderNo}</strong></Link>
                  <div className="muted">
                    {order.category.name} / {order.quantity} / {order.recipientName}
                  </div>
                  <div className="muted">文件 {order.files.length} 个 / 发货 {order.shipments.length} 条</div>
                </div>
                <div>
                  <strong>{orderStatusLabels[order.status]}</strong>
                  <div className="muted">{order.finalAmount ? `¥${order.finalAmount}` : "待报价"}</div>
                </div>
                <form className="inline-form" action={`/api/admin/orders/${order.id}/quote`} method="post">
                  <input name="amount" type="number" step="0.01" placeholder="人工报价" />
                  <input name="note" placeholder="备注" />
                  <button className="button secondary" type="submit">报价</button>
                </form>
                <form className="inline-form" action={`/api/admin/orders/${order.id}/payment`} method="post">
                  <input name="amount" type="number" step="0.01" defaultValue={order.finalAmount?.toString()} placeholder="付款金额" />
                  <input name="method" defaultValue="offline" />
                  <button className="button secondary" type="submit">确认付款</button>
                </form>
                <form className="inline-form" action={`/api/admin/orders/${order.id}/shipment`} method="post">
                  <input name="carrier" placeholder="快递" />
                  <input name="trackingNo" placeholder="单号" />
                  <button className="button secondary" type="submit">发货</button>
                </form>
              </div>
            ))}
            {orders.length === 0 ? <p className="muted">暂无订单。</p> : null}
          </div>
        </div>
      </section>
    </main>
  );
}
