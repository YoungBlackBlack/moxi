import Link from "next/link";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = (await searchParams).next ?? "";
  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">登录 / 注册</div>
        <Link href="/">返回首页</Link>
      </header>
      <section className="page narrow">
        <form className="card form" action={`/api/auth/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} method="post">
          <h1>进入下单系统</h1>
          <p className="muted">首次使用会自动注册。第一个注册用户会成为管理员。</p>
          <div className="field">
            <label htmlFor="phone">手机号</label>
            <input id="phone" name="phone" required />
          </div>
          <div className="field">
            <label htmlFor="password">密码</label>
            <input id="password" name="password" type="password" minLength={6} required />
          </div>
          <div className="field">
            <label htmlFor="displayName">称呼</label>
            <input id="displayName" name="displayName" />
          </div>
          <div className="field">
            <label htmlFor="qq">QQ 号</label>
            <input id="qq" name="qq" />
          </div>
          <button className="button" type="submit">登录或注册</button>
        </form>
      </section>
    </main>
  );
}
