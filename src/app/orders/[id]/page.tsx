import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/components/workspace-shell";
import { categoryHighlights, ruleBuckets } from "@/lib/content";
import { orderStatusLabels } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      category: { include: { submissionRules: true, priceRules: { take: 10 } } },
      files: true,
      payments: true,
      shipments: true,
      customQuote: true,
      notifications: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!order) notFound();
  const rules = ruleBuckets(order.category.submissionRules);
  const statusSteps = ["PENDING_PAYMENT", "PAID", "IN_REVIEW", "IN_PRODUCTION", "SHIPPED", "COMPLETED"];

  return (
    <WorkspaceShell active="/orders" title={`订单 ${order.orderNo}`} subtitle="查看状态、补交文件、确认报价和发货信息。">
      <div className="work-grid">
        <section className="panel">
          <div className="selected-summary">
            <div>
              <span className="badge">{orderStatusLabels[order.status]}</span>
              <h2>{order.category.name}</h2>
              <p>{order.customerNote || order.category.description}</p>
            </div>
            <div className="metric-card">
              <span>订单金额</span>
              <strong>{order.finalAmount ? `¥${order.finalAmount}` : "待人工报价"}</strong>
            </div>
          </div>
          <div className="timeline">
            {statusSteps.map((step) => (
              <span className={order.status === step ? "current" : ""} key={step}>{orderStatusLabels[step as keyof typeof orderStatusLabels]}</span>
            ))}
          </div>
          <div className="detail-grid">
            <p><strong>数量</strong>{order.quantity}</p>
            <p><strong>尺寸</strong>{order.size || "待确认"}</p>
            <p><strong>收货人</strong>{order.recipientName}</p>
            <p><strong>电话</strong>{order.recipientPhone}</p>
            <p className="wide"><strong>地址</strong>{order.address}</p>
          </div>
        </section>

        <aside className="side-stack">
          <section className="panel">
            <h2>上传交稿文件</h2>
            <p className="muted">支持 PSD / AI / ZIP / RAR / 7Z / 图片 / PDF。文件名建议包含 QQ 号。</p>
            <form className="form" action={`/api/orders/${order.id}/files`} method="post" encType="multipart/form-data">
              <input name="file" type="file" required />
              <button className="button" type="submit">上传文件</button>
            </form>
            <div className="file-list">
              {order.files.map((file) => (
                <a href={file.url} target="_blank" rel="noreferrer" key={file.id}>{file.originalName}<small>{Math.round(file.size / 1024)} KB</small></a>
              ))}
              {order.files.length === 0 ? <p className="muted">还没有上传文件。</p> : null}
            </div>
          </section>
          <section className="panel">
            <h2>规则提醒</h2>
            <div className="rule-list">
              {categoryHighlights(order.category).map((item) => <p key={item}>{item}</p>)}
              {rules.naming ? <p>文件命名：{rules.naming}</p> : null}
              {rules.email ? <p>交稿：{rules.email}</p> : null}
            </div>
          </section>
          <section className="panel">
            <h2>发货与通知</h2>
            <div className="file-list">
              {order.shipments.map((shipment) => <p key={shipment.id}>{shipment.carrier} {shipment.trackingNo}</p>)}
              {order.notifications.map((note) => <p key={note.id}><strong>{note.title}</strong><br />{note.body}</p>)}
            </div>
          </section>
        </aside>
      </div>
    </WorkspaceShell>
  );
}
