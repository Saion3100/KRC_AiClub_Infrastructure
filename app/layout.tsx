import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI研究会",
  description: "AI研究会 エンタープライズ管理画面",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
