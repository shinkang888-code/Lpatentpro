import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LPatentPro — 특허 명세서 자동화 플랫폼",
  description: "KIPO · USPTO 특허 명세서를 자동으로 생성하는 AI 기반 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#0a0f1e] text-slate-200 antialiased">
        {children}
      </body>
    </html>
  );
}
