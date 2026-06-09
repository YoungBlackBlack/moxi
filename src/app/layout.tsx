import type { Metadata } from "next";
import "@/app/styles.css";

export const metadata: Metadata = {
  title: "Moxi 下单系统",
  description: "从报价表迁移而来的定制制品自助下单系统"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
