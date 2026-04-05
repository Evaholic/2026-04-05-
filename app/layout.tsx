import type { Metadata } from "next";
import type { ReactNode } from "react";
import { APP_EN_NAME, APP_NAME } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: `${APP_NAME} · ${APP_EN_NAME}`,
  description: "多模型交叉评估工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh-Hans">
      <body className="antialiased">{children}</body>
    </html>
  );
}
