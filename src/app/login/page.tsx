import Link from "next/link";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = (await searchParams).next ?? "";
  return (
    <main className="login-screen">
      <section className="login-card">
        <div>
          <span className="brand-mark">M</span>
          <h1>登录 Moxi</h1>
          <p>客户可以提交订单和补交文件，管理员可以报价、确认付款和发货。</p>
        </div>
        <form className="form" action={`/api/auth/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} method="post">
          <div className="field">
            <label htmlFor="phone">手机号</label>
            <input id="phone" name="phone" required />
          </div>
          <div className="field">
            <label htmlFor="password">密码</label>
            <input id="password" name="password" type="password" minLength={6} required />
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="displayName">称呼</label>
              <input id="displayName" name="displayName" />
            </div>
            <div className="field">
              <label htmlFor="qq">QQ 号</label>
              <input id="qq" name="qq" />
            </div>
          </div>
          <button className="button primary-action" type="submit">登录或注册</button>
        </form>
        <Link href="/">返回下单台</Link>
      </section>
    </main>
  );
}
