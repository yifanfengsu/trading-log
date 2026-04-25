import type { Metadata } from "next";

import AppShell from "@/components/layout/AppShell";
import AppProviders from "@/components/providers/AppProviders";

import "./globals.css";

export const metadata: Metadata = {
  title: "交易日志",
  description: "个人交易日志网站第一版静态 Dashboard 界面",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full">
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
