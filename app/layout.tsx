import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Affina アフィリエイト",
  description:
    "アフィリエイト特化型プラットフォーム。広告主とアフィリエイターをつなぎ、成果報酬を管理します。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-[radial-gradient(circle_at_top,#e0e7ff_0%,#f8fafc_35%,#f8fafc_100%)] antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}
