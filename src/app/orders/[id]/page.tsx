import Link from "next/link";
import { notFound } from "next/navigation";
import { orderStatusLabels } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { category: true, files: true, payments: true, shipments: true, customQuote: true, notifications: true }
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">订单 {order.orderNo}</div>
        <Link href="/">返回首页</Link>
      </header>
      <section className="page split">
        <div className="card">
          <span className="badge">{orderStatusLabels[order.status]}</span>
          <h1>{order.category.name}</h1>
          <div className="list">
            <div className="row">
              <span>数量</span>
              <strong>{order.quantity}</strong>
            </div>
            <div className="row">
              <span>尺寸</span>
              <strong>{order.size || "待确认"}</strong>
            </div>
            <div className="row">
              <span>金额</span>
              <strong>{order.finalAmount ? `¥${order.finalAmount}` : "待人工报价"}</strong>
            </div>
            <div className="row">
              <span>收货信息</span>
              <strong>{order.recipientName}</strong>
            </div>
          </div>
        </div>
        <aside className="card">
          <h2>下一步</h2>
          <p className="muted">
            {order.status === "NEEDS_QUOTE"
              ? "管理员会补充报价，确认后进入付款。"
              : "请按线下付款说明付款，管理员确认后会推进生产。"}
          </p>
          <form className="form" action={`/api/orders/${order.id}/files`} method="post" encType="multipart/form-data">
            <div className="field">
              <label htmlFor="file">上传交稿文件</label>
              <input id="file" name="file" type="file" required />
            </div>
            <button className="button" type="submit">上传文件</button>
          </form>
          <div className="list">
            <h3>已上传文件</h3>
            {order.files.map((file) => (
              <div className="row" key={file.id}>
                <a href={file.url} target="_blank" rel="noreferrer">{file.originalName}</a>
                <span className="muted">{Math.round(file.size / 1024)} KB</span>
              </div>
            ))}
            {order.files.length === 0 ? <p className="muted">还没有上传文件。</p> : null}
          </div>
        </aside>
      </section>
    </main>
  );
}
