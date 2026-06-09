import Link from "next/link";
import { WorkspaceShell } from "@/components/workspace-shell";
import { getCurrentUser } from "@/lib/auth";
import { orderStatusLabels } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  const orders = await prisma.order.findMany({
    where: user?.role === "ADMIN" ? undefined : { userId: user?.id ?? "__anonymous__" },
    orderBy: { createdAt: "desc" },
    take: 40,
    include: { category: true, files: true, payments: true, shipments: true }
  });
  return (
    <WorkspaceShell active="/orders" title="我的订单" subtitle="查看订单状态、补交文件、跟进付款与发货。">
      <section className="panel">
        <div className="order-list">
          {orders.map((order) => (
            <Link className="order-card" href={`/orders/${order.id}`} key={order.id}>
              <div>
                <strong>{order.orderNo}</strong>
                <p>{order.category.name} / {order.quantity} 件 / {order.recipientName}</p>
              </div>
              <span className="badge">{orderStatusLabels[order.status]}</span>
              <small>文件 {order.files.length} 个 · 付款 {order.payments.length} 条 · 发货 {order.shipments.length} 条</small>
            </Link>
          ))}
          {orders.length === 0 ? <div className="empty-state">暂无订单，先从“开始下单”提交一个。</div> : null}
        </div>
      </section>
    </WorkspaceShell>
  );
}
