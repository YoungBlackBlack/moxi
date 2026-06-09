import Link from "next/link";
import { WorkspaceShell } from "@/components/workspace-shell";
import { requireAdmin } from "@/lib/auth";
import { orderStatusLabels } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const [orders, categories, assets] = await Promise.all([
    prisma.order.findMany({
      where: params.status ? { status: params.status as never } : undefined,
      orderBy: { createdAt: "desc" },
      take: 40,
      include: { category: true, files: true, customQuote: true, shipments: true, payments: true }
    }),
    prisma.category.count(),
    prisma.mediaAsset.count({ where: { publicUrl: { not: null } } })
  ]);
  const waitingQuote = orders.filter((order) => order.status === "NEEDS_QUOTE").length;
  const waitingPayment = orders.filter((order) => order.status === "PENDING_PAYMENT" || order.status === "QUOTED").length;

  return (
    <WorkspaceShell active="/admin" title="管理员后台" subtitle={`${admin.displayName || admin.phone}，今天重点处理报价、付款确认和发货。`}>
      <div className="stats-row">
        <div className="metric-card"><span>品类</span><strong>{categories}</strong></div>
        <div className="metric-card"><span>线上素材</span><strong>{assets}</strong></div>
        <div className="metric-card"><span>待报价</span><strong>{waitingQuote}</strong></div>
        <div className="metric-card"><span>待付款</span><strong>{waitingPayment}</strong></div>
      </div>
      <section className="panel">
        <div className="section-head">
          <span className="eyebrow">订单队列</span>
          <h2>按状态快速处理</h2>
        </div>
        <div className="status-filter">
          <Link href="/admin">全部</Link>
          {Object.entries(orderStatusLabels).map(([status, label]) => <Link href={`/admin?status=${status}`} key={status}>{label}</Link>)}
        </div>
        <div className="admin-list">
          {orders.map((order) => (
            <article className="admin-order-card" key={order.id}>
              <div>
                <Link href={`/orders/${order.id}`}><strong>{order.orderNo}</strong></Link>
                <p>{order.category.name} / {order.quantity} 件 / {order.recipientName}</p>
                <small>文件 {order.files.length} 个 · 付款 {order.payments.length} 条 · 发货 {order.shipments.length} 条</small>
              </div>
              <div className="admin-status">
                <span className="badge">{orderStatusLabels[order.status]}</span>
                <strong>{order.finalAmount ? `¥${order.finalAmount}` : "待报价"}</strong>
              </div>
              <form className="inline-form" action={`/api/admin/orders/${order.id}/quote`} method="post">
                <input name="amount" type="number" step="0.01" placeholder="人工报价" />
                <input name="note" placeholder="报价备注" />
                <button className="button secondary" type="submit">报价</button>
              </form>
              <form className="inline-form" action={`/api/admin/orders/${order.id}/payment`} method="post">
                <input name="amount" type="number" step="0.01" defaultValue={order.finalAmount?.toString()} placeholder="付款金额" />
                <input name="method" defaultValue="offline" />
                <button className="button secondary" type="submit">确认付款</button>
              </form>
              <form className="inline-form" action={`/api/admin/orders/${order.id}/shipment`} method="post">
                <input name="carrier" placeholder="快递公司" />
                <input name="trackingNo" placeholder="快递单号" />
                <button className="button secondary" type="submit">发货</button>
              </form>
            </article>
          ))}
          {orders.length === 0 ? <div className="empty-state">当前筛选下没有订单。</div> : null}
        </div>
      </section>
    </WorkspaceShell>
  );
}
