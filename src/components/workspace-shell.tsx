import Link from "next/link";
import { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";

const navItems = [
  { href: "/", label: "开始下单", description: "选品类、看图、提交订单" },
  { href: "/orders", label: "我的订单", description: "查看状态和补文件" },
  { href: "/assets", label: "素材/工艺图库", description: "尺寸、色号、白墨、闪底" },
  { href: "/rules", label: "交稿规则", description: "文件名、邮箱、售后须知" },
  { href: "/admin", label: "管理员后台", description: "报价、付款、发货" }
];

export async function WorkspaceShell({
  active,
  title,
  subtitle,
  children
}: {
  active: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <main className="workspace">
      <aside className="sidebar">
        <Link className="sidebar-brand" href="/">
          <span className="brand-mark">M</span>
          <span>
            <strong>Moxi</strong>
            <small>定制下单系统</small>
          </span>
        </Link>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link className={active === item.href ? "nav-item active" : "nav-item"} href={item.href} key={item.href}>
              <span>{item.label}</span>
              <small>{item.description}</small>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          {user ? (
            <>
              <span>{user.displayName || user.phone}</span>
              <small>{user.role === "ADMIN" ? "管理员" : "客户"}</small>
            </>
          ) : (
            <Link className="button secondary" href="/login">登录 / 注册</Link>
          )}
        </div>
      </aside>
      <section className="workspace-main">
        <header className="workspace-header">
          <div>
            <h1>{title}</h1>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}
